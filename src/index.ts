// A starting template to define your Workbook, Sheets and Portals
// See examples in the /examples directory

import {
  // BooleanField,
  // DateField,
  // Message,
  // NumberField,
  // OptionField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'

// rename 'MySheet' to your sheet name
const MySheet = new Sheet(
  'MySheet',
  {
    // An example field
    example: TextField({
      required: true,
      description: 'An example description',
    }),
    // add additional fields here...
  },
  {
    // add sheet options or Record Data Hooks
  }
)

const MyPortal = new Portal({
  name: 'MyPortal',
  sheet: 'MySheet'
})

export default new Workbook({
  name: 'MyWorkbook',
  namespace: 'my-workbook',
  sheets: {
    MySheet,
  },
  portals: [MyPortal],
})
