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
    assertThrow(1 / 0, "'Infinity' returned no parse results")
  })

  test('instantiate DateField', () => {
    const d = SmartDateField()
    expect(1).toBe(1)
  })

  test('pandas date functions', () => {
    // doublecheck that pandas does the exact same thing
    assertDC('02/17/2009', /*--*/ new Date('2009-02-17T00:00:00.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC('18/02/2009', /*--*/ new Date('2009-02-18T00:00:00.000Z')) //"DD/MM/YY" #Day-Month-Year with leading zeros (
    assertDC('2009/02/19', /*--*/ new Date('2009-02-19T00:00:00.000Z')) //"YY/MM/DD" #Year-Month-Day with leading zeros
    assertDC('February 20, 2009', new Date('2009-02-20T00:00:00.000Z')) //"Month D, Yr" Month name-Day-Year with no leading zeros
    assertDC('2/21/2009', /*---*/ new Date('2009-02-21T00:00:00.000Z')) //"M/D/YY"#Month-Day-Year with no leading zeros
    assertDC('22/2/2009', /*---*/ new Date('2009-02-22T00:00:00.000Z')), //"D/M/YY"#Day-Month-Year with no leading zeros
    assertDC('2009/2/23', /*---*/ new Date('2009-02-23T00:00:00.000Z')), //"YY/M/D"#Year-Month-Day with no leading zeros
    assertDC(' 2/24/2009', /*--*/ new Date('2009-02-24T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC('25Feb2009', /*-0-*/ new Date('2009-02-25T00:00:00.000Z')) // "DDMonYY" #Day-Month abbreviation-Year with leading zeros

    assertDC('2009-02-26T00:00:00.000Z', /*--*/ new Date('2009-02-26T00:00:00.000Z')
    )
    assertDC('02/27/2009', new Date('2009-02-27')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC(' 2/8/2009', /*--*/ new Date('2009-02-08T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC(' 8/2/2009', /*--*/ new Date('2009-08-02T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
  })

  test('date time  functions', () => {
    assertDC('02/17/2009 11:44:55', /*--*/ new Date('2009-02-17T11:44:55.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
  })
})

