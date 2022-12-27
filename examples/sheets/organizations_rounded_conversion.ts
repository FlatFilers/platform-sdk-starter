// example Sheet with how you might import custom and reuasable fields and recordCompute functions.

import { NumberField, Sheet, TextField } from '@flatfile/configure'

import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'

// Example of custom defined fields
import customUrlField from '../fields/url'

// Examples of custom defined data hooks
import joinFieldsRecordCompute from '../hooks/join-fields-record-compute'
import splitFieldRecordCompute from '../hooks/split-field-record-compute'

export default new Sheet(
  'Organizations',
  {
    id: NumberField({
      required: true,
      unique: true,
    }),
    identifier: NumberField({
      required: true,
      description: 'A coded identifier in three parts (e.g: abc-123-zy)',
    }),
    identiferRoot: TextField({
      label: 'Set by recordCompute',
      description: 'The internal code name for organization',
    }),
    identiferZone: TextField({
      label: 'Set by recordCompute',
      description: 'The internal code name for organization',
    }),
    identifierRegion: TextField({
      label: 'Set by recordCompute',
      description: 'The internal code name for organization',
    }),
    name: TextField({
      required: true,
    }),
    revenue: NumberField({
      description: 'Avg. Annual Revenue',
    }),
    industry: TextField({
      description: 'The industry',
    }),
    
    code: TextField({
      label: 'Set by recordCompute',
      description: 'The internal code name for organization',
    }),
    website: customUrlField({
      description: 'Marketing website',
      required: true,
    }),
    linkedIn: customUrlField({
      label: 'LinkedIn profile',
    }),
    currency_conversion: NumberField({
      label: 'Currency Conversion',
      required: false,
      primary: true,
      unique: true,
      description: 'Currency Conversion at the time of upload.',
      annotations: {
        default: true,
        defaultMessage: 'This field was automatically given a default value of',
        compute: true,
        //Message displayed in UI when Currency Conversion field is computed.  No message will show if field is not computed.
        computeMessage: 'This value was automatically reformatted to two decimal places. Original value was: ',
      },
      stageVisibility: {
        mapping: true,
        review: true,
        export: true
      },
      default: 1,
      //Currency Conversion field will be rounded to two decimal places
      compute: (v: number) => {return Number(v.toFixed(2))},
    }),
  },
  {
    allowCustomFields: true,
    recordCompute: (record: FlatfileRecord<any>) => {
      // split value of an 'identifier' field into 3 parts
      const [identiferRoot, identiferZone, identifierRegion] =
        splitFieldRecordCompute(record.get('identifier') as string, '-', 3)

      // joins field values into a 'code' field with '-' separator
      const code = joinFieldsRecordCompute(
        [record.get('id') as string, identiferRoot],
        '-'
      )

      // set the field values and return record
      record.set('identiferRoot', identiferRoot)
      record.set('identiferZone', identiferZone)
      record.set('identifierRegion', identifierRegion)
      record.set('code', code)
      return record
    },
  }
)
