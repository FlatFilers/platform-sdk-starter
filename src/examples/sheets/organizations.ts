import {
  NumberField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Custom fields
import { makeUrlField } from './fields/url'
import { makeLinkedInField } from './sheets/linked-in'
import { makeCountryField } from './sheets/country'

// Custom data hooks
import { BatchVerifyUrls } from './data-hooks/batch-verify-urls'

export default new Sheet(
  'Organizations',
  {
    id: NumberField({
      required: true,
      unique: true
    }),
    name: TextField({
      required: true,
    }),
    country: makeCountryField(),
    website: makeUrlField({
      description: "Marketing Website",
      required: true,
    }),
    linkedIn: makeLinkedInField(),
    score: NumberField({ label: 'Set by batchRecordCompute' })
  },
  {
    allowCustomFields: true,
    recordCompute: (record) => {
      const fullName = `{record.get('firstName')} {record.get('lastName')}`
      record.set('fullName', fullName)
      return record
    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {

      BatchVerifyUrls(payload)

    },
  }
)
