import * as chrono from 'chrono-node'
import { Field, GenericDefaults, SchemaILField, FieldHookDefaults, FullBaseFieldOptions } from '@flatfile/configure/stdlib/CastFunctions'

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
  return chrono.parseDate(raw)
}
export const ChronoDateCast = StringCastCompose(ChronoStringDateCast)


type O = Record<string, any>
type T = Date
type PartialBaseFieldsAndOptions = Partial<FullBaseFieldOptions<T, O>>
export const DateField = (options?: string | PartialBaseFieldsAndOptions) => {
    // if labelOptions is a string, then it is the label
    const label = typeof options === 'string' ? options : undefined
    // if options is an object, then it is the options
    const passedOptions =
      (typeof options !== 'string' ? options : options) ?? {}

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
      ...(label ? { label } : { ...passedOptions }),
      stageVisibility,
      annotations,
    }

  const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
  return field
}


