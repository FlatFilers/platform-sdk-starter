/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */

import {
  NumberField,
  Portal,
  Sheet,
  TextField,
  Workbook,
  OptionField,
} from '@flatfile/configure'
import * as hooks from './datahooks/hooks'
import * as emailValidator from 'email-validator'
import { SmartDateField } from '../examples/fields/SmartDateField'

/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */
const MySheet = new Sheet('encompass', {
  'Borrower First/Middle Name': TextField({
    label: 'First Name',
    required: true,
    validate: (name: string) => {
      const regex = /^[\D\s]+$/g
      if (!regex.test(name)) {
        return [
          new Message(
            'Names cannot contain numbers',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (name: string) => {
      let names = name.split(' ')
      names = names.filter(n => n)

      for (let i = 0; i < names.length; i++) {
        const regex = /\sand\s/gi
        if (regex.test(names[i])) {
          names[i] = names[i].replace(regex, '&')
        } else {
          names[i] = names[i][0].toUpperCase() + names[i].substring(1).toLowerCase()
        }
      }
      
      return names.join(' ')
    }
  }),

  'Borrower Last Name/Suffix': TextField({
    label: 'Last Name',
    validate: (name: string) => {
      const regex = /^[\D\s]+$/g
      if (!regex.test(name)) {
        return [
          new Message(
            'Names cannot contain numbers',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (name: string) => {
      const names = name.split(' ')

      for (let i = 0; i < names.length; i++) {
        names[i] = names[i][0].toUpperCase() + names[i].substring(1).toLowerCase();
      }

      return names.join(' ')
    }
  }),

  'Borr Cell Phone': TextField({
    label: 'Phone',
    description: 'XXX-XXX-XXXX',
    validate: (phone: string) => {
      const regex = /^(\+?\d{1,2})?\s?([-.\s\(])?\d{3}\)?([-.\s\)])?\d{3}[-.\s]?\d{4}$/g
      if (!regex.test(phone)) {
        return [
          new Message(
            'Invalid phone number',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (phone: string) => {
      const regex = /^[\)\(\*\s-(N/?A)]+$/g
      if (regex.test(phone)) {
        return ''
      } else {
        return phone
      }
    }
  }),

  'Borr Email': TextField({
    label: 'Email',
    required: true,
    description: 'Tip! Double check the emails are complete, valid, and match the associated client on that row.',
    validate: (email: string) => {
      const regex = /[\w-]+@([\w-]+\.)+[\w-]+/g
      const noneRegex = /^(none|noemail|fakeemail|na|N\/A)@/gi
      if (!regex.test(email) || noneRegex.test(email) || !emailValidator.validate(email)) {
        return [
          new Message(
            'Invalid email',
            'error',
            'validate'
          )
        ]
      } 
    }
  }),

  'Borr DOB': SmartDateField({
    label: 'Date of Birth',
    description: 'MM/DD/YYYY (This field is used to display reverse mortgage for eligible homeowners).',
    locale: 'en',
    formatString: 'M/d/yyyy'
  }),

  'Borr Language Preference': OptionField({
    label: 'Language Preference',
    description: 'English or Spanish',
    options: {
      english: 'en',
      spanish: 'es'
    }
  }),

  'Co-Borrower First/Middle Name': TextField({
    label: 'Co-Borrower First Name',
    validate: (name: string) => {
      const regex = /^[\D\s]+$/g
      if (!regex.test(name)) {
        return [
          new Message(
            'Names cannot contain numbers',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (name: string) => {
      const names = name.split(' ')

      for (let i = 0; i < names.length; i++) {
        names[i] = names[i][0].toUpperCase() + names[i].substring(1).toLowerCase();
      }

      return names.join(' ')
    }
  }),

  'Co-Borrower Last Name/Suffix': TextField({
    label: 'Co-Borrower Last Name',
    validate: (name: string) => {
      const regex = /^[\D\s]+$/g
      if (!regex.test(name)) {
        return [
          new Message(
            'Names cannot contain numbers',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (name: string) => {
      const names = name.split(' ')

      for (let i = 0; i < names.length; i++) {
        names[i] = names[i][0].toUpperCase() + names[i].substring(1).toLowerCase();
      }

      return names.join(' ')
    }
  }),

  'Co-Borr Cell Phone': TextField({
    label: 'Co-Borr Phone',
    description: 'XXX-XXX-XXXX',
    validate: (phone: string) => {
      const regex = /^(\+?\d{1,2})?\s?([-.\s\(])?\d{3}\)?([-.\s\)])?\d{3}[-.\s]?\d{4}$/g
      if (!regex.test(phone)) {
        return [
          new Message(
            'Invalid phone number',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (phone: string) => {
      const regex = /^[\)\(\*\s-(N/?A)]+$/g
      if (regex.test(phone)) {
        return ''
      } else {
        return phone
      }
    }
  }),

  'Co-Borr Email': TextField({
    label: 'Co-Borr Email',
    description: 'Tip! Double check the emails are valid and complete and match the associated client on that row.',
    validate: (email: string) => {
      const regex = /[\w-]+@([\w-]+\.)+[\w-]+/g
      const noneRegex = /^(none|noemail|fakeemail|na|N\/A)@/gi
      if (!regex.test(email) || noneRegex.test(email) || !emailValidator.validate(email)) {
        return [
          new Message(
            'Invalid email',
            'error',
            'validate'
          )
        ]
      } 
    }
  }),

  'Co-Borr DOB': SmartDateField({
    label: 'Co-Borr Date of Birth',
    description: 'MM/DD/YYYY (This field is used to display reverse mortgage for eligible homeowners).',
    locale: 'en',
    formatString: 'M/d/yyyy'
  }),

  'Co-Borr Language Preference': OptionField({
    label: 'Co-Borr Language Preference',
    description: 'English or Spanish',
    options: {
      english: 'en',
      spanish: 'es'
    }
  }),

  'Subject Property Address': TextField({
    label: 'Subject Property Address',
    description: '123 Main Street #1 (Please include the full street address and unit number. Ensure that the address is a residential property, not serviced by a PO Box or commercial. Do not include city and state in this field)',
    validate: (addy: string) => {
      const regex = /(\d)+(-?)[a-zA-Z]?\s+([a-zA-Z0-9])+/g
      if (!regex.test(addy)) {
        return [
          new Message(
            'Invalid propery address',
            'error',
            'validate'
          )
        ]
      }
    }
  }),

  'Subject Property Zip': TextField({
    label: 'Subject Property Zip',
    description: 'XXXXX (5 digit zip code)',
    validate: (zip: string) => {
      const regex = /^[0-9]{5}$/
      if (!regex.test(zip)) {
        return [
          new Message(
            'Invalid zip code',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (zip: string) => {
      if (zip.length > 5) {
        return zip.slice(0, 5)
      } else if (zip.length === 4) {
        return '0' + zip
      } else {
        return zip
      }
    }
  }),

  'Subject Property Appraised Value': TextField({
    label: 'Subject Property Appraised Value',
    validate: (amount: string) => {
      const numRegex = /(^\d+$)|(^\d*,?\d*,?\d*.?(\d{1,2})?$)/g
      if (!numRegex.test(amount)) {
        return [
          new Message(
            'Invalid numeric amount',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (value: string) => {
      return value.replace('$', '').trim()
    }
  }),

  'Subject Property Appraised Date': SmartDateField({
    label: 'Subject Property Appraised Date',
    locale: 'en',
    description: 'Smart dates',
    formatString: 'M/d/yyyy'
  }),

  'Subject Property Purchase Price': TextField({
    label: 'Subject Property Purchase Price',
    compute: (value: string) => {
      return value.replace('$', '').trim()
    }
  }),

  'Subject Property Purchase Date': SmartDateField({
    label: 'Subject Property Purchase Date',
    locale: 'en',
    description: 'Smart dates',
    formatString: 'M/d/yyyy'
  }),

  'Total Loan Amount': TextField({
    label: 'Total Loan Amount',
    validate: (amount: string) => {
      const numRegex = /(^\d+$)|(^\d*,?\d*,?\d*.?(\d{1,2})?$)/g
      if (!numRegex.test(amount)) {
        return [
          new Message(
            'Invalid numeric amount',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (value: string) => {
      return value.replace('$', '').trim()
    }
  }),

  'Interest Rate': TextField({
    label: 'Interest Rate',
    compute: (value: string) => {
      const rate = value.replace('%', '').trim()
      if (rate.match(/^0+.?0{0,2}$/g)) {
        return '0.01'
      } else {
        return value
      }
    }
  }),

  // '30 Year Fixed' -> 360
  // '360 Months' -> 360
  // '30' -> 360 
  'Loan Term': OptionField({
    label: 'Loan Term',
    matchStrategy: 'exact',
    options: {
      '120': '120',
      '180': '180',
      '240': '240',
      '264': '264',
      '300': '300',
      '360': '360'
    },
    compute: (value: any) => {
      const labels = ['120', '180', '240', '264', '300', '360']
      let term = value.toString()
      if (!labels.includes(term)) {
        term = term.replace(/\D/g, '').trim()
        if (labels.includes(String(term))) {
          return term
        }
        if (term <= 30) {
          const product : number = Number(term) * 12
          return String(product)
        } else {
          return term
        }
      } else {
        return term
      }
    }
  }),

  'Loan Purpose': TextField({
    label: 'Loan Purpose'
  }),

  'Closing Date': SmartDateField({
    label: 'Closing Date',
    locale: 'en',
    description: 'Smart dates',
    formatString: 'M/d/yyyy'
  }),

  'NMLS Loan Originator ID': TextField({
    label: 'Loan Officer NMLS ID',
    compute: (nmls: string) => {
      return nmls.replace(/\D/g, '').trim()
    }
  }),

  'Lender NMLS ID': NumberField({
    label: 'Company NMLS ID'
  }),

  'NMLS Loan Type': OptionField({
    label: 'NMLS Loan Type',
    matchStrategy: 'exact',
    options: {
      'ResidentialFirst': 'ResidentialFirst',
			'ClosedEndSecond': 'Second',
			'HELOC': 'HELOC',
			'ReverseMortgage': 'Reverse Mortgage',
			'Construction': 'Construction',
			'MultiFamily': 'Multifamily',
			'Commercial': 'Commercial',
			'Other': 'Other'
    }
  }),

  'Total Monthly Payment': TextField({
    label: 'Total Monthly Payment',
    validate: (amount: string) => {
      const numRegex = /(^\d+$)|(^\d*,?\d*,?\d*.?(\d{1,2})?$)/g
      if (!numRegex.test(amount)) {
        return [
          new Message(
            'Invalid numeric amount',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (value: string) => {
      return value.replace('$', '').trim()
    }
  }),

  'Mortgage Insurance Premium': TextField({
    label: 'Mortgage Insurance Premium',
    validate: (amount: string) => {
      const numRegex = /(^\d+$)|(^\d*,?\d*,?\d*.?(\d{1,2})?$)/g
      if (!numRegex.test(amount)) {
        return [
          new Message(
            'Invalid numeric amount',
            'error',
            'validate'
          )
        ]
      }
    },
    compute: (value: string) => {
      const regex = /[A-Za-z\s]+/g
      if (value.includes('$')) {
        return value.replace('$', '').trim()
      } else if (regex.test(value)) {
        return ''
      } else {
        return value
      }
    }
  }),

  'First Payment Due Date': SmartDateField({
    label: 'First Payment Due Date',
    locale: 'en',
    description: 'Smart dates',
    formatString: 'M/d/yyyy'
  }),

  'Loan Number': TextField({
    label: 'Loan Number'
  }),

  'Lien Position': TextField({
    label: 'Lien Position'
  }),

  'Amort Type': TextField({
    label: 'Amort Type'
  }),

  'Loan Type': TextField({
    label: 'Loan Type'
  }),

  'Occupancy (PSI)': OptionField({
    label: 'Occupancy (Primary, Secondary, Investment)',
    options: {
      primary: 'Primary',
      secondary: 'Secondary',
      investment: 'Investment'
    }
  })
}, 
{
  allowCustomFields: true,
  recordCompute: (record) => {
    hooks.conditionalFormatting(record)
    hooks.highlyEncouraged(record)
    hooks.miscellaneousPhoneRemover(record)
    hooks.coborrowerEmailCheck(record)
    return record
  }
})

/**
 * Portals
 * Define your Portals here, or import them:
 * import { YourPortal } from './path-to-your-portal/your-portal.ts'
 */
const MyPortal = new Portal({
  name: 'hb_main',
  sheet: 'encompass',
})

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
export default new Workbook({
  name: 'MyWorkbook',
  namespace: 'my-workbook',
  portals: [MyPortal],
  sheets: {
    MySheet,
  },
})
