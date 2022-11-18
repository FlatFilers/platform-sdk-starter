import { FlatfileRecord } from '@flatfile/hooks'
import { Sheet, TextField, Workbook } from '@flatfile/configure'
import { SheetTester, matchSingleMessage } from '../src/utils/testing/SheetTester'

const RequiredWhen = (
	switchField: string, switchVals: string | string[], targetField: string) => {
	return (record: FlatfileRecord) => {
		const [a, b] = [record.get(switchField), record.get(targetField)]
		let searchVals: string[];
		if (Array.isArray(switchVals)) {
			searchVals = switchVals
		} else {
			searchVals = [switchVals]
		}
		//@ts-ignore
		if (searchVals.includes(a)) {
		  if(b === null) {
		    record.addWarning(targetField, ` '${targetField}' required`)
		  }
		}
		return record
	}
}

const RequiredWhenSheet = new Sheet(
  'RequiredWhenSheet',
  {a: TextField(),
   b: TextField()},
  {
     recordCompute: RequiredWhen('a', 'b_is_required', 'b')
   }
)

const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  // saving SubSheet to workbook under key SubSheet
  sheets: { RequiredWhenSheet},
})

/*
We have a bunch of use cases where we want to compare two or more dates in a row and throw an error if a condition is not met. 
For example, we want "Open Date" to always be before "Close Date" or both fields should throw the same error. 
This would need to come after we do the previous validations (code you sent over) for date format on the field level. How would I do this on the platform SDK?

Expected behavior:
1. Attempt to fix Date 1 and Date 2 format if it is not in the correct YYYY-MM-DD format
- If a fix cannot be made, throw an error relating to the date format needing to be fixed, but do not throw an error relating to the comparison of the two dates. (Code you sent over previously)
2.  Only if  Date 1 and Date 2 are both in the correct format (either by autoformatting it or manually changing the date in the UI), run the comparison logic and throw a new error on both dates if Date 1 is before Date 2.
*/

describe('Workbook tests ->', () => {

  const rqTestSheet = new SheetTester(TestWorkbook, 'RequiredWhenSheet')
  test('RequiredWhen test1', async () => {
    // for this inputRow
    // testing to see whether a is before b
    // expected to error here
    const inputRow = { a:'2022-07-30', b:'2022-06-30' }
    const messages = await rqTestSheet.testMessage(inputRow)

    //use the match functions like
    expect(matchSingleMessage(messages, 'b', "date b cannot be before date a", 'error')).toBeTruthy()
    expect(matchSingleMessage(messages, 'a', "date b cannot be before date a", 'error')).toBeTruthy()
  })

  test('RequiredWhen test2', async () => {
    // for this inputRow
    const inputRow = { a:'b_is_required', b:null }
    // we expect this output row
    const expectedOutputRow = { a:'b_is_required', b:null }
    const res = await rqTestSheet.testRecord(inputRow)
    const res2 = await rqTestSheet.testMessage(inputRow)

    //use the match functions like
    expect(matchSingleMessage(res2, 'b', "'b' required")).toBeTruthy()

    expect(res).toMatchObject(expectedOutputRow)
  })
})
