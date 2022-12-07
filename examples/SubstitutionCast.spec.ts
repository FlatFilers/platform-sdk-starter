import { Sheet, TextField, Workbook, SubstitutionCast } from '@flatfile/configure'
import { SheetTester } from '../src/utils/testing/SheetTester'




const spanishNumeralSynonyms = [
  ['1', 'one', 'un'],
  ['2', 'two', 'dos'],
]


const SpanishNumeralCast = SubstitutionCast(
  spanishNumeralSynonyms,
  2,
  (val) => `Couldn't convert '${val}' to a spanish number`
)

// Substitution cast is used to coerce synonym values to a desired
// value.  In this case '1', 'one', and 'un' are synonyms.  If any of
// the three are found in a field using this cast, the value is set as
// the last item of the list.  Substitution cast compares string  case
// insensitive.


// note sheet must have same name as key in workbook it is shared as
const SubSheet = new Sheet(
  'SubSheet',
  {numField: TextField({cast:SpanishNumeralCast})})

const TestWorkbook = new Workbook({
  name: `Test Workbook`,
  namespace: 'test',
  // saving SubSheet to workbook under key SubSheet
  sheets: { SubSheet },
})

describe('Workbook tests ->', () => {
  // here we use Sheet tester
  const testSheet = new SheetTester(TestWorkbook, 'SubSheet')
  test('Spanish number word works', async () => {
    // for this inputRow
    const inputRow = { numField: 'un'}
    // we expect this output row
    const expectedOutputRow = { numField: 'un'}
    const res = await testSheet.testRecord(inputRow)
    //call the expectation here
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
