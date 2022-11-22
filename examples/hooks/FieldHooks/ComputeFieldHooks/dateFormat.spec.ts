import { TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from '../../../../src/utils/testing/SheetTester'
import { format } from 'date-fns'

//This is an example of storing the data hook outside your sheet as a helper function that can be referenced by multiple fields in your sheet.
//Here we define the function
const formatDate =
  (update: string) =>
  (value: string): string => {
    try {
      return format(new Date(value), update)
    } catch (err) {
      return value
    }
  }

//Here we call the function in the compute hook and specify the format that should be used when reformatting the dates
const testSheet = new Sheet('Test Sheet', {
  joinDate: TextField({
    compute: formatDate('MM/dd/yyyy'),
  }),
})

//Here we
const TestWorkbook = new Workbook({
  name: 'Test Workbook',
  namespace: 'Test',
  sheets: { testSheet },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'testSheet')
  test('Change Date format with written month', async () => {
    // for this inputRow
    const inputRow = { joinDate: 'Nov 12, 2020' }
    console.log(new Date(inputRow.joinDate))
    // we expect this output row
    const expectedOutputRow = { joinDate: '11/12/2020' }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  //additional tests for additional cases
  test('Change Date Format with dashes', async () => {
    const inputRow = { joinDate: '12-31-2020' }
    console.log(new Date(inputRow.joinDate))
    const expectedOutputRow = { joinDate: '12/31/2020' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Change date format day-month-year', async () => {
    const inputRow = { joinDate: '14 Jan 2022' }
    const expectedOutputRow = { joinDate: '01/14/2022' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Change date with period delimiters', async () => {
    const inputRow = { joinDate: '12.31.2022' }
    const expectedOutputRow = { joinDate: '12/31/2022' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  //This format tool does have some limitations, so knowing what some of those are so they can be handled appropriately elsewhere can be valuable
  test('Date format this hook cannot handle', async () => {
    const inputRow = { joinDate: '12242022' }
    const expectedOutputRow = { joinDate: '12242022' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
})
