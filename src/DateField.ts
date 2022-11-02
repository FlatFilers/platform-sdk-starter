import * as chrono from 'chrono-node'
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
  //const parsed = chrono.parseDate(raw)
  //const parsed = chrono.parse(raw )
  const parsed = chrono.strict.parseDate(raw)
  //const parsedDebug = chrono.strict.parse(raw)
  //console.dir(parsedDebug)
  if (parsed === null) {
    throw new Error(`'${raw}' parsed to 'null' which is invalid`)
  }

  return parsed
}
export const ChronoDateCast = StringCastCompose(ChronoStringDateCast)


type O = Record<string, any>
type T = Date
type PartialBaseFieldsAndOptions = Partial<FullBaseFieldOptions<T, O>>
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

  const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
  return field
}

