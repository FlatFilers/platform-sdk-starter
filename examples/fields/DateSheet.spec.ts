import * as _ from 'lodash'
import { SmartDateField } from './SmartDateField'
import { FlatfileRecord } from '@flatfile/hooks'
import { Workbook, Sheet, TextField } from '@flatfile/configure'
import { SheetTester, matchSingleMessage } from '../../src/utils/testing/SheetTester'

const CompSets = [
  { expResult: 'error___', before: '18/02/2009', /*--*/ after: '02/17/2009', bF: '2009-02-18', aF: '2009-02-17' },
  { expResult: "No Error", before: "02/17/2009", /*--*/ after: "2009/02/19", bF: '2009-02-17', aF: '2009-02-19' },
  { expResult: "No Error", before: "2009/02/19", /*--*/ after: "February 20, 2009", bF: '2009-02-19', aF: '2009-02-20' },
  { expResult: "error___", before: "2/21/2009" , /*--*/ after: "February 20, 2009", bF: '2009-02-21', aF: '2009-02-20' },
  { expResult: "error___", before: "22/2/2009", /*---*/ after: "2009/02/19", bF: '2009-02-22', aF: '2009-02-19' },
  { expResult: "No Error", before: "2/21/2009", /*---*/ after: "2009/2/23", bF: '2009-02-21', aF: '2009-02-23' },
  { expResult: "No Error", before: "February 20, 2009", after: " 2/24/2009", bF: '2009-02-20', aF: '2009-02-24'},
  { expResult: "No Error", before: "February 20, 2009", after: "25Feb2009", bF: '2009-02-20', aF: '2009-02-25'},
  { expResult: "No Error", before: " 2/8/2009", /*---*/ after: " 8/2/2009", bF: '2009-02-08', aF: '2009-08-02'},
]

const DateSheet = new Sheet(
  'DateSheet',
  {
    before: SmartDateField({ required: true, fString: 'yyyy-MM-dd' }),
    after: SmartDateField({ required: true, fString: 'yyyy-MM-dd' }),
    expResult: TextField({ required: true }),
  },
  {
    recordCompute: (record: FlatfileRecord) => {
      const [before, after] = [record.get('before'), record.get('after')]
      const bothPresent = before && after
      //@ts-ignore
      const notBefore = before > after
      if (bothPresent && notBefore) {
        record.addError(['before', 'after'], "field 'before' must be a date before 'after'")
      }
    },
  }
)
const SmartDateCompBook = new Workbook({ name: 'DateBook', namespace: 'test', sheets: { DateSheet } })

describe('Date Comp Sheet ->', () => {
  const testSheet = new SheetTester(SmartDateCompBook, 'DateSheet')
  test.each(CompSets)('date comparison', async (row) => {
    const results = await testSheet.testRecord(row)
    expect(results['before']).toBe(row['bF'])
    expect(results['after']).toBe(row['aF'])
    const messageRes = await testSheet.testMessage(row)
    if (row['expResult'] === 'No Error') {
      expect(matchSingleMessage(messageRes, 'before', "field 'before' must be a date before 'after'")).toBeFalsy()
    } else {
      expect(matchSingleMessage(messageRes, 'before', "field 'before' must be a date before 'after'")).toBeTruthy()
    }
  })
})


const CompSets2 = [
  // these rows don't work with simple built in JS Date
  // { expResult: 'error___', before: '18/02/2009', /*--*/ after: '02/17/2009', bF: '2009-2-18', aF: '2009-2-17'},
  // { expResult: "error___", before: "22/2/2009", /*---*/ after: "2009/02/19", bF: '2009-2-22', aF: '2009-2-19'},
  // { expResult: "No Error", before: " 2/8/2009", /*---*/ after: " 8/2/2009", bF: '2009-2-08', aF: '2009-8-02'},

  { expResult: "No Error", before: "02/17/2009", /*--*/ after: "2009/02/19", bF: '2009-2-17', aF: '2009-2-19' },
  { expResult: "No Error", before: "2009/02/19", /*--*/ after: "February 20, 2009", bF: '2009-2-19', aF: '2009-2-20' },
  { expResult: "error___", before: "2/21/2009" , /*--*/ after: "February 20, 2009", bF: '2009-2-21', aF: '2009-2-20' },
  { expResult: "No Error", before: "2/21/2009", /*---*/ after: "2009/2/23", bF: '2009-2-21', aF: '2009-2-23' },
  { expResult: "No Error", before: "February 20, 2009", after: " 2/24/2009", bF: '2009-2-20', aF: '2009-2-24'},
  { expResult: "No Error", before: "February 20, 2009", after: "25Feb2009", bF: '2009-2-20', aF: '2009-2-25'},
]

