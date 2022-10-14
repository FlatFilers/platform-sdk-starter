import {
  BooleanField,
  DateField,
  Message,
  NumberField,
  OptionField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'

import validateUrl from './hooks/url'
import validatePhone from './hooks/phone'

const People = new Sheet(
  'People',
  {
    firstName: TextField({
      required: true,
    }),
    lastName: TextField({
      required: true,
    }),
    fullName: TextField({
      unique: true,
    }),
    phone: TextField({
      unique: true,
      validate: (phone: string) => {
        validatePhone(phone)
      },
    }),
    title: TextField(),
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
      const fullName = `{record.get('firstName')} {record.get('lastName')}`
      record.set('fullhName', fullName)
      return record
    }
  }
)

const Organizations = new Sheet(
  'Organizations',
  {
    name: TextField({
      required: true,
    }),
    website: TextField({
      required: true,
    }),
    linkedIn: TextField({
      label: 'LinkedIn Profile',
      description: 'Public LinkedIn company page',
      validate: (linkedIn: string) => {
        validateUrl(linkedIn)
      },
    }),
    score: NumberField({ label: 'Set by batchRecordCompute' })
  },
  {
    allowCustomFields: true,
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {

      // Two API calls will be made after all records are initially processed
      
      // 1. API call to check each LinkedIn URL to ensure it works
      

      // 2. Rank all organizations by a score
      const postParams = { method: 'post', headers, body: payload}
      const response = await fetch('YOUR API WITH LOGIC', postParams)
      const result = await response.json()
      payload.records.map(async (record: FlatfileRecord) => {
        record.set('score', result.info.score)
      })
    },
  }
)

const PeoplePortal = new Portal({ name: 'PeoplePortal', sheet: 'People'})
const OrganizationsPortal = new Portal({ name: 'OrganizationsPortal', sheet: 'Organizations'})

export default new Workbook({
  name: 'Customers',
  namespace: 'customers',
  sheets: {
    People,
    Organizations
  },
  portals: [
    PeoplePortal,
    OrganizationsPortal
  ],
})
