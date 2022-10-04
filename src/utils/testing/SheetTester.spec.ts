import { SheetTester } from './SheetTester'
import TestWorkbook from './testWorkbook'

describe('Workbook tests ->', () => {
  const testSheet = new SheetTester(TestWorkbook, 'TestSheet')

  test('Single Record works', async () => {
    const inputRow = { firstName: 'foo', age: '10', testBoolean: 'true' }

    const expectedOutputRow = { age: 20, firstName: 'FOO', testBoolean: true }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Multiple Records work', async () => {
    const inputRows = [
      { firstName: 'foo', age: '10', testBoolean: 'true' },
      { firstName: 'bar', age: '8', testBoolean: 'true' },
    ]

    const expectedOutputRows = [
      { age: 20, firstName: 'FOO', testBoolean: true },
      { age: 16, firstName: 'BAR', testBoolean: true },
    ]

    const results = await testSheet.testRecords(inputRows)
    expect(results).toMatchObject(expectedOutputRows)
  })

  test('transformField() work', async () => {
    expect(await testSheet.transformField('firstName', 'alex')).toEqual('ALEX')
    expect(await testSheet.transformField('age', '10')).toEqual(20)
    expect(await testSheet.transformField('testBoolean', 'true')).toEqual(true)
  })
})
