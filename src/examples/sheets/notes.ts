import {
  NumberField,
  OptionField,
  Sheet,
  TextField,
  DateField,
} from '@flatfile/configure'

export default new Sheet(
  'Notes',
  {
    personId: NumberField({
      required: true,
      description: 'This is the same person id in people sheet',
    }),
    note: TextField({
      required: true,
      description: 'The text body of the note',
    }),
    createdOn: DateField({
      description: 'The date the note was created',
    }),
    updatedOn: DateField({
      description: 'The date the note was last edited',
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
