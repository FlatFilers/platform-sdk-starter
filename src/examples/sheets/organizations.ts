// example Sheet with how you might import custom and reuasable fields and recordCompute functions. 

import {
  NumberField,
  Sheet,
  TextField,
} from '@flatfile/configure'

import {
  FlatfileRecord,
  FlatfileRecords
} from '@flatfile/hooks'

// Examples of custom defined fields
import makeUrlField from '../fields/url'
import makeLinkedInField from '../fields/linked-in'
import makeCountryField from '../fields/country'

// Examples of custom defined data hooks
import joinFieldsRecordCompute from '../data-hooks/join-fields-record-compute'
import splitFieldRecordCompute from '../data-hooks/split-field-record-compute'
import rankBatchRecordsCompute from '../data-hooks/rank-batch-records-compute'

export default new Sheet(
  'Organizations',
  {
    id: NumberField({
      required: true,
      unique: true
    }),
    identifier: NumberField({
      required: true,
      description: "A coded identifier in three parts (e.g: abc-123-zy)"
    }),
    identiferRoot: TextField({
      label: 'Set by recordCompute',
      description: "The internal code name for organization"
    }),
    identiferZone: TextField({
      label: 'Set by recordCompute',
      description: "The internal code name for organization"
    }),
    identifierRegion: TextField({
      label: 'Set by recordCompute',
      description: "The internal code name for organization"
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
    recordCompute: (record: FlatfileRecord<any>) => {
        
      // split value of an 'identifier' field into 3 parts
      const [identiferRoot, identiferZone, identifierRegion] = splitFieldRecordCompute(record.get('identifier'), '-', 3) 
  
      // joins field values into a 'code' field with '-' seperator
      const code = joinFieldsRecordCompute([record.get('id'), identiferRoot], '-')

      // set the field values and return record
      record.set('identiferRoot', identiferRoot)
      record.set('identiferZone', identiferZone)
      record.set('identifierRegion', identifierRegion)
      record.set('code', code)
      return record

    },
    batchRecordsCompute: (payload: FlatfileRecords<any>) => {
      
      // example function compares inputs of all import records to assign a priority 'rank' to each record
      const rankedResults = rankBatchRecordsCompute(payload.records)

      // map the priorty rank to each record
      payload.records.map(function(record: FlatfileRecord<any>) {
        const rank = rankedResults.find((r: { id: any }) => r.id === record.id)
        record.set('rank', rank)
      })

    },
  }
)
