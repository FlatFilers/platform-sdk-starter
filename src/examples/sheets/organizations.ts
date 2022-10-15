import {
  NumberField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Custom fields
import { Url } from './fields/url'
import { LinkedIn } from './sheets/linked-in'
import { Countries } from './sheets/countries'

// Custom record hooks
import { VerifyUrls } from './record-hooks/verify-urls'

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
    country: Countries(),
    website: Url({
      description: "Marketing Website",
      required: true,
    }),
    linkedIn: LinkedIn(),
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

      VerifyUrls(payload)

    },
  }
)
