import * as chrono from 'chrono-node'
import { SmartDateField } from './DateField'
import { FlatfileRecord } from '@flatfile/hooks'
import { TextField } from '@flatfile/configure'

describe('SampleGroupBy sum ->', () => {

  test('asdf', () => {
    expect(1).toBe(1)
  })
})
const CompSets = [
  { expResult: "error___", before: "18/02/2009", /*--*/ after: "02/17/2009" },
  { expResult: "No Error", before: "02/17/2009", /*--*/ after: "2009/02/19" },
  { expResult: "No Error", before: "2009/02/19", /*--*/ after: "February 20, 2009"},
  { expResult: "error___", before: "February 20, 2009", after: "2/21/2009"},
  { expResult: "error___", before: "22/2/2009", /*---*/ after: "2009/02/19"},
  { expResult: "No Error", before: "2/21/2009", /*---*/ after: "2009/2/23"},
  { expResult: "No Error", before: "February 20, 2009", after: " 2/24/2009"},
  { expResult: "No Error", before: "February 20, 2009", after: "25Feb2009"},
  { expResult: "No Error", before: " 2/8/2009", /*---*/ after: " 8/2/2009"},
];


describe('Smaple Sheet ->', () => {
  test('true date comparison', () => {
    const TestSchema = new WorkbookTester(
      {
	before: SmartDateField({required:true}),
	after: SmartDateField({required:true}),
	expResult: TextField({required:true}),
      },
      {
	recordCompute: (record: FlatfileRecord) => {
	  const [before, after] = [record.get('before'), record.get('after')]
	  if ((before && after) && !(before > after)) {
	    record.addError(['before', 'after'], "field 'before' must be a date before 'after'")
	  }
	}
      })
  })
})
