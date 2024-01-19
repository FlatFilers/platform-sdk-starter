import { NumberField, TextField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester } from '../../../src/utils/testing/SheetTester'

//this is a basic example of how to modify a field based on other fields
const testSheet = new Sheet(
  'Test Sheet',
  {
    paymentStatus: TextField(),
    amount: NumberField(),
  },
  {
    //because this hook is comparing multiple fields and both modifying a field and adding a message, it must be run as a recordHook rather than a fieldHook
    recordCompute: (record, session, logger) => {
      if (record.get('paymentStatus') && !record.get('amount')) {
        record.set('paymentStatus', '')
        record.addWarning(
          'paymentStatus',
          'Amount must be greater than 0 to select a Payment Status'
        )
      }
    },
  }
)

const TestWorkbook = new Workbook({
  name: 'Test Workbook',
  namespace: 'Test',
  sheets: { testSheet },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'testSheet')
  test('Empty the Cell', async () => {
    // for this inputRow
    const inputRow = { paymentStatus: 'Paid', amount: null }
    // we expect this output row
    const expectedOutputRow = { paymentStatus: '', amount: null }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  //additional tests for additional cases
  test('test value in paymentStatus', async () => {
    const inputRow = { paymentStatus: 'Paid', amount: 2500 }
    const expectedOutputRow = { paymentStatus: 'Paid', amount: 2500 }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
})
