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
  //console.log("tzString", tzString, (typeof tzString))
  //console.log("prevailingTimezone", prevailingTimezone)
  //const utcDate = zonedTimeToUtc(val, prevailingTimezone)
  //const utcDate = zonedTimeToUtc(val, tzString)
  //const utcDate = zonedTimeToUtc(val, '08' )
  const utcDate = utcToZonedTime(val2, prevailingTimezone)
  return format(utcDate, fString)
}


const Feb17CD = ChronoDateCast('02/17/2009')
const Feb17D = new Date('2009-02-17T00:00:00.000Z')

describe('Cast Function tests ->', () => {
  test('egress formatting', () => {
    const dString = '2009-02-17T00:00:00.000Z'
    const d = new Date(dString)
    console.log(dString)
    console.log(d)
    // console.log(format(d, 'yyyy-MM-dd  HH', { timeZone: 'Z'}))
    // console.log(format(d, 'yyyy-MM-dd  HH', { timeZone: 'America/New_York'}))
    // console.log(format(d, 'yyyy-MM-dd  HH', { timeZone: 'Africa/Johannesburg'}))
    console.log(zFormat(d, 'yyyy-MM-dd HH'))
    expect(zFormat(d, 'yyyy-MM-dd HH')).toBe('2009-02-17 00')



    //console.log(format(d, 'd.M.yyyy HH:mm:ss.SSS \'GMT\' XXX (z)'))
  })

  test('date-fns tz stuff', () => {
    const dString = '2009-02-17T00:00:00.000Z'
    const d = new Date(dString)

    // Set the date to "2018-09-01T16:01:36.386Z"
    // console.log(zonedTimeToUtc(d, 'Europe/Berlin'))
    // console.log(zonedTimeToUtc(d, 'America/New_York'))
    
    const utcDate = zonedTimeToUtc('2018-09-01 18:01:36.386', 'Europe/Berlin')
    
    // Obtain a Date instance that will render the equivalent Berlin time for the UTC date
    const date = new Date('2018-09-01T16:01:36.386Z')
    const timeZone = 'Europe/Berlin'
    const zonedDate = utcToZonedTime(date, timeZone)
    // zonedDate could be used to initialize a date picker or display the formatted local date/time
    
    // Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
    const pattern = 'd.M.yyyy HH:mm:ss.SSS \'GMT\' XXX (z)'
    const output = format(zonedDate, pattern, { timeZone: 'Europe/Berlin' })

  })

  test('DateCast handles null cases', () => {
    // eventually I want this 2500 test file from pandas to be our goal for DWIM date parsing
    // https://github.com/pandas-dev/pandas/blob/main/pandas/tests/tools/test_to_datetime.py
    assertDC(undefined, null)
    assertDC(null, null)
    assertDC('', null)
  })


  test('tz comp', () => {
    assertDC("02/17/2009", new Date('2009-02-17')) //"MM/DD/YY" #Month-Day-Year with leading zeros
  })
  

  test('pandas date functions', () => {
    // doublecheck that pandas does the exact same thing
    assertDC("02/17/2009", /*--*/ new Date('2009-02-17T00:00:00.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC("18/02/2009", /*--*/ new Date('2009-02-18T00:00:00.000Z')) //"DD/MM/YY" #Day-Month-Year with leading zeros (
    assertDC("2009/02/19", /*--*/ new Date('2009-02-19T00:00:00.000Z')) //"YY/MM/DD" #Year-Month-Day with leading zeros
    assertDC("February 20, 2009", new Date('2009-02-20T00:00:00.000Z')) //"Month D, Yr" Month name-Day-Year with no leading zeros
    assertDC("2/21/2009", /*---*/ new Date('2009-02-21T00:00:00.000Z')) //"M/D/YY"#Month-Day-Year with no leading zeros
    assertDC("22/2/2009", /*---*/ new Date('2009-02-22T00:00:00.000Z')), //"D/M/YY"#Day-Month-Year with no leading zeros
    assertDC("2009/2/23", /*---*/ new Date('2009-02-23T00:00:00.000Z')), //"YY/M/D"#Year-Month-Day with no leading zeros
    assertDC(" 2/24/2009", /*--*/ new Date('2009-02-24T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC("25Feb2009", /*-0-*/ new Date('2009-02-25T00:00:00.000Z')) // "DDMonYY" #Day-Month abbreviation-Year with leading zeros

    assertDC(" 2/8/2009", /*--*/ new Date('2009-02-08T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros

    assertDC(" 8/2/2009", /*--*/ new Date('2009-08-02T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
  })

  test('date time  functions', () => {
    assertDC("02/17/2009 11:44:55", /*--*/ new Date('2009-02-17T11:44:55.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
  })

})



