import {
  BooleanField,
  NumberField,
  OptionField,
  Sheet,
  TextField,
} from '@flatfile/configure'

import {
  FlatfileRecord,
  FlatfileRecords
} from '@flatfile/hooks'

// Custom fields
import makePhoneField from '../fields/phone'
import makeLinkedInField from '../fields/linked-in'

// Custom data hooks
import splitFieldRecordCompute from '../data-hooks/split-field-record-compute'

export default new Sheet(
  'People',
  {
    id: NumberField({
      required: true,
      unique: true
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
    homPhone: makePhoneField({
      label: 'Personal Phone'
    }),
    workPhone: makePhoneField({
      label: 'Work Phone'
    }),
    title: TextField(),
    linkedIn: makeLinkedInField(),
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
      const [firstName, lastName] = splitFieldRecordCompute(record.get('fullName'), ' ', 2)

      record.set('firstName', firstName)
      record.set('lastName', lastName)
      return record

    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
      // Example sends records to an API endpoint to check and write a true/false value to 'linkedInValid' field
      // This might be a longer running process - and you'll want to listen to event when it's finished
      // upon a success response, post processed records would be returned
      const response = await fetch('your-api-to-check-linkedin-urls', {
        method: 'POST',
        headers: { Accept: 'application/json',},
        body: payload.records
      })
      if (response.ok) {
        // TODO - make this realistic
        return response.json
      }
    },
  }
)
