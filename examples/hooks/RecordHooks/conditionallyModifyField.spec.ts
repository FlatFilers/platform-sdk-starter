import { Sheet, Workbook, BooleanField, TextField } from '@flatfile/configure'
import { SheetTester } from '../../../src/utils/testing/SheetTester'

//this Data Hook can be used to update the contents of a cell based on whether or not another cell passes RegEx validation.
//This method of setting fields at validations at the top of a sheet allows you to set all RegEx and messages in one easily referencable place.
const FIELDS = {
  accountId: {
    regex: /^.{1,20}$/,
    message: 'Account Number must be 20 characters or less',
  },
}

const testSheet = new Sheet(
  'Test Sheet',
  {
    accountId: TextField(),
    accountStatus: BooleanField(),
  },
  {
    recordCompute: (record) => {
      //ensuring the accountId is returned as a string
      const accountNum = record.get('accountId') as string
      //here we reference the fields we defined at the top, the RegEx, and the error message we want to display if the field does not pass its RegEx.
      if (FIELDS['accountId'].regex.test(accountNum) === false) {
        record.set('accountStatus', false)
        record.addError('accountId', FIELDS.accountId.message)
      } else {
        record.set('accountStatus', true)
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
  test('21 Characters', async () => {
    // for this inputRow
    const inputRow = { accountId: '1234567890asdfghjkjhg', accountStatus: true }
    // we expect this output row
    const expectedOutputRow = {
      accountId: '1234567890asdfghjkjhg',
      accountStatus: false,
    }
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
    expect(res).toMatchObject(expectedOutputRow)
  })

  //additional tests for additional cases
  test('19 Characters', async () => {
    const inputRow = { accountId: '1234567890asdfghjkj', accountStatus: true }
    const expectedOutputRow = {
      accountId: '1234567890asdfghjkj',
      accountStatus: true,
    }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Test Unexpected Characters', async () => {
    const inputRow = { accountId: 'd sdfl &&^$% 23', accountStatus: true }
    const expectedOutputRow = {
      accountId: 'd sdfl &&^$% 23',
      accountStatus: true,
    }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
})
