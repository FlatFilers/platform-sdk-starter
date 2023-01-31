import * as _ from 'lodash'
import { SmartDateField, ChronoDateCast } from './SmartDateField'
import { FlatfileRecord } from '@flatfile/hooks'
import { Workbook, Sheet, TextField, NumberField } from '@flatfile/configure'
import {
  SheetTester,
  matchSingleMessage,
} from '../../src/utils/testing/SheetTester'

const CompSets = [
  {
    expResult: 'error___',
    before: '18/02/2009',
    /*--*/ after: '02/17/2009',
    bF: '2009-02-18',
    aF: '2009-02-17',
  },
  {
    expResult: 'No Error',
    before: '02/17/2009',
    /*--*/ after: '2009/02/19',
    bF: '2009-02-17',
    aF: '2009-02-19',
  },
  {
    expResult: 'No Error',
    before: '2009/02/19',
    /*--*/ after: 'February 20, 2009',
    bF: '2009-02-19',
    aF: '2009-02-20',
  },
  {
    expResult: 'error___',
    before: '2/21/2009',
    /*--*/ after: 'February 20, 2009',
    bF: '2009-02-21',
    aF: '2009-02-20',
  },
  {
    expResult: 'error___',
    before: '22/2/2009',
    /*---*/ after: '2009/02/19',
    bF: '2009-02-22',
    aF: '2009-02-19',
  },
  {
    expResult: 'No Error',
    before: '2/21/2009',
    /*---*/ after: '2009/2/23',
    bF: '2009-02-21',
    aF: '2009-02-23',
  },
  {
    expResult: 'No Error',
    before: 'February 20, 2009',
    after: ' 2/24/2009',
    bF: '2009-02-20',
    aF: '2009-02-24',
  },
  {
    expResult: 'No Error',
    before: 'February 20, 2009',
    after: '25Feb2009',
    bF: '2009-02-20',
    aF: '2009-02-25',
  },
  {
    expResult: 'No Error',
    before: ' 2/8/2009',
    /*---*/ after: ' 8/2/2009',
    bF: '2009-02-08',
    aF: '2009-08-02',
  },
]

const DateSheet = new Sheet(
  'DateSheet',
  {
    before: SmartDateField({ required: true, formatString: 'yyyy-MM-dd' }),
    after: SmartDateField({ required: true, formatString: 'yyyy-MM-dd' }),
    expResult: TextField({ required: true }),
  },
  {
    recordCompute: (record: FlatfileRecord) => {
      const [before, after] = [record.get('before'), record.get('after')]
      const bothPresent = before && after
      //@ts-ignore
      const notBefore = before > after
      if (bothPresent && notBefore) {
        record.addError(
          ['before', 'after'],
          "field 'before' must be a date before 'after'"
        )
      }
    },
  }
)
const SmartDateCompBook = new Workbook({
  name: 'DateBook',
  namespace: 'test',
  sheets: { DateSheet },
})

describe('Date Comp Sheet tests demonstrating comparison of date object ->', () => {
  const testSheet = new SheetTester(SmartDateCompBook, 'DateSheet')
  test.each(CompSets)(
    'Verify that before is earlier than after for sample data',
    async (row) => {
      const results = await testSheet.testRecord(row)
      expect(results['before']).toBe(row['bF'])
      expect(results['after']).toBe(row['aF'])
      const messageRes = await testSheet.testMessage(row)
      if (row['expResult'] === 'No Error') {
        expect(
          matchSingleMessage(
            messageRes,
            'before',
            "field 'before' must be a date before 'after'"
          )
        ).toBeFalsy()
      } else {
        expect(
          matchSingleMessage(
            messageRes,
            'before',
            "field 'before' must be a date before 'after'"
          )
        ).toBeTruthy()
      }
    }
  )
})

