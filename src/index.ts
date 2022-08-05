import {
  BooleanField,
  OptionField,
  TextField,
  Sheet,
  Workbook,
  NumberField,
} from '@flatfile/configure'

import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import fetch from 'node-fetch'

const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({
      required: true,
      description: 'Given name',
    }),
    lastName: TextField({}),
    fullName: TextField({}),

    stillEmployed: BooleanField(),
    department: OptionField({
      label: 'Department',
      options: {
        engineering: 'Engineering',
        hr: 'People Ops',
        sales: 'Revenue',
      },
    }),
    fromHttp: TextField({ label: 'Set by batchRecordCompute' }),
    salary: NumberField({
      label: 'Salary',
      description: 'Annual Salary in USD',
      required: true,
    }),
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record) => {
      const fullName = `{record.get('firstName')} {record.get('lastName')}`
      record.set('fullhName', fullName)
      return record
    },
    batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
      const response = await fetch('https://api.us.flatfile.io/health', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
      const result = await response.json()
      payload.records.map(async (record: FlatfileRecord) => {
        record.set('fromHttp', result.info.postgres.status)
      })
    },
  }
)

export default new Workbook({
  name: 'Employees',
  namespace: 'employee',
  sheets: {
    Employees,
  },
})
