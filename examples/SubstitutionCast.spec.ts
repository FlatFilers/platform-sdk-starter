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




// describe('Cast Function tests ->', () => {
//   const makeCastAssert = (castFn: any) => {
//     const assertFn = (raw: any, output: any): void => {
//       expect(castFn(raw)).toBe(output)
//     }
//     return assertFn
//   }
//   const makeCastAssertException = (castFn: any) => {
//     const assertFn = (raw: any, error: string): void => {
//       expect(() => {
//         castFn(raw)
//       }).toThrow(error)
//     }
//     return assertFn
//   }

//   test('SubstitutionCast works ', () => {


//     const assertNC = makeCastAssert(SpanishNum)
//     const assertThrow = makeCastAssertException(SpanishNum)

//     assertNC('1', 'un')
//     assertNC('two', 'dos')
//     assertThrow(
//       'not a number',
//       "Couldn't convert 'not a number' to a spanish number"
//     )
//   })
})
