import { FlatfileRecord } from '@flatfile/hooks'
import { Sheet, TextField, Workbook } from '@flatfile/configure'
import { SheetTester, matchSingleMessage } from '../src/utils/testing/SheetTester'

const compareDate = (operand: '>' | '<' | '=', firstField: string, secondField: string, message: string) => {
	return (record: FlatfileRecord) => {
		const [a, b] = [record.get(firstField), record.get(secondField)]
	  if (a === null || b === null) {
	    return
	  }
		let conditionMet: boolean = false
		if (operand === '>') {
			if (a > b) {
				conditionMet = true
			}
		}
		if (operand === '<') {
			if (a < b) {
				conditionMet = true
			}
		}
		if (operand === '=') {
			if (a === b) {
				conditionMet = true
			}
		}

		if (conditionMet) {
			record.addError(firstField, message);
			record.addError(secondField, message);
		}
	}
}


const DateSheet = new Sheet(
  'DateSheet',
  {a: TextField(),
   b: TextField()},
  {
     recordCompute: compareDate('>', 'a', 'b',  "date b cannot be before date a")
   }
)

const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  // saving SubSheet to workbook under key SubSheet
  sheets: { DateSheet },
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

  const rqTestSheet = new SheetTester(TestWorkbook, 'DateSheet')
  test('dateCompare test1', async () => {
    // for this inputRow
    // testing to see whether a is before b
    // expected to error here
    const inputRow = { a:'2022-07-30', b:'2022-06-30' }
    const messages = await rqTestSheet.testMessage(inputRow)

    // WARNING, DANGER, the only reason these dates are properly comparing is that they are YYYY-MM-DD whihc alphabetically sortsNN
    expect(matchSingleMessage(messages, 'b', "date b cannot be before date a", 'error')).toBeTruthy()
    expect(matchSingleMessage(messages, 'a', "date b cannot be before date a", 'error')).toBeTruthy()
  })

  test('dateCompare test1', async () => {
    /*  

	make sure a string of 'paddy' doesn't parse as a date and throws an error
	make sure that 07/03/1987 if parses to a data is converted to 1987-03-07 

	
     */
  })
})
