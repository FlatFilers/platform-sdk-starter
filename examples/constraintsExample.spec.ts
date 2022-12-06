import { FlatfileRecord } from '@flatfile/hooks'
import { Sheet, TextField, Workbook } from '@flatfile/configure'
import { SheetTester, matchSingleMessage } from '../src/utils/testing/SheetTester'

/*

1. Conditionally Null - Set field to null + throw warning if another field has a certain value
Field A: select either -> "Apples" or "Oranges" or "Bananas"
Field B: if "Apples" or "Bananas" (or N number of items) is selected on Field A -> set Field B to null and throw warning on Field B if there was data was cleared out of Field B. Warning message should contain the data that was cleared incase the user want to add it somewhere else.

2. Conditionally Required - Required if a different field has a certain value, otherwise set it to null
Field A: select either -> "Apples" or "Oranges" or "Bananas"
Field B: if "Apples" or "Bananas" (or N number of items) on Field A and Field B is empty --> throw error if required.
 if "Oranges" is selected on Field A --> Set Field B to null and throw a warning if there was data that was cleared out of Field B.

Is there a way we can standardize this to avoid tons of nested conditionals in our sheet?

 */



const SetValWhen = (
	haystackField: string, needleValues: string | string[], targetField: string, val: any) => {
	return (record: FlatfileRecord) => {
		const [a, b] = [record.get(haystackField), record.get(targetField)]
		let searchVals: string[];
		if (Array.isArray(needleValues)) {
			searchVals = needleValues
		} else {
			searchVals = [needleValues]
		}
		//@ts-ignore
		if (searchVals.includes(a)) {
			record.set(targetField, val)
			record.addWarning(targetField, `cleared '${targetField}', was ${b}`)
		}
		return record
	}
}

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

const RCChain = (...funcs:any) => {
  return (record: FlatfileRecord) => {
    for (const func of funcs) {
      func(record)
    }
  }
}


// note sheet must have same name as key in workbook it is shared as
const ConditionallyNullSheet = new Sheet(
  'ConditionallyNullSheet',
  {a: TextField(),
   b: TextField()},
  {
     recordCompute: RCChain(
       SetValWhen('a', 'b_must_be_null', 'b', null),
       SetValWhen('a', 'b_to_10', 'b', 10))
   }
)

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
  sheets: { ConditionallyNullSheet, RequiredWhenSheet},
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'ConditionallyNullSheet')

  test('ConditionallyNullSheet test', async () => {
    // for this inputRow
    const inputRow = { a:'b_must_be_null', b:8 }
    // we expect this output row
    const expectedOutputRow = { a:'b_must_be_null', b:null }
    const res = await testSheet.testRecord(inputRow)
    const res2 = await testSheet.testMessage(inputRow)

    //use the match functions like
    expect(matchSingleMessage(res2, 'b', "cleared 'b', was 8", 'warn')).toBeTruthy()

    expect(res).toMatchObject(expectedOutputRow)
  })

  test('ConditionallyNullSheet test', async () => {
    // for this inputRow
    const inputRow = { a:'b_must_be_null', b:8 }
    // we expect this output row
    const expectedOutputRow = { a:'b_must_be_null', b:null }
    const res = await testSheet.testRecord(inputRow)
    const res2 = await testSheet.testMessage(inputRow)

    //use the match functions like
    expect(matchSingleMessage(res2, 'b', "cleared 'b', was 8", 'warn')).toBeTruthy()

    expect(res).toMatchObject(expectedOutputRow)
  })

  test('ConditionallyNullSheet test2', async () => {
    // for this inputRow
    const inputRow = { a:'anything_else', b:8 }
    // we expect this output row
    const expectedOutputRow = { a:'anything_else', b:8 }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
  test('test set  to 10 ', async () => {
    // for this inputRow
    const inputRow = { a:'b_to_10', b:10 }
    // we expect this output row
    const expectedOutputRow = { a:'b_to_10', b:10 }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

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
