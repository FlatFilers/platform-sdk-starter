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
  LinkedField
} from '@flatfile/configure'

import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import fetch from 'node-fetch'

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
    previewFieldKey: 'firstName',
  }
)

const Employees = new Sheet(
  'Employees',
  {
    firstName: LinkedField({
      label: 'First Name',
      required: true,
      description: 'Given name',
      sheet: BaseSheet,
    }),
    lastName: TextField({
      compute: (v: any) => {
        return `Rock`
      },
    }),
    fullName: TextField(),

    stillEmployed: BooleanField(),
    department: OptionField({
      label: 'Department',
      options: {
        engineering: { label: 'Engineering' },
        hr: 'People Ops',
        sales: 'Revenue',
      },
    }),
    fromHttp: TextField({ label: 'Set by batchRecordCompute' }),
    salary: NumberField({
      label: 'Salary',
      description: 'Annual Salary in USD',
      required: true,
      validate: (salary: number) => {
        const minSalary = 30_000
        if (salary < minSalary) {
          return [
            new Message(
              `${salary} is less than minimum wage ${minSalary}`,
              'warn',
              'validate'
            ),
          ]
        }
      },
    }),
    startDate: DateField()
  },
  {
    allowCustomFields: true,
    readOnly: true,
    recordCompute: (record) => {
      const fullName = `{record.get('firstName')} {record.get('lastName')}`
      record.set('fullName', fullName)
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

const EmployeesPortal = new Portal({
  name: 'EmployeesPortal',
  sheet: 'Employees'
})

export default new Workbook({
  name: 'Employees',
  namespace: 'employee',
  sheets: {
    Employees,
    BaseSheet
  },
  portals: [EmployeesPortal],
})
