import fetch from 'node-fetch'

import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import {
  Sheet,
  Workbook,
  TextField,
  BooleanField,
  NumberField,
  OptionField,
} from '@flatfile/configure'

const Employees = new Sheet(
  'Employees',
  {
    firstName: TextField({
      required: true,
      description: 'Given name',
    }),
    lastName: TextField(),
    fullName: TextField(),

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
        await record.set('fromHttp', result.info.postgres.status)
      })
    },
  }
)

export default new Workbook({
  name: 'Migration stage1',
  namespace: 'MyCompany',
  sheets: {
    Employees,
  },
})