const CompSets2 = [
  // these rows don't work with simple built in JS Date
  // { expResult: 'error___', before: '18/02/2009', /*--*/ after: '02/17/2009', bF: '2009-2-18', aF: '2009-2-17'},
  // { expResult: "error___", before: "22/2/2009", /*---*/ after: "2009/02/19", bF: '2009-2-22', aF: '2009-2-19'},
  // { expResult: "No Error", before: " 2/8/2009", /*---*/ after: " 8/2/2009", bF: '2009-2-08', aF: '2009-8-02'},

  {
    expResult: 'No Error',
    before: '02/17/2009',
    /*--*/ after: '2009/02/19',
    bF: '2009-2-17',
    aF: '2009-2-19',
  },
  {
    expResult: 'No Error',
    before: '2009/02/19',
    /*--*/ after: 'February 20, 2009',
    bF: '2009-2-19',
    aF: '2009-2-20',
  },
  {
    expResult: 'error___',
    before: '2/21/2009',
    /*--*/ after: 'February 20, 2009',
    bF: '2009-2-21',
    aF: '2009-2-20',
  },
  {
    expResult: 'No Error',
    before: '2/21/2009',
    /*---*/ after: '2009/2/23',
    bF: '2009-2-21',
    aF: '2009-2-23',
  },
  {
    expResult: 'No Error',
    before: 'February 20, 2009',
    after: ' 2/24/2009',
    bF: '2009-2-20',
    aF: '2009-2-24',
  },
  {
    expResult: 'No Error',
    before: 'February 20, 2009',
    after: '25Feb2009',
    bF: '2009-2-20',
    aF: '2009-2-25',
  },
]

const DumbDateSheet = new Sheet(
  'DumbDateSheet',
  {
    before: TextField({ required: true }),
    after: TextField({ required: true }),
    expResult: TextField({ required: true }),
  },
  {
    recordCompute: (record: FlatfileRecord) => {
      const [beforeRaw, afterRaw] = [record.get('before'), record.get('after')]
      if (_.isString(beforeRaw) && _.isString(afterRaw)) {
        const [before, after] = [new Date(beforeRaw), new Date(afterRaw)]
        const bothPresent = before && after
        const notBefore = before > after
        if (bothPresent && notBefore) {
          record.addError(
            ['before', 'after'],
            "field 'before' must be a date before 'after'"
          )
        }
        record.set(
          'before',
          `${before.getUTCFullYear()}-${
            before.getUTCMonth() + 1
          }-${before.getUTCDate()}`
        )
        record.set(
          'after',
          `${after.getUTCFullYear()}-${
            after.getUTCMonth() + 1
          }-${after.getUTCDate()}`
        )
      }
    },
  }
)

const DumbDateCompBook = new Workbook({
  name: 'DumbDateCompBook',
  namespace: 'test',
  sheets: { DumbDateSheet },
})

describe('Dumb Date Comp Sheet ->', () => {
  const testSheet = new SheetTester(DumbDateCompBook, 'DumbDateSheet')
  test.each(CompSets2)('date comparison', async (row) => {
    const messageRes = await testSheet.testMessage(row)
    if (row['expResult'] === 'No Error') {
      expect(
        matchSingleMessage(
          messageRes,
          'before',
          "field 'before' must be a date before 'after'"
        )
      ).toBeFalsy()
    } else {
      expect(
        matchSingleMessage(
          messageRes,
          'before',
          "field 'before' must be a date before 'after'"
        )
      ).toBeTruthy()
    }
    const results = await testSheet.testRecord(row)
    expect(results['before']).toBe(row['bF'])
    expect(results['after']).toBe(row['aF'])
  })
})

// working dates
/*
    ["17 Feb, 2009",],  // "DD Mon, YYYY"  #Day with leading zeros, Month abbreviation, Year
    [ "Feb 17, 2009", ], // "Mon DD, YYYY" #Month abbreviation, Day with leading zeros, Year
    ["Feb172009", ], // "MonDDYY" #Month abbreviation-Day-Year with leading zeros
*/

