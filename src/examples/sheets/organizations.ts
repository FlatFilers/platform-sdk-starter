import {
  NumberField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Custom fields
import { makeUrlField } from './fields/url'
import { makeLinkedInField } from './fields/linked-in'
import { makeCountryField } from './fields/country'

// Custom data hooks
import { BatchVerifyUrls } from './data-hooks/batch-verify-urls'
import { BatchRankRecords } from './data-hooks/batch-rank-records'

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
    websiteIsLive: TextField({
       label: 'Set by batchRecordCompute',
       description: 'Validation to ensure webiste has a 200 http response'
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

      let records = payload.records

      // records sent to API call that will check each URL for a 200 status
      // TODO - should this pass in and return the FlatfileRecords with mapped fields ?
      records = BatchVerifyUrls(records, 'websiteIsLive')

      // records sent API call that sets a rank for each record
      // TODO - should this pass in and return the FlatfileRecords with mapped fields ?
      records = BatchRankRecords(records, 'rank')

      // map updated records
      records.map((record) => {
        record.set('websiteIsLive', record.websiteIsLive)
        record.set('rank', record.rank)
      })

    },
  }
)
