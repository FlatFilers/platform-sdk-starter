import { Message, TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from '../../../../src/utils/testing/SheetTester'

const testSheet = new Sheet('Test Sheet', {
  cellPhone: TextField({
    label: 'Cell Phone Number',
    validate: (value: string) => {
      /*the below regex matches these phone number types: 
      123-456-7890
      (123) 456-7890
      123 456 7890
      123.456.7890
      +91 (123) 456-7890 */
      const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
      if (!value.match(regex)) {
        return [
          new Message(
            `${value} is an invalid phone number`,
            'error',
            'validate'
          ),
        ]
      }
    },
  }),
})

const TestWorkbook = new Workbook({
  name: 'Test Workbook',
  namespace: 'Test',
  sheets: { testSheet },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'testSheet')
  test('Reformat phone number with international code', async () => {
    // for this inputRow
    const inputRow = { cellPhone: '15555555555' }
    // we expect this output row
    const expectedOutputRow = { cellPhone: '+1 (555) 555-5555' }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  //additional tests for additional cases
  test('Remove letters, number too short', async () => {
    const inputRow = { cellPhone: '12321 ggg' }
    const expectedOutputRow = { cellPhone: 'Invalid phone number' }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  // test('Test trailing spaces', async () => {
  //   const inputRow = { cellPhone: 'asdf  ' }
  //   const expectedOutputRow = { cellPhone: 'asdf ' }
  //   const res = await testSheet.testRecord(inputRow)
  //   expect(res).toMatchObject(expectedOutputRow)
  // })

  // test('Test multiple instances of extra spaces', async () => {
  //   const inputRow = { cellPhone: '  as  df' }
  //   const expectedOutputRow = { cellPhone: ' as df' }
  //   const res = await testSheet.testRecord(inputRow)
  //   expect(res).toMatchObject(expectedOutputRow)
  // })

  // test('Test set of numbers', async () => {
  //   const inputRow = { cellPhone: 'Paddy Mullen' }
  //   const expectedOutputRow = { cellPhone: 'Paddy Mullen' }
  //   const res = await testSheet.testRecord(inputRow)
  //   expect(res).toMatchObject(expectedOutputRow)
  // })
})
