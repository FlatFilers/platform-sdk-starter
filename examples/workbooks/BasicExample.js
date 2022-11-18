// workbook javascript example with a simple sheet (no sheet options defined)

import {
  BooleanField,
  DateField,
  NumberField,
  OptionField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'

const BasicSheet = new Sheet(
  'BasicSheet',
  {
    id: NumberField({
      required: true,
      unique: true,
    }),
    firstName: TextField({
      required: true,
      description: 'Given name',
    }),
    lastName: TextField(),
    fullName: TextField(),
    startDate: DateField(),
    isActive: BooleanField(),
    department: OptionField({
      label: 'Department',
      options: {
        engineering: 'Engineering',
        hr: 'People Ops',
        sales: 'Revenue',
      },
    }),
  }
)

const BasicSheetPortal = new Portal({
  name: 'BasicSheetPortal',
  sheet: 'BasicSheet'
})

export default new Workbook({
  name: 'BasicSheetWorkbook',
  namespace: 'basic',
  sheets: {
    BasicSheet,
  },
  portals: [BasicSheetPortal],
})
