import { Sheet, NumberField, Workbook } from '@flatfile/configure'
import { SheetTester, matchMessages, matchSingleMessage } from '../../src/utils/testing/SheetTester'
import * as EXPR from '../../src/expression-lang/EXPR'
const [ErrorWhen, Val, GreaterThan] = [EXPR.ErrorWhen, EXPR.Val, EXPR.GreaterThan]


// note sheet must have same name as key in workbook it is shared as
const SubSheet = new Sheet(
  'SubSheet',
  {numField: NumberField({validate: ErrorWhen(GreaterThan(Val(), 5), "more than 5")})})


const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  // saving SubSheet to workbook under key SubSheet
  sheets: { SubSheet },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'SubSheet')
  test('ErrorWhen ', async () => {
    // for this inputRow
    const inputRow = { numField: 6}
    // we expect this output row
    const res = await testSheet.testMessage(inputRow)
    expect(matchSingleMessage(res, 'numField', 'more than 5', 'error')).toBeTruthy()
    // console.log("res", res)
    // console.log("matchMessages", matchMessages(res, 'numField'))
    //console.log("matchSingleMessage", 
		
    //call the expectation here
    //expect(res).toMatchObject(expectedOutputRow)
  })

})
