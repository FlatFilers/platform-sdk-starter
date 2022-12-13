
import { GenericFieldOptions } from '@flatfile/configure'

export const GenericDefaults: GenericFieldOptions = {
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


// only call second function if we can first get to a string, if
// stringCast returns null, don't call second function, just return
// null.  saves a lot of repetetive testing
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


export const StringNumberCast = (raw: string): number | null => {
  const strippedStr = raw.replace(',', '')
  const num = Number(strippedStr)

  if (isFinite(num)) {
    return num
  } else {
    throw new Error(`'${raw}' parsed to '${num}' which is non-finite`)
  }
}


export const NumberCast = StringCastCompose(StringNumberCast)

/*
export const identity = (val:any) => val
export const NumberCast = StringCastCompose(
  StringNumberCast,
  // read the following as a list of predicates to apply to test
  // against the raw value, if any pass, then apply the second
  // function.  A poormans pattern matching.  These functions return
  // instead of the first cast function passed in
  [[(raw:any) => typeof raw === 'number', identity]])
*/

