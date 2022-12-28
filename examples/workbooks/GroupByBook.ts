import {
  Group,
  SumField,
} from '../../src/expression-lang/EXPR'
import {
  NumberField,
  Sheet,
  TextField,
  GroupByField,
  Workbook,
  Portal,
  Sheet,
} from '@flatfile/configure'


const JobAgeSheet =   new Sheet(
  'JobAgeSheet',
    {
      job: TextField(), 
      age: NumberField(),
      age_sum: GroupByField(
        ['job'],
	SumField(Group(), 'age')
      ),
  }
)


const JobAgePortal = new Portal({
  name: 'JobAgePortal',
  sheet: 'JobAgeSheet'
})

export default new Workbook({
  name: 'GroupByWorkbook',
  namespace: 'basic',
  sheets: {
    JobAgeSheet
  },
  portals: [JobAgePortal],
})
