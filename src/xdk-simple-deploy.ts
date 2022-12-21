import {
  Sheet,
  Workbook,
  TextField,
  Message,
  LinkedField,
} from '@flatfile/configure'

// const LinkedSheet = new Sheet(
//   'LinkedSheet',
//   {
//     firstName: TextField('First Name'),
//     middleName: TextField('Middle'),
//   },
//   {}
// )

const TestSheet = new Sheet(
  'TestSheet',
  {
    firstName: TextField('First Name'),
    middleName: TextField('Middle'),
    // linkedField: LinkedField({
    //   label: 'Link to LinkedSheet',
    //   sheet: LinkedSheet,
    // }),
    lastName: TextField({
      label: 'Last Name',
      compute: (val: string): string => {
        if (val == 'bar') {
          return 'baz'
        }
        return val
      },
      validate: (val: string): void | Message[] => {
        if (val === 'Rock') {
          throw 'Rock is not allowed!!!'
        }
      },
    }),
  },
  {
    previewFieldKey: 'middleName',
    recordCompute: (record) => {
      const firstName = String(record.get('firstName'))
      if (firstName) {
        if (firstName && firstName.includes(' ')) {
          const components = firstName.split(' ')
          if (components.length > 1 && components[1] !== '') {
            record.set('firstName', components[0])
            record.set('lastName', components[1])

            record
              .addInfo('firstName', 'Full name was split')
              .addInfo('lastName', 'Full name was split')
          }
        }
      }
    },
  }
)

export default new Workbook({
  name: 'Sheet from SDK',
  namespace: 'xdk-test',
  sheets: {
    TestSheet,
  },
})
