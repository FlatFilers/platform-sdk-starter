import { makeInterpreter, NestedIns } from '@flatfile/expression-lang'
import { Message } from '@flatfile/configure'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { Sheet } from '@flatfile/configure'
import * as _ from 'lodash'

export type TRecordStageLevel =
  | 'compute'
  | 'validate'
  | 'apply'
  | 'other'


//I would love message to be able to accept some type of format string
export const error = (message: string, stage: TRecordStageLevel = 'validate') => {
  // I don't like returning a list here, not sure where to deal with scalar/list
  return [new Message(message, 'error', stage)]
}
export const warn = (message: string, stage: TRecordStageLevel = 'validate') => {
  return [new Message(message, 'warn', stage)]
}
export const info = (message: string, stage: TRecordStageLevel = 'validate') => {
  return [new Message(message, 'info', stage)]
}


const match = (records: FlatfileRecord[], matchSpec: object) => {
  return _.filter(records, (rec: FlatfileRecord) =>
    _.isMatch(rec.originalValue, matchSpec)
  )
}

const nonUnique = (records: FlatfileRecord[], column:string) => {
  const groups = _.groupBy(records, (rec) =>
    rec.get(column))
  //_.forEach(groups, (group: FlatfileRecord[], gbKey) => {
  const groupSets = _.map(groups, (group: FlatfileRecord[]) => group)
  const nonUniqueSets = _.filter(groupSets,
	   (groupedBy:FlatfileRecord[]) => {
	     if (groupedBy.length > 1) {
	       return true}
	     return false})
  return _.flatten(nonUniqueSets)
}




const groupByCompute = (
  gbArgs: any,
  sheet: Sheet<any>,
  records: FlatfileRecords<any>
) => {
  const { groupBy, expression, destination } = gbArgs
  const recs = records.records
  const groups: Record<string, FlatfileRecord[]> = _.groupBy(recs, (rec) =>
    rec.get(groupBy)
  )

  _.forEach(groups, (group: FlatfileRecord[], gbKey) => {
    const res = simpleInterpret(expression, { sheet, group })
    for (const rec of group) {
      //@ts-ignore
      rec.set(destination, res)
    }
  })
  return records
}


const sumField = (records: FlatfileRecord<any>[], field: string) =>  {
    //@ts-ignore
    const allVals = records.map((rec) => rec.get(field))
    const presentVals =   _.remove(allVals)
    //@ts-ignore
    const numberVals = presentVals.map((val:string|number) => parseFloat(val))
    const sum_ = numberVals.reduce((a,b) => a+b)
    return sum_
}


const groupConstraintRow = (
  rowFilterExpr: NestedIns,
  actionExpr: NestedIns,
  origField: string,
  group: any
) => {
  // how to pass along variables from where this is evaluated???
  const appliccableRows = sheetInterpret(rowFilterExpr, {
    group,
  }) as FlatfileRecord[]
  //some typeguard here
  if (Array.isArray(appliccableRows) && appliccableRows.length > 0) {
    const messagesToApply = sheetInterpret(actionExpr, {
      group,
      matchResult: appliccableRows,
    }) as Message[]
    if (Array.isArray(messagesToApply)) {
      appliccableRows.map((record: FlatfileRecord) => {
        messagesToApply.map((m) => {
	  //@ts-ignore
          record.pushInfoMessage(origField, m.message, m.level, 'validate')
        })
      })
    }
  }
  return appliccableRows
}


/*
RecordPick - takes a recordGroup and field name, returns a list of values for that field
Pick - takes a list of objects and a field name, returns a list of values for that field
JSONLoad - calls JSON.parse on a string returns the object
SortedBy - takes an array of objects, sorts them by field name
First - returns the first element of an array
Get - returns a field from an object
Without - performs set diff on two lists of primitives
strConcat - concatates objects/strings into a  string
ArrayEquals - verifies that two arrays are equal (edited)
*/

const recordPick = (records:FlatfileRecord<any>[], fieldName:string, defaultVal:any=undefined ) => {
  return records.map((rec) => {
    const v = rec.get(fieldName)
    if( v === null) {
      return defaultVal
    }
    return v
  })
}

const pick = (objs:Record<string, any>[], fieldName:string ) => {
  if(!_.isArray(objs)) {
    //once again a hack
    return objs[fieldName]
  }
  return objs.map((o) => o[fieldName])
}

const JSONLoad = (str:string) => {
  try {
    if (_.isArray(str)) {
      //this is a hack
      //@ts-ignore
      return str.map(JSON.parse)
    }
    return JSON.parse(str)
  }
  catch (e:any) {return {}}
}

const JSONStringify = (obj:any) => JSON.stringify(obj)

//@ts-ignore
const sortedBy = (objs:Record<string, any>[], field:string, direction:string) =>  _.orderBy(objs, [field], [direction])

const first = (objs:any[]) => objs[0]

const get = (rec:FlatfileRecord<any>, field:string, defaultVal:any=undefined) => {
  try {
    rec.get(field)
  } catch (e:any) {
    return defaultVal
  }
}
const without = (full:any[], subtrahend:any[]) => _.without(full, ...subtrahend)
const strConcat = (a:any, b:any) => a.toString() + b.toString()
const arrayEquals = _.isEqual

export const debug = (expr: NestedIns) => {
  console.log('debug', expr)
  return expr
}

const do_ = (...exprs: any) => exprs[exprs.length -1]

//@ts-ignore
const simpleInterpret = makeInterpreter({
  sumField, groupConstraintRow, nonUnique, error, match, 'do': do_,
  recordPick, pick, JSONLoad, JSONStringify, sortedBy, first,
  //@ts-ignore 
  get, 
  debug,
  without, strConcat, arrayEquals   })

export const sheetInterpret = makeInterpreter({
  error,
  match,
  groupByCompute,
  groupConstraintRow,
  nonUnique,
  debug,
    recordPick, pick, JSONLoad, JSONStringify, sortedBy, first,
  //@ts-ignore 
  get, 
  without, strConcat, arrayEquals  
})

