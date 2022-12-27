import {
    Message,
  } from '@flatfile/configure'

import { regex_ddmmyyyy, validDate } from './regex';
import * as datefns from 'date-fns';
import { FlatfileRecord } from '@flatfile/hooks';

 /** Checks if value is falsey - returns boolean*/
const isNil = (val: any)=> val === null || val === undefined || val === "";

 /** Checks if value is truthy - returns boolean*/
const isNotNil = (val: any) => !isNil(val);


 /**Compute Field Hook that converts dates from a few known formats to YYYY-MM-DD*/
const formatDate = 
(format: string) =>
    (value: string): string => {
        var cleanedDate = value as string
        if (validDate.test(value)){
          return value
        }
        if (regex_ddmmyyyy.test(value)) {
            cleanedDate = cleanedDate.replace(/(\d{2})(\d{2})(\d{4})/, '$3-$2-$1')
        }
        try {
            return datefns.format(new Date(cleanedDate), format)
        } catch (err) {
            return value
        }
 }


/** Validates Field Hook that validate that a Date in the YYYY-MM-DD format */
const validateDate = (value: string) => {
  const formatter = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
  if (!formatter.test(value)) {
    return [
      new Message(
        'Date must be entered in the proper format',
        'error',
        'validate'
      ),
    ]
  }
}


/** Validates Field Hook that validates a field matches a given regex value.  */
const validateRegex = (value: string, regex: RegExp, errorMessage: string) => {
  if (!regex.test(value)) {
    return [
      new Message(
        errorMessage,
        'error',
        'validate'
      ),
    ]
  }
}

/** Validates Field Hook that validates a field matches a given regex value.  */
const validateRegexThrowErrorOnMatch = (value: string, regex: RegExp, errorMessage: string) => {
  if (regex.test(value)) {
    return [
      new Message(
        errorMessage,
        'error',
        'validate'
      ),
    ]
  }
}


/** Validates Field Hook that validates a field matches a given regex value.  */
const validateRegexIf = (record: FlatfileRecord, value: string, conditional: string, target: string, regex: RegExp, errorMessage: string) => {
  if (record.get(conditional) === target){
    const val = record.get(value)
    if (!regex.test(String(val))) {
      record.addError('portfolioOwner', 'must be first last')
  }
}
}


/** Generates Field value for reference id based on a static value and another fields value  */
const createReferenceId = (staticValue: string, field: string, referenceIdField: string, record: FlatfileRecord) => {
    let fieldValue = record.get(field)
    if (isNotNil(fieldValue) && typeof fieldValue === 'string'){
          fieldValue = fieldValue.toUpperCase()
          fieldValue = fieldValue.replace(/ /g,"_");
          const refIdValue = staticValue + "_" + fieldValue
          record.set(referenceIdField, refIdValue)
    } 
}

/** Sets Value of Target Field when Haystack Field is a certain value or set of values */
const SetValWhen = (
	haystackField: string, needleValues: string | string[], targetField: string, val: any) => {
	return (record: FlatfileRecord) => {
		const [a, b] = [record.get(haystackField), record.get(targetField)]
		let searchVals: string[];
		if (Array.isArray(needleValues)) {
			searchVals = needleValues
		} else {
			searchVals = [needleValues]
		}
		//@ts-ignore
		if (searchVals.includes(a)) {
			record.set(targetField, val)
			//record.addWarning(targetField, `cleared '${targetField}', was ${b}`)
		}
		return record
	}
}


/** Conditionally requires Target Field if Switch Field is a certain value or set of values */
const RequiredMappingTable = (record: FlatfileRecord, targetField: string) => {
		const targetValue = record.get(targetField)
    console.log(targetValue)
    if (targetValue === null){
      record.addError(targetField, ` '${targetField}' required`)
    }
		return record
	}


/** Conditionally requires Target Field if Switch Field is a certain value or set of values */
const RequiredWhen = (
	switchField: string, switchVals: string | string[], targetField: string) => {
	return (record: FlatfileRecord) => {
		const [a, b] = [record.get(switchField), record.get(targetField)]
		let searchVals: string[];
		if (Array.isArray(switchVals)) {
			searchVals = switchVals
		} else {
			searchVals = [switchVals]
		}
		//@ts-ignore
		if (searchVals.includes(a)) {
		  if(b === null) {
		    record.addError(targetField, ` '${targetField}' required`)
		  }
		}
		return record
	}
}


/** Conditionally requires Target Field if Switch Field is a certain value or set of values. Target value is set to null otherwise */
const RequiredWhenOrNull = (
	switchField: string, switchVals: string | string[], targetField: string) => {
	return (record: FlatfileRecord) => {
		const [a, b] = [record.get(switchField), record.get(targetField)]
		let searchVals: string[];
		if (Array.isArray(switchVals)) {
			searchVals = switchVals
		} else {
			searchVals = [switchVals]
		}
		//@ts-ignore
		if (searchVals.includes(a)) {
		  if(b === null) {
		    record.addError(targetField, ` '${targetField}' required`)
		  }
		}
    else {
      record.set(targetField, null)
      //record.addWarning(targetField, ` '${b}' was cleared from this cell due to ${switchField} having value ${a}.`)
    }
		return record
	}
}


/**  Container for running multiple function is recordCompute */
const RCChain = (...funcs:any) => {
  return (record: FlatfileRecord) => {
    for (const func of funcs) {
      func(record)
    }
  }
}


/**  Validate number value range */
const ValidateNumberValueRange = (record: number, min: number, max: number) => {
  if (record < min || record > max) {
    return [
      new Message(
        `Number must be between ${min} and ${max}`,
        'error',
        'validate'
      ),
    ]
  }
}



//Export Values
export {
  isNil, 
  isNotNil, 
  formatDate, 
  validateDate, 
  validateRegex, 
  validateRegexIf,
  createReferenceId, 
  SetValWhen, 
  RequiredWhen, 
  RCChain,
  RequiredWhenOrNull,
  ValidateNumberValueRange,
  RequiredMappingTable,
  validateRegexThrowErrorOnMatch
};