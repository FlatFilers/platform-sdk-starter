import {
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'

import { DateField } from '../DateField'

const DateTestSheet = new Sheet(
  'DateTest',
  {
    raw: TextField(),
    castDate : DateField({stageVisibility:{mapping:false}})
  }
)

const DatePortal = new Portal({
  name: 'DatePortal',
  sheet: 'DateTest'
})


export default new Workbook({
  name: 'DateTest',
  namespace: 'examples',
  sheets: {
    DateTestSheet,
  },
  portals: [DatePortal],
})
