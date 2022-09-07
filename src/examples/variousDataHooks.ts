import { format, isDate, isFuture, parseISO } from 'date-fns'
//import $ from jquery;
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import {
  Sheet,
  Workbook,
  TextField,
  BooleanField,
  NumberField,
  OptionField,
  Message,
} from '@flatfile/configure'

function formatPhoneNumber(phoneNumberString: string) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    var intlCode = match[1] ? '+1 ' : ''
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return 'Invalid phone number'
}

const Contacts = new Sheet(
  'Contacts',
  {
    firstName: TextField({
      required: true,
      label: 'First Name',
      description: 'First or Full Name',
    }),
    lastName: TextField({
      label: 'Last Name',
    }),
    email: TextField({
      description: 'Please enter your email address',
      unique: true,
      validate: (email: string) => {
        const regex =
          /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        if (!regex.test(email)) {
          return [
            new Message('must be a valid email address', 'error', 'validate'),
          ]
        }
      },
    }),
    phoneNumber: TextField({
      label: 'Phone Number',
    }),
    createDate: TextField({
      label: 'Create Date',
    }),
    country: TextField({
      label: 'Country',
      validate: (country: string) => {
        const regex = /^[A-Z]{2}$/
        if (!regex.test(country)) {
          return [new Message('must be a valid country', 'error', 'validate')]
        }
      },
    }),
    zipCode: NumberField({
      label: 'Zip Code',
    }),
    subscriber: BooleanField({
      label: 'Subscriber?',
    }),
    dealStatus: OptionField({
      label: 'Deal Status',
      options: {
        new: 'New',
        interested: 'Interested',
        meeting: 'Meeting',
        opportunity: 'Opportunity',
        unqualified: 'Not a fit',
      },
      required: true,
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record) => {
      //name splitting example: splits full names in the first name field
      if (record.get('firstName') && !record.get('lastName')) {
        const fName = record.get('firstName') as string
        if (fName?.includes(' ')) {
          const components = fName.split(' ')
          record.set('firstName', components.shift() ?? '')
          record.set('lastName', components.join(' '))
          record.addWarning(
            'lastName',
            'Automatically generated from full name'
          )
        }
      }

      //warning if no email and phone
      if (!record.get('phone') && !record.get('email')) {
        record.addWarning(
          ['email', 'phone'],
          'Please include one of either Phone or Email'
        )
      }
    },
  }
)

export default new Workbook({
  name: 'Sales Demo 4-21',
  namespace: 'Sales Demo 4-21',
  sheets: {
    Contacts,
  },
})
