import {
  BooleanField,
  NumberField,
  OptionField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Custom fields
import makePhoneField from '../fields/phone'
import makeLinkedInField from '../fields/linked-in'

// Custom data hooks
import splitFieldsRecordCompute from '../data-hooks/split-fields-record-compute'

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
    recordCompute: (record) => {
      // reuses a common function that can split a field into multiple fields. 
      return splitFieldsRecordCompute( 
        record,
        'fullName',
        ' ',
        [record.get('firstName'),record.get('lastName')],
      )

    }
  }
)
