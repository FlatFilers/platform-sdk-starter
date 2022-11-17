import { TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from '../../../src/utils/testing/SheetTester'

const removeExtraSpaces = new Sheet('removeExtraSpaces', {
  departmentName: TextField({
    compute: (value: any) => {
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
  const testSheet = new SheetTester(TestWorkbook, 'SubSheet')
  test('Remove Extra Spaces', async () => {
    // for this inputRow
    const inputRow = { departmentName: ' asdf' }
    // we expect this output row
    const expectedOutputRow = { numField: ' asdf' }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  // test('Convert to spanish number word works', async () => {
  //   const inputRow = { numField: 'un'}
  //   const expectedOutputRow = { numField: 'un'}
  //   const res = await testSheet.testRecord(inputRow)
  //   expect(res).toMatchObject(expectedOutputRow)

  //   const res2 = await testSheet.testRecord({ numField: 'two'})
  //   expect(res2).toMatchObject({ numField: 'dos' })
  // })
})
