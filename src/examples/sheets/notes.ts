import {
  NumberField,
  OptionField,
  Sheet,
  TextField,
} from '@flatfile/configure'

export default new Sheet(
  'People',
  {
    personId: NumberField({
      required: true,
      description: 'This is the same person id in people sheet',
    }),
    note: TextField({
      required: true,
      description: 'set by recordCompute',
    }),
    createdOn: TextField({
      description: 'set by recordCompute',
    }),
    label: OptionField({
      label: 'Type of note',
      options: {
        internal: 'Internal',
        support: 'Support',
        other: 'Other',
      },
    }),
  }
)
