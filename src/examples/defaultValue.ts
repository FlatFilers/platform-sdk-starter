//import fetch from 'node-fetch'

import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import {
  Sheet,
  Workbook,
  TextField,
  BooleanField,
  NumberField,
  OptionField,
  Message,
} from '@flatfile/configure'

// Assigns a default value to the country field if it is empty
const defaultValue = new Sheet(
  'DefaultValue',
  {
    uniqueId: TextField({
      label: 'Unique ID',
      unique: true,
    }),
    createdAt: TextField({
      label: 'Created At',
    }),
    score: TextField({
      label: 'Score',
    }),
    question: TextField({
      label: 'Question',
    }),
    originalComment: TextField({
      label: 'Original Comment',
    }),
    language: TextField({
      label: 'Language',
    }),
    country: TextField({
      label: 'Country', default:'USA',
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    // recordCompute isn't needed here if we use the field level default

    // A common pattern/request that I see is  "default" or "compute" changed the value of a field, and we want to set an info message describing that change.  We purposely had compute only change values and not set messages too... it made for a cleaner easier to document function.  What would you all think of this "any change to value made by default or compute automatically gets an info message describing that change.. with no developer work"?

    
    // recordCompute: (record) => {
    //   const CountryField = record.get('country')
    //   if (CountryField === '') {
    //     record.set('country', 'USA')
    //     record.addWarning(
    //       'country',
    //       'Default Country of USA was applied, please edit if this is incorrect'
    //     )
    //   }
    // },
  }
)

export default new Workbook({
  name: 'Elisa Test',
  namespace: 'Elisa Reformat Country Code Test',
  sheets: {
    defaultValue,
  },
})
