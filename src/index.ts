// This is a scaffold for defining a Workbook with Sheets and Portals
// Optionally - copy in a working example at /examples/FullExample.ts

import {
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'


/* 
Sheets 

Replace this with your Sheet imports or definitions
or, import sheets like

import { YourSheet } from '/path-to-your-sheet/your-sheet.ts'
*/
const MySheet = new Sheet(
  'MySheet',
  {
    exampleField: TextField({}),
  },
)

/* 
Portals 

Replace with your Portal definitions
or, import portals like 

import { YourPortal } from '/path-to-your-portal/your-portal.ts'
*/
const MyPortal = new Portal({
  name: 'MyPortal',
  sheet: 'MySheet'
})

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
export default new Workbook({
  name: 'MyWorkbook',
  namespace: 'my-workbook',
  portals: [
    MyPortal
  ],
  sheets: {
    MySheet,
  }
})