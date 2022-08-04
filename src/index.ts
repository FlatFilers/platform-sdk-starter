import {
  Sheet,
  Workbook,
  TextField,
  BooleanField,
  NumberField,
  OptionField,
  Message,
} from '@flatfile/configure'

const NewTemplateFromSDK = new Sheet(
  'NewSimpleDDLTemplate',
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
    startDate: TextField('Date that Started'),
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
  name: 'Category And Boolean Onboarding',
  namespace: 'onboarding',
  sheets: {
    NewTemplateFromSDK,
  },
})
