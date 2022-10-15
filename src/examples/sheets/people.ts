import {
  BooleanField,
  NumberField,
  OptionField,
  Sheet,
  TextField,
} from '@flatfile/configure'

// Custom fields
import { Phone } from './sheets/phone'
import { LinkedIn } from './sheets/linked-in'

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
    homPhone: Phone({
      label: 'Personal Phone'
    }),
    workPhone: Phone({
      label: 'Work Phone'
    }),
    title: TextField(),
    linkedIn: LinkedIn(),
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

      const firstName = fullName.split(' ').slice(0, -1).join(' ');
      const lastName = fullName.split(' ').slice(-1).join(' ');

      record.set('firstName', firstName)
      record.set('lastName', lastName)
      
      return record
    }
  }
)
