import { TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from '../../../src/utils/testing/SheetTester'

const removeExtraSpaces = new Sheet('removeExtraSpaces', {
  //here we set up a field
  departmentName: TextField({
    //we define a compute hook
    compute: (value: any) => {
      //matches two or more whitespace characters and replaces them with one space
      return value.replace(/\s{2,}/g, ' ')
    },
  }),
})

const TestWorkbook = new Workbook({
  name: 'Test Workbook',
  namespace: 'Test',
  sheets: { removeExtraSpaces },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'removeExtraSpaces')
  test('Remove Extra Leading Spaces', async () => {
    // for this inputRow
    const inputRow = { departmentName: '    asdf' }
    // we expect this output row
    const expectedOutputRow = { departmentName: ' asdf' }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Test set of numbers', async () => {
    const inputRow = { departmentName: '123456789123456' }
    const expectedOutputRow = { departmentName: '123456789123456' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Test trailing spaces', async () => {
    const inputRow = { departmentName: 'asdf  ' }
    const expectedOutputRow = { departmentName: 'asdf ' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Test multiple instances of extra spaces', async () => {
    const inputRow = { departmentName: '  as  df' }
    const expectedOutputRow = { departmentName: ' as df' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Test set of numbers', async () => {
    const inputRow = { departmentName: 'Paddy Mullen' }
    const expectedOutputRow = { departmentName: 'Paddy Mullen' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
})
