import * as chrono from 'chrono-node'
import { format } from 'date-fns'
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
  const parsedResult = chrono.strict.parse(raw, undefined)

  //const parsedDebug = chrono.strict.parse(raw)
  //console.dir(parsedDebug)
  if (parsedResult === null) {
    throw new Error(`'${raw}' parsed to 'null' which is invalid`)
  }
  if (parsedResult === undefined) {
    throw new Error(`'${raw}' parsed to undefined which is invalid`)
  }
  //folloiwng code necessary for JS compatability

  const firstResult = parsedResult[0]
  if (firstResult === null || firstResult === undefined) {
    throw new Error(`'${raw}' returned no parse results`)
  }

  const d = firstResult.date()
  // console.log("firstResult", firstResult)
  // console.log("firstResult", firstResult.start.isCertain('hour'))
  const tzHours = d.getTimezoneOffset() / 60
  if (firstResult.start.isCertain('hour') === false) {
    // how to remove any implied parts of a date, especially
    // timezones... which seem to default to the local timezone
    //by default chrono sets a time of 12,  this code works, but I'm not sure why
    d.setHours(-1 * tzHours)
    //d.setHours(-5)

    //you can call `d.getTimezonOffset()` but you can't set it
    
    //  I think I might be onto  something  here
    // a.setHours(a.getHours() - (a.getTimezoneOffset()/60)) 
  } else {
    d.setHours(d.getHours() - tzHours)
  }
  return d
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

  let fString = (passedOptions.fString) ? passedOptions.fString : "yyyy-MM-dd'T'HH:mm:ss'Z'"
  fullOpts.egressFormat = (val:Date):string => format(val, fString)

  const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
  return field
}


export const SmartDateField = DateField
