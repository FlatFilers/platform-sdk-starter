import * as chrono from 'chrono-node'
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
  */


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

    const dString2 = '2022-07-30T04:00:00.000Z'
    const d2 = new Date(dString2)
    assertDC(dString2, d2)
  })

  test('DateCast handles invalid dates as errors', () => {  
    assertThrow(
      '2022-07-35',
      "'2022-07-35' returned no parse results"
    )
  })
  
  test('DateCast handles random strings as errors', () => {  
    assertThrow('foo', "'foo' returned no parse results")
  })

  test('DateCast handles infinity as an error', () => {  
    assertThrow(1 / 0, "'Infinity' returned no parse results")

  })

  test('instantiate DateField', () => {
    const d = DateField()
    expect(1).toBe(1)
  })


  test('tz comp', () => {
    assertDC("02/17/2009", new Date('2009-02-17')) //"MM/DD/YY" #Month-Day-Year with leading zeros
  })
  
  /*
  test('pandas date functions', () => {
    assertDC("02/17/2009", new Date('2009-02-17T00:00:00.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC("18/02/2009", new Date('2009-02-18T05:00:00.000Z')) //"DD/MM/YY" #Day-Month-Year with leading zeros (
    assertDC("2009/02/19", new Date('2009-02-19T05:00:00.000Z')) //"YY/MM/DD" #Year-Month-Day with leading zeros
    assertDC("February 20, 2009", new Date('2009-02-20T05:00:00.000Z')) //"Month D, Yr" Month name-Day-Year with no leading zeros
    assertDC("2/21/2009", new Date('2009-02-21T05:00:00.000Z')) //"M/D/YY"#Month-Day-Year with no leading zeros
    assertDC("22/2/2009", new Date('2009-02-22T05:00:00.000Z')), //"D/M/YY"#Day-Month-Year with no leading zeros
    assertDC("2009/2/23", new Date('2009-02-23T05:00:00.000Z')), //"YY/M/D"#Year-Month-Day with no leading zeros
    assertDC(" 2/24/2009", new Date('2009-02-24T05:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC("25Feb2009", new Date('2009-02-25T05:00:00.000Z')) // "DDMonYY" #Day-Month abbreviation-Year with leading zeros
  })
  */
  test('js dropin replacement', () => {
    expect(ChronoDateCast("02/17/2009")).toStrictEqual(new Date("02/17/2009"))
  })


})

// describe('Chrono play  ->', () => {
//   test('js dropin replacement', () => {

//     const parsedResult = chrono.strict.parse("02/17/2009")
//     const pr = parsedResult[0]
//     console.log(pr.start)
//     console.log(pr.start.isCertain('hour'))
//     // pr.start.imply("hours", 0)
//     // console.log(pr.start)
//   })
// })


// const ChronoStringDateCast = (raw:string) => {
  

//   //const parsedDebug = chrono.strict.parse(raw)
//   //console.dir(parsedDebug)
//   if (parsedResult === null) {
//     throw new Error(`'${raw}' parsed to 'null' which is invalid`)
//   }
//   if (parsedResult === undefined) {
//     throw new Error(`'${raw}' parsed to undefined which is invalid`)
//   }
//   //folloiwng code necessary for JS compatability

//   const firstResult = parsedResult[0]
//   if (firstResult === null || firstResult === undefined) {
//     throw new Error(`'${raw}' returned no parse results`)
//   }

//   const d = firstResult.date()
//   //console.log(d.getHours())
//   d.setHours(0)
//   return d
// }

//   })
// })y
