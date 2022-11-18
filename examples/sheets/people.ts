import {
  BooleanField,
  NumberField,
  OptionField,
  Sheet,
  TextField,
} from '@flatfile/configure'

import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'

// Custom fields
import customUrlField from '../fields/url'

// Custom data hooks
import splitFieldRecordCompute from '../hooks/split-field-record-compute'

export default new Sheet(
  'People',
  {
    id: NumberField({
      required: true,
      unique: true,
    }),
    organizationId: NumberField({
      required: true,
      description: 'This is the same organization id in organizations sheet',
    }),
    firstName: TextField({
      description: 'set by recordCompute',
    }),
    lastName: TextField({
      description: 'set by recordCompute',
    }),
    fullName: TextField({
      required: true,
    }),
    homPhone: TextField({
      label: 'Personal Phone',
    }),
    workPhone: TextField({
      label: 'Work Phone',
    }),
    title: TextField(),
    linkedIn: customUrlField(),
    linkedInValid: BooleanField({
      description: 'set by batchRecordsCompute',
    }),
    isActive: BooleanField(),
    department: OptionField({
      label: 'Role',
      options: {
        engineering: { label: 'Engineering' },
        hr: 'People Ops',
        sales: 'Revenue',
      },
    }),
  },
  {
    recordCompute: (record: FlatfileRecord<any>) => {
      // reuses a function to split a field into multiple
      const [firstName, lastName] = splitFieldRecordCompute(
        record.get('fullName') as string,
        ' ',
        2
      )

      record.set('firstName', firstName)
      record.set('lastName', lastName)
      return record
    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
      // Sends records to an imaginary API endpoint that validates linkedIn urls
      // and writes the valid / invalid status to the record
      const urlsToValidate = await payload.records.map(
        async (record: FlatfileRecord) => {
          return record.get('linkedIn')
        }
      )
      const response = await fetch('your-api-to-check-linkedin-urls', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: JSON.stringify(urlsToValidate),
      })
      // Suppose response has the format:
      // {
      //    'https://linkedin.com/valid-url': 'valid',
      //    'https://linkedin.com/invalid-url': 'invalid',
      //    ...
      // }
      if (response.ok) {
        const result = await response.json()
        payload.records.map(async (record: FlatfileRecord) => {
          const linkedInValid =
            result[record.get('linkedIn') as string] === 'valid'
          record.set('linkedInValid', linkedInValid)
        })
      }
    },
  }
)