describe('Extra test ->', () => {
  const SmartDateSheet = new Sheet(
    'SmartDateSheet',
    {
      d: SmartDateField({ required: false, formatString: 'yyyy-MM-dd' }),
    },
    {}
  )
  const SmartDateBook = new Workbook({
    name: 'DateBook',
    namespace: 'test',
    sheets: { SmartDateSheet },
  })

  const dErr = (d: string) =>
    `Error: couldn't parse ${d} with a certain year.  Please use an unambiguous date format`
  const dayErr = (d: string) =>
    `Error: couldn't parse ${d} with a certain day.  Please use an unambiguous date format`
  const noParse = (d: string) => `Error: '${d}' returned no parse results`

  const testSheet = new SheetTester(SmartDateBook, 'SmartDateSheet')
  const failingDates = _.map(
    [
      ['25-Feb-19', dErr],
      ['17/ 2/2009', dayErr], //"bD/bM/YY" #Day-Month-Year with spaces instead of leading zeros
      ['2009/ 2/17', dErr], //"YY/bM/bD" #Year-Month-Day with spaces instead of leading zeros
      ['20090217', noParse], //"YYMMDD",  #Year-Month-Day with no separators

      ['2009, Feb 17', dErr], // "YYYYY-Mon-DD"  #Year, Month abbreviation, Day with leading zeros
      ['2009, Feb 17', dErr], // "YYYY, Mon DD"  #Year, Month abbreviation, Day with leading zeros

      ['02172009', noParse], // "MMDDYY"  #Month-Day-Year with no separators
      ['17022009', noParse], // "DDMMYY" #Day-Month-Year with no separators
      ['2009Feb17', noParse], // "YYMonDD" #Year-Month abbreviation-Day with leading zeros
      ['48/2009', noParse], // "day/YY"  #Day of year (counting consecutively from January 1)-Year
      ['2009/48', noParse], // "YY/day" #Year-Day of Year (counting consecutively from January 1—often called the Julian date format)
    ],
    (combinedArg) => {
      const [d, func] = combinedArg
      //@ts-ignore
      return [d, func(d)]
    }
  )

  test.each(failingDates)('date comparison', async (d, err) => {
    const row = { d }
    const messageRes = await testSheet.testMessage(row)
    const results = await testSheet.testRecord(row)
    expect(messageRes[0]).toMatchObject({ message: err })
  })
})

describe('SmartDateField tests ->', () => {
  test('prevent egressCycle errors at instantiation time', () => {
    expect(() => {
      SmartDateField({ formatString: "yyyy-MM-dd'paddy'" })
    }).toThrow(
      "Error: instantiating a SmartDateField with a formatString of yyyy-MM-dd'paddy', and locale of 'en'.  will result in data loss or unexpected behavior"
    )

    expect(() => {
      SmartDateField({ locale: 'fr', formatString: "MM-dd-yy'" })
    }).toThrow(
      "Error: instantiating a SmartDateField with a formatString of MM-dd-yy', and locale of 'fr'.  will result in data loss or unexpected behavior"
    )
    //we expect the following to work because that is the default for en locale
    SmartDateField({ formatString: "MM-dd-yy'" })
  })
})

const NullValuesSheet = new Sheet('NullValuesSheet', {
  thisDate: SmartDateField({
    formatString: 'yyyy-MM-dd',
  }),
})

const NullValuesWorkbook = new Workbook({
  name: 'NullValuesWorkbook',
  namespace: 'test',
  sheets: { NullValuesSheet },
})

