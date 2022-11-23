import * as chrono from 'chrono-node'
import { ChronoDateCast, DateField } from './DateField'
//import { format } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'

const zFormat = (val:Date, fString:string):string => {
  const prevailingTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const d = new Date()
  const tzHours = d.getTimezoneOffset() / 60
  const val2 = new Date(val)
  val2.setHours(val2.getHours() + tzHours)
  const utcDate = utcToZonedTime(val2, prevailingTimezone)
  return format(utcDate, fString)
}

const Feb17DstringSimple = '02/17/2009'
const Feb17DstringComplete = '2009-02-17T00:00:00.000Z'
// const Feb17CD = ChronoDateCast(Feb17DstringSimple)
const Feb17D = new Date(Feb17DstringComplete)

describe('Cast Function tests ->', () => {
  test('basic date equivalence', () => {
    expect(ChronoDateCast(Feb17DstringSimple)).toStrictEqual(Feb17D)
    expect(ChronoDateCast(Feb17DstringComplete)).toStrictEqual(Feb17D)
  })

  // test('egress formatting', () => {
  //   const dString = '2009-02-17T00:00:00.000Z'
  //   const d = new Date(dString)
  //   console.log(dString)
  //   console.log(d)
  //   // console.log(format(d, 'yyyy-MM-dd  HH', { timeZone: 'Z'}))
  //   // console.log(format(d, 'yyyy-MM-dd  HH', { timeZone: 'America/New_York'}))
  //   // console.log(format(d, 'yyyy-MM-dd  HH', { timeZone: 'Africa/Johannesburg'}))
  //   console.log(zFormat(d, 'yyyy-MM-dd HH'))
  //   expect(zFormat(d, 'yyyy-MM-dd HH')).toBe('2009-02-17 00')



  //   //console.log(format(d, 'd.M.yyyy HH:mm:ss.SSS \'GMT\' XXX (z)'))
  // })

  // test('date-fns tz stuff', () => {
  //   const dString = '2009-02-17T00:00:00.000Z'
  //   const d = new Date(dString)

  //   // Set the date to "2018-09-01T16:01:36.386Z"
  //   // console.log(zonedTimeToUtc(d, 'Europe/Berlin'))
  //   // console.log(zonedTimeToUtc(d, 'America/New_York'))
    
  //   const utcDate = zonedTimeToUtc('2018-09-01 18:01:36.386', 'Europe/Berlin')
    
  //   // Obtain a Date instance that will render the equivalent Berlin time for the UTC date
  //   const date = new Date('2018-09-01T16:01:36.386Z')
  //   const timeZone = 'Europe/Berlin'
  //   const zonedDate = utcToZonedTime(date, timeZone)
  //   // zonedDate could be used to initialize a date picker or display the formatted local date/time
    
  //   // Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
  //   const pattern = 'd.M.yyyy HH:mm:ss.SSS \'GMT\' XXX (z)'
  //   const output = format(zonedDate, pattern, { timeZone: 'Europe/Berlin' })

  // })
})



