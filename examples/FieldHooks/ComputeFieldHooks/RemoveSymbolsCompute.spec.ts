import { TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from '../../../src/utils/testing/SheetTester'

//This hook checks for and removes special characters in a string using RegEx.
const removeSymbolsCompute = new Sheet('removeSymbolsCompute', {
  //set up your field
  zipCode: TextField({
    //define a compute hook
    compute: (value: any) => {
      //add the regular expression you'll be using to search for invalid characters, then remove those characters
      return value.replace(/[*;/{}\[\]"_#'^><|]/g, '')
    },
  }),
})

const TestWorkbook = new Workbook({
  name: 'Test Workbook',
  namespace: 'Test',
  sheets: { removeSymbolsCompute },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'removeSymbolsCompute')
  test('Remove Extra Symbols', async () => {
    // for this inputRow
    const inputRow = { zipCode: '234**23' }
    // we expect this output row
    const expectedOutputRow = { zipCode: '23423' }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  //additional tests for additional cases
  test('Test set of numbers', async () => {
    const inputRow = { zipCode: '^^55555' }
    const expectedOutputRow = { zipCode: '55555' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Test trailing spaces', async () => {
    const inputRow = { zipCode: 'M4B [1G5]' }
    const expectedOutputRow = { zipCode: 'M4B 1G5' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
})
