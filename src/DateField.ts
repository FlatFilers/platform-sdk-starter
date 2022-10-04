import * as chrono from 'chrono-node'
import { Field, FullBaseFieldOptions } from '@flatfile/configure/stdlib/CastFunctions'

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
type PartialBaseFieldsAndOptions = Partial<FullBaseFieldOptions<Date, O>>
export DateField = (options?: string | PartialBaseFieldsAndOptions) => {

  const field = new Field<Date, O>(fullOpts as FullBaseFieldOptions<Date, O>)
}
