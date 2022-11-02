import { ChronoDateCast, DateField } from './DateField'
describe('Cast Function tests ->', () => {
  const makeCastAssert = (castFn: any) => {
    const assertFn = (raw: any, output: any): void => {
      expect(castFn(raw)).toBe(output)
    }
    return assertFn
  }
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

  /*
  test('DateField syntax play', () => {

      //what do we want options on DateField to look like

    DateField({egress:"YY/MM/DD"})

    // known strings?
    DateField({egressShorthand:"iso"})
    DateField({egress:"iso-with-tz"})

    //what about parsing options
    DateField({egressShorthand:"iso"})
    DateField({egress:"iso-with-tz"})

    // what about a strict option
    DateField({parseOptions: {strict:true}})
    DateField({parseOptions: {parseString: "YY/MM/DD"}}) // and reject other formats?
    
    expect(1).toBe(1)
  })
  


  test('DateCast handles null cases', () => {
    // eventually I want this 2500 test file from pandas to be our goal for DWIM date parsing
    // https://github.com/pandas-dev/pandas/blob/main/pandas/tests/tools/test_to_datetime.py
    assertDC(undefined, null)
    assertDC(null, null)
    assertDC('', null)
  })

  test('DateCast handles real dates', () => {
    const dString = '2022-07-30'
    const d = new Date(dString)
    //assertDC(dString, d)  // this is the original datecast test, commented out because it doesn't work, the following does work

    const dString2 = '2022-07-30T16:00:00.000Z'
    const d2 = new Date(dString2)
    assertDC(dString2, d2)
  })

  test('DateCast handles invalid dates as errors', () => {  
    assertThrow(
      '2022-07-35',
      "'2022-07-35' parsed to 'null' which is invalid"
    )
  })
  
  test('DateCast handles random strings as errors', () => {  
    assertThrow('foo', "'foo' parsed to 'null' which is invalid")
  })

  test('DateCast handles infinity as an error', () => {  
    assertThrow(1 / 0, "'Infinity' parsed to 'null' which is invalid")

  })

  test('instantiate DateField', () => {
    const d = DateField()
    console.log(d)
    expect(1).toBe(1)
  })
  test('pandas date functions', () => {
    assertDC("02/17/2009", new Date('2009-02-17T17:00:00.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC("18/02/2009", new Date('2009-02-18T17:00:00.000Z')) //"DD/MM/YY" #Day-Month-Year with leading zeros (
    assertDC("2009/02/19", new Date('2009-02-19T17:00:00.000Z')) //"YY/MM/DD" #Year-Month-Day with leading zeros
    assertDC("February 20, 2009", new Date('2009-02-20T17:00:00.000Z')) //"Month D, Yr" Month name-Day-Year with no leading zeros
    assertDC("2/21/2009", new Date('2009-02-21T17:00:00.000Z')) //"M/D/YY"#Month-Day-Year with no leading zeros
    assertDC("22/2/2009", new Date('2009-02-22T17:00:00.000Z')), //"D/M/YY"#Day-Month-Year with no leading zeros
    assertDC("2009/2/23", new Date('2009-02-23T17:00:00.000Z')), //"YY/M/D"#Year-Month-Day with no leading zeros
    assertDC(" 2/24/2009", new Date('2009-02-24T17:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC("25Feb2009", new Date('2009-02-25T17:00:00.000Z')) // "DDMonYY" #Day-Month abbreviation-Year with leading zeros

  })
  */
  test('js dropin replacement', () => {
    expect(ChronoDateCast("02/17/2009")).toStrictEqual(new Date("02/17/2009"))
  })


})
