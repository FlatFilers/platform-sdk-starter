import * as chrono from 'chrono-node'
import _ from 'lodash'
import { utcToZonedTime, format } from 'date-fns-tz'
import parse from 'date-fns/parse'
import {
  stdlib,
  Field,
  DateField,
  Nullable,
  verifyEgressCycle,
  makeField,
  mergeFieldOptions,
} from '@flatfile/configure'
const { StringChainCast, FallbackCast } = stdlib.cast

type Locales = 'en' | 'fr' | 'nl' | 'ru' | 'de'

const getChronoDateCast = (locale: Locales) => {
  const ChronoStringDateCast = (raw: string | Date | null) => {
    if (raw === null || raw === undefined || raw === '') {
      return null
    } else if (typeof raw === 'string') {
      // use chrono.strict so that we dont get dates from strings like 'tomorrow', 'two weeks later'
      const parsedResult = chrono[locale].strict.parse(raw, undefined)

      const firstResult = parsedResult[0]
      if (firstResult === null || firstResult === undefined) {
        throw new Error(`'${raw}' returned no parse results`)
      }
      const d = firstResult.date()

      const resStart = firstResult.start
      const tzCertain = resStart.isCertain('timezoneOffset')
      const hourCertain = resStart.isCertain('hour')
      const tzHours = d.getTimezoneOffset() / 60

      if (!resStart.isCertain('year')) {
        throw new Error(
          `couldn't parse ${raw} with a certain year.  Please use an unambiguous date format`
        )
      }

      if (!resStart.isCertain('month')) {
        throw new Error(
          `couldn't parse ${raw} with a certain month.  Please use an unambiguous date format`
        )
      }

      if (!resStart.isCertain('day')) {
        throw new Error(
          `couldn't parse ${raw} with a certain day.  Please use an unambiguous date format`
        )
      }

      // we want all dates to end up in the UTC timezone, and when we
      // don't have an exact time, default to 00:00:00
      if (hourCertain === false && tzCertain === false) {
        //js dates are local TZ by default, we need to work around that
        //in this case, set the hour to offset the timezone offset, that will bring the time 00:00:00 GMT
        d.setHours(-1 * tzHours)
      } else if (hourCertain === true && tzCertain === false) {
        // if chrono was able to determine the hour, but not the timezone,
        // back out the timezone offset from the hours stored on d
        d.setHours(d.getHours() - tzHours)
      } else if (hourCertain === false && tzCertain === true) {
        //I don't know how this parsing result would be possible we should
        //probably resort to 00:00:00 GMT, but to be extra strict, until
        //we have more information, we'll throw an error
        throw new Error(
          `Don't know how to parse for hourCertain === false && tzCertain === true for ${raw}`
        )
      } else if (hourCertain === true && tzCertain === true) {
        //we were able to absolutely determin the hour and timezone, nothing to do here
        return d
      }

      return d
    } else if (_.isDate(raw)) {
      return raw
    } else {
      throw new Error(
        `unexpected type in ChronoStringDateCast for val ${raw} typeof ${typeof raw}`
      )
    }
  }
  return ChronoStringDateCast
}

/**
 * GMTFormatDate formats all dates relative to Greenwich Mean Time.
 * This means that the same format string will be regardless of the
 * system timezone.
 */

export const GMTFormatDate = (val: Date, formatString: string): string => {
  const prevailingTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const d = new Date()
  const tzHours = d.getTimezoneOffset() / 60
  const val2 = new Date(val)
  val2.setHours(val2.getHours() + tzHours)
  const utcDate = utcToZonedTime(val2, prevailingTimezone)
  return format(utcDate, formatString)
}

export const ChronoDateCast = StringChainCast(getChronoDateCast('en'))

const egressDebug = (field: Field<any>, castVal: any) => {
  //cast / egressFormat cycle must converge to the same value,
  //otherwise throw an error because the user will lose dta
  const ef = field.options.egressFormat
  if (ef === false) {
    console.log('egressDebug called on a field without egressFormat set')
    return
  }

  const egressResult = ef(castVal)
  try {
    const recast = field.options.cast(egressResult)
    console.log(
      `castVal ${castVal} becomes ${egressResult} after egressFormat, which when cast gives ${recast}`
    )
  } catch (e: any) {
    console.log(
      `castVal ${castVal} becomes ${egressResult} after egressFormat, casting again throws an error of ${e}`
    )
  }
}

export const SmartDateField = makeField<
  Date,
  { formatString?: string; extraParseString?: string; locale?: Locales }
>(DateField({}), {}, (mergedOpts, passedOptions) => {
  const defaultedPassedOptions = {
    ...{
      formatString: "yyyy-MM-dd'T'HH:mm'Z'",
      extraParseString: undefined,
      locale: 'en',
    },
    ...passedOptions,
  }

  const { formatString, extraParseString, locale } = defaultedPassedOptions

  if (_.keys(passedOptions).includes('cast')) {
    throw new Error(
      `Cannot instantiate this field with an overridden cast function`
    )
  }
  if (_.keys(passedOptions).includes('egressFormat')) {
    throw new Error(
      `Cannot instantiate this field with an overridden egressFormat function`
    )
  }

  //@ts-ignore
  const localeCast = getChronoDateCast(locale)

  let cast
  if (extraParseString) {
    cast = FallbackCast(
      localeCast,
      StringChainCast((val: string | Date): Nullable<Date> => {
        if (typeof val === 'string') {
          const parsed = parse(val, extraParseString, new Date())
          const reformatted = format(parsed, 'yyyy-MM-dd')
          const final = ChronoDateCast(reformatted)
          return final
        } else if (_.isDate(val)) {
          return val
        } else {
          throw new Error(`unexpected type for val ${val} typeof ${typeof val}`)
        }
      })
    )
  } else {
    cast = localeCast
  }

  const egressFormat = (val: Date | string): string => {
    if (typeof val === 'string') {
      return val
    }
    try {
      const output = GMTFormatDate(val, formatString)
      return output
    } catch (e: any) {
      console.log(
        `error calling GMTFormatDate on ${val} of type ${typeof val} with formatString of ${formatString}. Err of ${e}`
      )
      //trying to return something that is obviously an error
      //@ts-ignore
      return NaN
    }
  }
  const newOpts = {
    cast,
    egressFormat,
  }
  const f = new Field(mergeFieldOptions(mergedOpts, newOpts))
  const testEgressCycle = (d: Date) => {
    try {
      //@ts-ignore
      if (!verifyEgressCycle(f, d)) {
        egressDebug(f, d)
        throw new Error(
          `Error: instantiating a SmartDateField with a formatString of ${formatString}, and locale of '${locale}'.  will result in data loss or unexpected behavior`
        )
      }
    } catch (e: any) {
      egressDebug(f, d)
      throw new Error(
        `Error: instantiating a SmartDateField with a formatString of ${formatString}, and locale of '${locale}'.  will result in data loss or unexpected behavior`
      )
    }
  }
  //pretty much any date, nothing notable.  ChronoDateCast is fine here,  we just want a date
  testEgressCycle(ChronoDateCast('2009-02-24T00:00:00.000Z') as Date)
  //this will pick up month/date ambiguity... and its interaction between locale and formatString
  testEgressCycle(ChronoDateCast('2009-02-05T00:00:00.000Z') as Date)

  return f
})
