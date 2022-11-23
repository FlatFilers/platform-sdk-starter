import * as chrono from 'chrono-node'
import { utcToZonedTime, format, formatInTimeZone } from 'date-fns-tz'
//import { Field, GenericDefaults, SchemaILField, FieldHookDefaults, FullBaseFieldOptions } from '@flatfile/configure/stdlib/CastFunctions'
import { Field, GenericFieldOptions, FieldHookDefaults, FullBaseFieldOptions } from '@flatfile/configure'
import { SchemaILField } from '@flatfile/schema'

const GenericDefaults: GenericFieldOptions = {
  description: '',
  label: '',
  type: 'string',
  primary: false,
  required: false,
  unique: false,
  stageVisibility: {
    mapping: true,
    review: true,
    export: true,
  },
  annotations: {
    default: false,
    defaultMessage: 'This field was automatically given a default value of',
    compute: false,
    computeMessage: 'This value was automatically reformatted - original data:',
  },
}


export const StringCast = (raw: string | undefined | null): string | null => {
  if (typeof raw === 'undefined') {
    return null
  } else if (raw === null) {
    return null
  } else {
    if (typeof raw === 'string') {
      if (raw === '') {
        return null
      }
    }
    return raw
  }
}

export const StringCastCompose = (otherFunc: (raw: string) => any) => {
  const innerCast = (raw: string | undefined | null): string | null => {
    const stringVal = StringCast(raw)
    if (stringVal === null) {
      return null
    }
    return otherFunc(stringVal)
  }
  return innerCast
}

const ChronoStringDateCast = (raw:string) => {
  // use chrono.strict so that we dont get dates from strings like 'tomorrow', 'two weeks later'
  const parsedResult = chrono.strict.parse(raw, undefined)

  // if (parsedResult === null) {
  //   throw new Error(`'${raw}' parsed to 'null' which is invalid`)
  // }
  // if (parsedResult === undefined) {
  //   throw new Error(`'${raw}' parsed to undefined which is invalid`)
  // }

  const firstResult = parsedResult[0]
  if (firstResult === null || firstResult === undefined) {
    throw new Error(`'${raw}' returned no parse results`)
  }
  const d = firstResult.date()

  const tzCertain = firstResult.start.isCertain('timezoneOffset')
  const hourCertain = firstResult.start.isCertain('hour')
  const tzHours = d.getTimezoneOffset() / 60

  // we want all dates to end up in the UTC timezone, and when we
  // don't have an exact time, default to 00:00:00
  if (hourCertain === false && tzCertain === false) {
    //js dates are local TZ by default, we need to work around that
    //in this case, set the hour to offset the timezone offset, that will bring the time 00:00:00 GMT
    d.setHours(-1 * tzHours)
  } else if ((hourCertain === true)  && (tzCertain === false)) {
    // if chrono was able to determine the hour, but not the timezone,
    // back out the timezone offset from the hours stored on d
    d.setHours(d.getHours() - tzHours)
  }
  else if (hourCertain === false && tzCertain === true ) {
    //I don't know how this parsing result would be possible we should
    //probably resort to 00:00:00 GMT, but to be extra strict, until
    //we have more information, we'll throw an error
    //d.setHours(-1 * tzHours)
    throw new Error(`Don't know how to parse for hourCertain === false && tzCertain === true for ${raw}`)
  } else if (hourCertain === true && tzCertain === true) {
    //we were able to absolutely determin the hour and timezone, nothing to do here
    return d
  }

  
  return d
}

export const zFormat = (val:Date, fString:string):string => {
  const prevailingTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const d = new Date()
  const tzHours = d.getTimezoneOffset() / 60
  const val2 = new Date(val)
  val2.setHours(val2.getHours() + tzHours)
  const utcDate = utcToZonedTime(val2, prevailingTimezone)
  return format(utcDate, fString)
}


export const ChronoDateCast = StringCastCompose(ChronoStringDateCast)


type O = Record<string, any>
type T = Date
type PartialBaseFieldsAndOptions = Partial<FullBaseFieldOptions<T, O>> & {fString?:string}

export const DateField = (options?: string | PartialBaseFieldsAndOptions) => {
    // if labelOptions is a string, then it is the label
  let passedOptions:PartialBaseFieldsAndOptions 
  if (options === undefined) {
    passedOptions = {}
  }
  else if (typeof options === 'string') {
    passedOptions = {label: options}
  } else {
    passedOptions = options
  }

    const passedStageVisibility = (passedOptions as SchemaILField)
      ?.stageVisibility

    const stageVisibility = {
      ...GenericDefaults.stageVisibility,
      ...passedStageVisibility,
    }

    const passedAnnotations = (passedOptions as SchemaILField)?.annotations

    const annotations = {
      ...GenericDefaults.annotations,
      ...passedAnnotations,
    }

    const fullOpts = {
      ...GenericDefaults,
      ...FieldHookDefaults<T>(),
      cast:ChronoDateCast, 
      ...passedOptions,
      stageVisibility,
      annotations,
    }

  let fString = (passedOptions.fString) ? passedOptions.fString : "yyyy-MM-dd'T'HH:mm:ss.000'Z'"
  //let fString = (passedOptions.fString) ? passedOptions.fString : "yyyy-MM-dd"

  fullOpts.egressFormat = (val:Date|string):string => {
    if (typeof val === 'string') {
      return val
    }
    try {
      return zFormat(val, fString)
    } catch (e:any) {
      console.log(`error formatting ${val} typeof ${typeof val}`)
      console.log(e)
      //@ts-ignore 
      return NaN
    }
    
  }

  const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
  return field
}


export const SmartDateField = DateField
