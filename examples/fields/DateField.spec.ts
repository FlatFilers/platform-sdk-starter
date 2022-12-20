import { ChronoDateCast, SmartDateField } from './SmartDateField'

describe('Cast Function tests ->', () => {
  const makeCastAssertException = (castFn: any) => {
    const assertFn = (raw: any, error: string): void => {
      expect(() => {
        castFn(raw)
      }).toThrow(error)
    }
    return assertFn
  }

  const assertThrow = makeCastAssertException(ChronoDateCast)
  const assertDC = (raw: any, output: any): void => {
    expect(ChronoDateCast(raw)).toStrictEqual(output)
  }

  test('DateCast handles null cases', () => {
    // eventually I want this 2500 test file from pandas to be our goal for DWIM date parsing
    // https://github.com/pandas-dev/pandas/blob/main/pandas/tests/tools/test_to_datetime.py
    assertDC(undefined, null)
    assertDC(null, null)
    assertDC('', null)
  })

  test('DateCast handles invalid dates as errors', () => {
    assertThrow('2022-07-35', "'2022-07-35' returned no parse results")
  })

  test('DateCast handles random strings as errors', () => {
    assertThrow('foo', "'foo' returned no parse results")
  })

  test('DateCast handles infinity as an error', () => {
    assertThrow(1 / 0, "unexpected type in ChronoStringDateCast for val Infinity typeof number")
  })

  test('instantiate DateField', () => {
    const d = SmartDateField({})
    expect(1).toBe(1)
  })

  test('pandas date functions', () => {
    assertDC("Feb072009", /*--*/  new Date('2009-02-07T00:00:00.000Z')) // "MonDDYY" #Month abbreviation-Day-Year with leading zeros
    assertDC("Feb 08, 2009", /**/ new Date('2009-02-08T00:00:00.000Z')) // "Mon DD, YYYY" #Month abbreviation, Day with leading zeros, Year
    assertDC("09 Feb, 2009",      new Date('2009-02-09T00:00:00.000Z'))  // "DD Mon, YYYY"  #Day with leading zeros, Month abbreviation, Year
    assertDC("Feb142009", /*--*/  new Date('2009-02-14T00:00:00.000Z')) // "MonDDYY" #Month abbreviation-Day-Year with leading zeros
    assertDC("Feb 15, 2009", /**/ new Date('2009-02-15T00:00:00.000Z')) // "Mon DD, YYYY" #Month abbreviation, Day with leading zeros, Year
    assertDC("16 Feb, 2009", /**/ new Date('2009-02-16T00:00:00.000Z'))  // "DD Mon, YYYY"  #Day with leading zeros, Month abbreviation, Year
    assertDC('02/17/2009', /*--*/ new Date('2009-02-17T00:00:00.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC('18/02/2009', /*--*/ new Date('2009-02-18T00:00:00.000Z')) //"DD/MM/YY" #Day-Month-Year with leading zeros (
    assertDC('2009/02/19', /*--*/ new Date('2009-02-19T00:00:00.000Z')) //"YY/MM/DD" #Year-Month-Day with leading zeros
    assertDC('February 20, 2009', new Date('2009-02-20T00:00:00.000Z')) //"Month D, Yr" Month name-Day-Year with no leading zeros
    assertDC('2/21/2009', /*---*/ new Date('2009-02-21T00:00:00.000Z')) //"M/D/YY"#Month-Day-Year with no leading zeros
    assertDC('22/2/2009', /*---*/ new Date('2009-02-22T00:00:00.000Z')) //"D/M/YY"#Day-Month-Year with no leading zeros
    assertDC('2009/2/23', /*---*/ new Date('2009-02-23T00:00:00.000Z')) //"YY/M/D"#Year-Month-Day with no leading zeros
    assertDC(' 2/24/2009', /*--*/ new Date('2009-02-24T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC('25Feb2009', /*-0-*/ new Date('2009-02-25T00:00:00.000Z')) // "DDMonYY" #Day-Month abbreviation-Year with leading zeros

    assertDC('2009-02-26T00:00:00.000Z', /*--*/ new Date('2009-02-26T00:00:00.000Z')
    )
    assertDC('02/27/2009', new Date('2009-02-27')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC(' 2/8/2009', /*--*/ new Date('2009-02-08T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC(' 8/2/2009', /*--*/ new Date('2009-08-02T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros


    assertDC('03/3/2009', /*---*/ new Date('2009-03-03T00:00:00.000Z')) //"D/M/YY"#Day-Month-Year with no leading zeros


    assertDC('Nov 28, 2015, 7:41 AM', /*---*/ new Date('2015-11-28T07:41:00.000Z'))  
    assertDC('2015-11-26T00:00:00000Z', /*---*/ new Date('2015-11-26T00:00:00.000Z'))  
    assertDC('Fri, 27 November 2015 7:41am', /*---*/ new Date('2015-11-27T07:41:00.000Z'))  
    // this probably shouldn't pass November 27th 2015 was a Friday
    assertDC('Sun, 27 November 2015 7:41am', /*---*/ new Date('2015-11-27T07:41:00.000Z'))  
})

  test('date time  functions', () => {
    assertDC('02/17/2009 11:44:55', /*--*/ new Date('2009-02-17T11:44:55.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
  })


  test('expected parsing errors', ()=> {
    assertThrow('25-Feb-19', "couldn't parse 25-Feb-19 with a certain year.  Please use an unambiguous date format")
  })
  
})

