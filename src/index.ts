// A template to define a Workbook with Sheets and Portals
// See examples in /examples/workbooks

import {
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'


// Sheets 
// import or define sheets.

// Example import
// import { Employees } from '/examples/sheets/employees'

// Example defininition
// const MySheet = new Sheet(
//   'MySheet',
//   {
//     exampleField: TextField({}),
//   },
//   {
//    // sheet options
//   }
// )

// Replace this with your Sheet imports or definitions
const MySheet = new Sheet(
  'MySheet',
  {
    exampleField: TextField({}),
  },
)

// Portal - Replace with your Portal 
const portals = [
  new Portal({
    name: 'MyPortal',
    sheet: 'MySheet'
  })
]

// Workbook  - Replace with your Workbooks export
export default new Workbook({
  name: 'MyWorkbook',
  namespace: 'my-workbook',
  portals,
  sheets: {
    MySheet,
  }
})
