// example Sheet with how you might import custom and reuasable fields and recordCompute functions. 

import {
  NumberField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Examples of custom defined fields
import makeUrlField from '../fields/url'
import makeLinkedInField from '../fields/linked-in'
import makeCountryField from '../fields/country'

// Examples of custom defined data hooks
import joinFieldsRecordCompute from '../data-hooks/join-fields-record-compute'
import splitFieldsRecordCompute from '../data-hooks/split-fields-record-compute'
import rankBatchRecordsCompute from '../data-hooks/rank-batch-records-compute'

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
    revenue: NumberField({
      description: "Avg. Annual Revenue"
    }),
    industry: TextField({
      description: "The industry"
    }),
    code: TextField({
      label: 'Set by recordCompute',
      description: "The internal code name for organization"
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
      // example of how you might write and organize reuasable recordCompute functions. 
      
      // recieves original record and returns record with a value set to 'code' field
      const recordWithCode = joinFieldsRecordCompute( 
        record,
        [record.get('id'), record.get('name').toLowerCase()],
        '-',
        'code' 
      )

      // recieves updated record (with 'code') and returns record with value set to 'fullname' field
      const recordWithCodeAndFullName = splitFieldsRecordCompute( 
        record,
        'fullName',
        ' ',
        [record.get('firstName'), record.get('lastName')],
      )

      // the final record with values set on 'code' and 'fullName' fields
      return recordWithCodeAndFullName

    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {

      // this custom batch function takes all records from import to compare and set a priority value to the 'rank' field 
      return await rankBatchRecordsCompute(payload.records)
    },
  }
)