const DumbDateSheet = new Sheet(
  'DumbDateSheet',
  {
    before: TextField({ required: true}),
    after: TextField({ required: true}),
    expResult: TextField({ required: true }),
  },
  {
    recordCompute: (record: FlatfileRecord) => {
      const [beforeRaw, afterRaw] = [record.get('before'), record.get('after')]
      if (_.isString(beforeRaw) &&  _.isString(afterRaw)) {
	const [before, after] = [new Date(beforeRaw), new Date(afterRaw)]
	const bothPresent = before && after
	const notBefore = before > after
	if (bothPresent && notBefore) {
          record.addError(['before', 'after'], "field 'before' must be a date before 'after'")
	}
	record.set('before', `${before.getUTCFullYear()}-${before.getUTCMonth() + 1}-${before.getUTCDate()}`)
	record.set('after', `${after.getUTCFullYear()}-${after.getUTCMonth() + 1}-${after.getUTCDate()}`)
      }
    },
  }
)

const DumbDateCompBook = new Workbook({ name: 'DumbDateCompBook', namespace: 'test', sheets: { DumbDateSheet } })

describe('Dumb Date Comp Sheet ->', () => {
  const testSheet = new SheetTester(DumbDateCompBook, 'DumbDateSheet')
  test.each(CompSets2)('date comparison', async (row) => {

    const messageRes = await testSheet.testMessage(row)
    if (row['expResult'] === 'No Error') {
      expect(matchSingleMessage(messageRes, 'before', "field 'before' must be a date before 'after'")).toBeFalsy()
    } else {
      expect(matchSingleMessage(messageRes, 'before', "field 'before' must be a date before 'after'")).toBeTruthy()
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
      d: SmartDateField({ required: false, fString: 'yyyy-MM-dd' }),
    },
    {}
)
  const SmartDateBook = new Workbook({ name: 'DateBook', namespace: 'test', sheets: { SmartDateSheet } })
  
  const dErr = (d:string) => `Error: couldn't parse ${d} with a certain year.  Please use an unambiguous date format`
  const dayErr = (d:string) => `Error: couldn't parse ${d} with a certain day.  Please use an unambiguous date format`
  const noParse = (d:string) => `Error: '${d}' returned no parse results`

  const testSheet = new SheetTester(SmartDateBook, 'SmartDateSheet')    
  const failingDates = _.map([
    ["25-Feb-19", dErr],
    ["17/ 2/2009", dayErr], //"bD/bM/YY" #Day-Month-Year with spaces instead of leading zeros
    ["2009/ 2/17", dErr], //"YY/bM/bD" #Year-Month-Day with spaces instead of leading zeros
    ["20090217", noParse],  //"YYMMDD",  #Year-Month-Day with no separators
    
    ["2009, Feb 17", dErr], // "YYYYY-Mon-DD"  #Year, Month abbreviation, Day with leading zeros
    ["2009, Feb 17", dErr], // "YYYY, Mon DD"  #Year, Month abbreviation, Day with leading zeros

    ["02172009", noParse], // "MMDDYY"  #Month-Day-Year with no separators
    ["17022009", noParse],  // "DDMMYY" #Day-Month-Year with no separators
    ["2009Feb17", noParse], // "YYMonDD" #Year-Month abbreviation-Day with leading zeros
    ["48/2009", noParse],   // "day/YY"  #Day of year (counting consecutively from January 1)-Year 
    ["2009/48", noParse],  // "YY/day" #Year-Day of Year (counting consecutively from January 1—often called the Julian date format)
  ], (combinedArg ) => {
    const [d, func] = combinedArg
    //@ts-ignore
    //console.log(d, func(d))
    //@ts-ignore
    return [d, func(d)]})

  test.each(failingDates)('date comparison', async (d, err ) => { 
    const row = { d }
    const messageRes = await testSheet.testMessage(row)
    const results = await testSheet.testRecord(row)
    expect(messageRes[0]).toMatchObject({message:err})
  })

})

describe('SmartDateField tests ->', () => {
  test('prevent egressCycle errors at instantiation time', () => {
    try {
      const sdf = SmartDateField({fString:"yyyy-MM-dd'paddy'"})

      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (e:any) {
      expect(e.message).toBe("Cannot instantiate a SmartDateField with an fString of yyyy-MM-dd'paddy', it fails verifyEgressCycle")
  }
  })
})
