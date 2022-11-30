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