describe('SmartDateField handles null values', () => {
  const testSheet = new SheetTester(NullValuesWorkbook, 'NullValuesSheet')
  const rows = [
    {
      thisDate: null,
    },
    {
      thisDate: undefined,
    },
    {
      thisDate: '',
    },
  ]
  test.each(rows)(
    'Verify that result is null and there are no errors',
    async (row) => {
      const results = await testSheet.testRecord(row)
      const message = await testSheet.testMessage(row)
      expect(results['thisDate']).toBe(null)
      expect(message.length === 0)
    }
  )
})

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
    assertThrow(
      1 / 0,
      'unexpected type in ChronoStringDateCast for val Infinity typeof number'
    )
  })

  test('instantiate DateField', () => {
    const d = SmartDateField({})
    expect(1).toBe(1)
  })

  test('pandas date functions', () => {
    assertDC('Feb072009', /*--*/ new Date('2009-02-07T00:00:00.000Z')) // "MonDDYY" Month abbreviation-Day-Year with leading zeros
    assertDC('Feb 08, 2009', /**/ new Date('2009-02-08T00:00:00.000Z')) // "Mon DD, YYYY" Month abbreviation, Day with leading zeros, Year
    assertDC('09 Feb, 2009', new Date('2009-02-09T00:00:00.000Z')) // "DD Mon, YYYY" Day with leading zeros, Month abbreviation, Year
    assertDC('02/17/2009', /*--*/ new Date('2009-02-17T00:00:00.000Z')) // "MM/DD/YY" Month-Day-Year with leading zeros - Non ambiguous
    assertDC('18/02/2009', /*--*/ new Date('2009-02-18T00:00:00.000Z')) // "DD/MM/YY" Day-Month-Year with leading zeros - Non ambiguous
    assertDC('2009/02/19', /*--*/ new Date('2009-02-19T00:00:00.000Z')) // "YY/MM/DD" Year-Month-Day with leading zeros - Non ambiguous
    assertDC('February 20, 2009', new Date('2009-02-20T00:00:00.000Z')) // "Month D, Yr" Month name-Day-Year with no leading zeros
    assertDC('2/21/2009', /*---*/ new Date('2009-02-21T00:00:00.000Z')) // "M/D/YY" Month-Day-Year with no leading zeros - Non ambiguous
    assertDC('22/2/2009', /*---*/ new Date('2009-02-22T00:00:00.000Z')) // "D/M/YY"Day-Month-Year with no leading zeros - Non ambiguous
    assertDC('2009/2/23', /*---*/ new Date('2009-02-23T00:00:00.000Z')) // "YY/M/D" Year-Month-Day with no leading zeros - Non ambiguous
    assertDC(' 2/24/2009', /*--*/ new Date('2009-02-24T00:00:00.000Z')) // "bM/bD/YY" Month-Day-Year with spaces instead of leading zeros
    assertDC(
      '2009-02-26T00:00:00.000Z',
      /*--*/ new Date('2009-02-26T00:00:00.000Z')
    ) //ISO FULL

    assertDC('02/27/2009', new Date('2009-02-27')) //"MM/DD/YY" #Month-Day-Year with leading zeros
    assertDC(' 2/8/2009', /*--*/ new Date('2009-02-08T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros
    assertDC(' 8/2/2009', /*--*/ new Date('2009-08-02T00:00:00.000Z')) //"bM/bD/YY" #Month-Day-Year with spaces instead of leading zeros

    assertDC('03/3/2009', /*---*/ new Date('2009-03-03T00:00:00.000Z')) //"D/M/YY"#Day-Month-Year with no leading zeros

    assertDC(
      'Nov 28, 2015, 7:41 AM',
      /*---*/ new Date('2015-11-28T07:41:00.000Z')
    )
    assertDC(
      '2015-11-26T00:00:00000Z',
      /*---*/ new Date('2015-11-26T00:00:00.000Z')
    )
    assertDC(
      'Fri, 27 November 2015 7:41am',
      /*---*/ new Date('2015-11-27T07:41:00.000Z')
    )
    // this probably shouldn't pass November 27th 2015 was a Friday
    assertDC(
      'Sun, 27 November 2015 7:41am',
      /*---*/ new Date('2015-11-27T07:41:00.000Z')
    )
  })

  test('date time  functions', () => {
    assertDC('02/17/2009 11:44:55', /*--*/ new Date('2009-02-17T11:44:55.000Z')) //"MM/DD/YY" #Month-Day-Year with leading zeros
  })

  test('expected parsing errors', () => {
    assertThrow(
      '25-Feb-19',
      "couldn't parse 25-Feb-19 with a certain year.  Please use an unambiguous date format"
    )
  })
  test('extraParseString', () => {
    const df = SmartDateField({ extraParseString: 'yyyyMMdd' })
    expect(df.options.cast('20080302')).toStrictEqual(
      new Date('2008-03-02T00:00:00.000Z')
    )
  })
})
