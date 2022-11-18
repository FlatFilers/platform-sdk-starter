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

describe('Workbook tests ->', () => {

  const rqTestSheet = new SheetTester(TestWorkbook, 'RequiredWhenSheet')
  test('RequiredWhen test1', async () => {
    // for this inputRow
    const inputRow = { a:'wont trigger', b:null }
    // we expect this output row
    const expectedOutputRow = { a:'wont trigger', b:null }
    const res = await rqTestSheet.testRecord(inputRow)
    const res2 = await rqTestSheet.testMessage(inputRow)

    //use the match functions like
    expect(matchSingleMessage(res2, 'b')).toBeFalsy()

    expect(res).toMatchObject(expectedOutputRow)
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
