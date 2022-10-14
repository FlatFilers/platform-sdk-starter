import {
  DateField,
  Message,
  NumberField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'

const Employees = new Sheet(
  'Employees',
  {
    fullName: TextField({
      unique: true,
    }),
    startDate: DateField(),
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
  },
  portals: [EmployeesPortal],
})
