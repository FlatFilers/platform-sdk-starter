import {
  Sheet,
  Workbook,
  TextField,
  LinkedField,
  BooleanField,
  DateField,
  Message,
  NumberField,
  OptionField,
} from '@flatfile/configure'

const BaseSheet = new Sheet(
  'BaseSheet',
  {
    firstName: TextField({
      unique: true,
      primary: true,
    }),
    middleName: TextField('Middle'),
    lastName: TextField(),
  },
  {
    previewFieldKey: 'middleName',
  }
)

const SheetWithLink = new Sheet('SheetWithLink', {
  nickname: TextField(),
  firstName: LinkedField({
    label: 'First Name',
    sheet: BaseSheet,
  }),
})

const NewSheetFromSDK = new Sheet(
  'NewSheetFromSDK',
  {
    firstName: TextField({
      required: true,
      description: 'foo',
      unique: true,
    }),
    lastName: TextField({
      default: 'bar',
      compute: (val: string): string => {
        if (val === 'bar') {
          return 'baz'
        }
        return val
      },
      validate: (val: string): void | Message[] => {
        if (val === 'Rock') {
          throw 'Rock is not allowed'
        }
      },
    }),
    middleName: TextField(),
    boolean: BooleanField(),
    phoneNumber: TextField({
      default: '555-555-5557',
    }),
    age: NumberField({
      description: 'Age in Dog Years',
    }),
    selectOptions: OptionField({
      label: 'Lots of options',
      description: 'Select from a list of options',
      options: {
        red: 'Red Thing',
        blue: { label: 'Blue Label' },
        orange: { label: 'Orange peel' },
        green: { label: 'Green is the best' },
      },
    }),
    startDate: DateField('Start Date'),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute(record: any, logger: any) {
      const fName = record.get('firstName')
      logger.info(`lastName was ${record.get('lastName')}`)
      record.set('lastName', fName)
      return record
    },
  }
)

export default new Workbook({
  name: 'Template with a link',
  namespace: 'relational-link-test',
  sheets: {
    BaseSheet,
    SheetWithLink,
    NewSheetFromSDK,
  },
})
