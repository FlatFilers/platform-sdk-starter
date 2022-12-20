import * as chrono from 'chrono-node'
import _ from 'lodash'
import { utcToZonedTime, format } from 'date-fns-tz'
import parse from 'date-fns/parse'
import { stdlib, Field, DateField, Nullable, makeField, mergeFieldOptions } from '@flatfile/configure'
const { StringChainCast, FallbackCast }  = stdlib.cast

const ChronoStringDateCast = (raw: string | Date) => {
  if (typeof raw === 'string') {
    // use chrono.strict so that we dont get dates from strings like 'tomorrow', 'two weeks later'
    const parsedResult = chrono.strict.parse(raw, undefined)

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

    //console.log(firstResult)
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
      //console.log(`chronoDate cast recieved ${raw} returning ${d} ${typeof d}`)
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

export const zFormat = (val: Date, fString: string): string => {
  const prevailingTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const d = new Date()
  const tzHours = d.getTimezoneOffset() / 60
  const val2 = new Date(val)
  val2.setHours(val2.getHours() + tzHours)
  const utcDate = utcToZonedTime(val2, prevailingTimezone)
  return format(utcDate, fString)
}

export const ChronoDateCast = StringChainCast(ChronoStringDateCast)

export const SmartDateField = makeField<
  Date,
  { fString?: string; extraParseString?: string }
>(
  DateField({}),
  { fString: "yyyy-MM-dd'T'HH:mm:ss.000'Z'" },
  (mergedOpts, passedOptions) => {
    //I wish our types did this for us.
    if (_.keys(passedOptions).includes('cast')) {
      throw new Error(
        `Cannot instantiate this field with an overridden cast function`
      )
    }
    if (_.keys(passedOptions).includes('egressFormat')) {
      throw new Error(
        `Cannot instantiate this field with an overridden cast function`
      )
    }
    const extraParseString = passedOptions.extraParseString
      ? passedOptions.extraParseString
      : false

    let cast
    if (extraParseString) {
      cast = FallbackCast(
        ChronoDateCast,
        StringChainCast((val: string | Date): Nullable<Date> => {
          if (typeof val === 'string') {
	    const parsed = parse(val, extraParseString, new Date())
	    const reformatted = format(parsed, 'yyyy-MM-dd')
            const final =  ChronoDateCast(reformatted)
	    return final
          } else if (_.isDate(val)) {
            return val
          } else {
            throw new Error(
              `unexpected type for val ${val} typeof ${typeof val}`
            )
          }
        })
      )
    } else {
      cast = ChronoDateCast
    }

    const egressFormat = (val: Date | string): string => {
      if (typeof val === 'string') {
        return val
      }
      try {
        return zFormat(val, passedOptions.fString as string)
      } catch (e: any) {
        console.log(`error formatting ${val} typeof ${typeof val}`)
        console.log(e)
        //@ts-ignore
        return NaN
      }
    }
    const newOpts = {
      cast,
      egressFormat,
    }
    return new Field(mergeFieldOptions(mergedOpts, newOpts))
  }
)
