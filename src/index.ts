/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */

import {
  NumberField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'

import {SmartDateField } from '../examples/fields/SmartDateField'

/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */
const DateSheet = new Sheet('DateSheet', {
  fstring: TextField(),
  raw_date: TextField(),
  base_date: SmartDateField({}),
  en_date: SmartDateField({locale:'en'}),
  Fr_date: SmartDateField({locale:'fr'}),
  Ja_date: SmartDateField({locale:'ja'}),
  Nl_date: SmartDateField({locale:'nl'}),
  Ru_date: SmartDateField({locale:'ru'}),
  De_date: SmartDateField({locale:'de'}),
  descriptions: TextField()
})

/**
 * Portals
 * Define your Portals here, or import them:
 * import { YourPortal } from './path-to-your-portal/your-portal.ts'
 */
const MyPortal = new Portal({
  name: 'MyPortal',
  sheet: 'DateSheet',
})

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
export default new Workbook({
  name: 'MyWorkbook',
  namespace: 'my-workbook',
  portals: [MyPortal],
  sheets: {
    DateSheet
  },
})
