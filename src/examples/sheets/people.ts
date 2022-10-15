import {
  BooleanField,
  NumberField,
  OptionField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Custom fields
import { makePhoneField } from './fields/phone'
import { makeLinkedInField } from './fields/linked-in'

// Custom data hooks
import { RecordSplitName } from './data-hooks/record-split-name'

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
      const fullName = record.get('fullName')
      
      const [firstName, lastName] = RecordSplitName(fullName)

      record.set('firstName', firstName)
      record.set('lastName', lastName)
      
      return record
    }
  }
)
