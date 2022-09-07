import { format, isDate, isFuture, parseISO } from 'date-fns'
//import $ from jquery;
import {} from '@flatfile/hooks'
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
      validate: (phoneNumber: string) => {
        if (phoneNumber) {
          let validPhone = formatPhoneNumber(phoneNumber)
          if (validPhone === 'Invalid phone number') {
            return [
              new Message(
                'This does not appear to be a valid phone number',
                'error',
                'validate'
              ),
            ]
          }
        }
      },
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
    zipCode: TextField({
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
    recordCompute: (record, logger) => {
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
      if (!record.get('phoneNumber') && !record.get('email')) {
        record.addWarning(
          ['email', 'phoneNumber'],
          'Please include one of either Phone or Email'
        )
      }

      //Phone normalization and validation -- moved up to phoneNumber field as validate type hook rather than recordCompute
      // if (record.get('phoneNumber')) {
      //   const phone = record.get('phoneNumber') as string
      //   let validPhone = formatPhoneNumber(phone)
      //   if (validPhone !== 'Invalid phone number') {
      //     return phone
      //   } else {
      //     record.addError(
      //       'phoneNumber',
      //       'This does not appear to be a valid phone Number'
      //     )
      //   }
      // }

      //date normalization and validation ** come back to this, it's not recognizing the future dates
      if (record.get('createDate')) {
        let newDate = record.get('create.Date') as string
        let thisDate = format(new Date(newDate), 'yyyy-MM-dd')
        let realDate = parseISO(thisDate)
        if (isDate(realDate)) {
          if (isFuture(realDate)) {
            record.addError('createDate', 'Date cannot be in the future')
          } else {
            record.addError(
              'createDate',
              'Please check that the date is formatted yyyy-MM-dd'
            )
          }
        }
      }
      //logger.info('hello')
      //zip code padding
      if (record.get('zipCode')) {
        let zip = record.get('zipCode') as string
        if (zip.length < 5 && record.get('country') === 'US') {
          zip = zip.padStart(5, '0')
          record.set('zipCode', zip)
          record.addInfo('zipCode', 'Zip Code was padded with zeroes')
        }
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
