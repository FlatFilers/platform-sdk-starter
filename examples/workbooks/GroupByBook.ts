import {
  Group,
  SumField,
  GroupConstraintItem,
  Unless,
  GreaterThan,
  Count,
  Match,
  Error,
  Do
} from '../../src/expression-lang/EXPR'
import {
  NumberField,
  Sheet,
  TextField,
  GroupByField,
  Workbook,
  Portal,
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



const PeopleSheet = new Sheet('People', 
    {
      name: TextField(), 
      job: TextField(), 
  //foo: TextField({stageVisibility: {review:false}}),
  foo: TextField({stageVisibility: {review:true}}),
      eye_color: TextField(), 
      age_sum: GroupByField(
        ['job'],
	Do(
	  GroupConstraintItem(
	    Group(),
	    Unless(
	      GreaterThan(
		Count(Match(Group(), {eye_color: 'blue_'})),
		0),
	      Error('No Blue eyes')),
	    'name',
	    Group()),
	   "33333"))
})

const PeoplePortal = new Portal({
  name: 'PeoplePortal',
  sheet: 'PeopleSheet'
})


export default new Workbook({
  name: 'GroupByWorkbook',
  namespace: 'basic',
  sheets: {
    JobAgeSheet,
    PeopleSheet
  },
  portals: [JobAgePortal, PeoplePortal],
})

