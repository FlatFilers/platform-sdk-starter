import _ from 'lodash'
import {
  FlatfileRecord,
} from '@flatfile/hooks'

import {
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'
import {SmartDateField } from '../fields/SmartDateField'



/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 *
 * This sheet combined with sample-uploads shows how SmartDateField handles a variety of date formats
 */
const DateSheet = new Sheet(
  'DateSheet',
  {
    fstring: TextField(),
    raw_date: TextField(),
    base_date: SmartDateField({}),
    en_date: SmartDateField({locale:'en', formatString:'yyyy-MM-dd'}),
    Fr_date: SmartDateField({locale:'fr'}),
    Nl_date: SmartDateField({locale:'nl'}),
    Ru_date: SmartDateField({locale:'ru'}),
    De_date: SmartDateField({locale:'de'}),
    descriptions: TextField()
  },
  {
    recordCompute: (rec:FlatfileRecord) => {

      if(!_.isEqual(rec.get('base_date'), rec.get('en_date'))) {
	rec.pushInfoMessage('en_date', 'Not equal to base_date', 'error', 'other')
      }
    }
  }
)

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
