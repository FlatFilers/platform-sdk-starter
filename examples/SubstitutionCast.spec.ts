import { Sheet, TextField, Workbook, SubstitutionCast } from '@flatfile/configure'
import { SheetTester } from '../src/utils/testing/SheetTester'

const numberSet = [
  ['1', 'one', 'un'],
  ['2', 'two', 'dos'],
]

const SpanishNum = SubstitutionCast(
  numberSet,
  2,
  (val) => `Couldn't convert '${val}' to a spanish number`
)

// note sheet must have same name as key in workbook it is shared as
const SubSheet = new Sheet(
  'SubSheet',
  {numField: TextField({cast:SpanishNum})})

const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  // saving SubSheet to workbook under key SubSheet
  sheets: { SubSheet },
})

describe('Workbook tests ->', () => {
  const testSheet = new SheetTester(TestWorkbook, 'SubSheet')
  test('Spanish number word works', async () => {
    const inputRow = { numField: 'un'}
    const expectedOutputRow = { numField: 'un'}
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })

  test('Convert to spanish number word works', async () => {
    const inputRow = { numField: 'un'}
    const expectedOutputRow = { numField: 'un'}
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)

    const res2 = await testSheet.testRecord({ numField: 'two'})
    expect(res).toMatchObject({ numField: 'dos' })
  })

  // test('see how an error is handled ', async () => {
  //   // hold off for Paddy to fix
  //   const inputRow = { numField: 'not a number'}
  //   const expectedOutputRow = { numField: 'sadf'}
  //   const res = await testSheet.testRecord(inputRow)
  //   expect(res).toMatchObject(expectedOutputRow)
  // })
})
