import {
  NumberField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'
import { SheetTester } from '../../src/utils/testing/SheetTester'
import { CurrencyField, egressFormatter } from '../../src/fields/CurrencyField'


const CurrencySheet = new Sheet(
  'CurrencySheet',
  {
    as_text: TextField({}),
    as_number: NumberField({}),
    as_currency: CurrencyField({
      compute: (val:number) => (val + 1)
    }),
  },
)

const CurrencyPortal = new Portal({
  name: 'CurrencyPortal',
  sheet: 'CurrencySheet'
})

export const CurrencyBook =  new Workbook({
  name: 'CurrencyBook',
  namespace: 'test',
  sheets: {
    CurrencySheet
  },
  portals: [CurrencyPortal],
})



describe('Currency tests ->', () => {
  // currencySheet must match sheet name, not the workbook name
  const testSheet = new SheetTester(CurrencyBook, 'CurrencySheet')
  test('$ stripped', async () => {
    const inputRow = { as_text: "$5000", as_number: "$5000", as_currency: "$5000" }
    const expectedOutputRow = { as_text: "$5000", as_number: "$5000", as_currency: "$5,001.00" }
    const res = await testSheet.testRecord(inputRow)
    expect(res).toMatchObject(expectedOutputRow)
  })
  test('$ egressFormatter', async () => {
    expect(egressFormatter(5001)).toBe("$5,001.00")
  })
})

