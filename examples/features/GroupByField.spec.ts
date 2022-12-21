import { TextField, NumberField, GroupByField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester, matchMessages, matchSingleMessage } from '../../src/utils/testing/SheetTester'
import {
  Group,
  SumField,
  Count,
  Match,
  Error,
  GreaterThan,
  Unless,
  GroupConstraintItem,
  Do,
  NonUnique
} from '../../src/expression-lang/EXPR'

const tgrps = [
  { name: 'Odin_', age: 3., job: 'kid', weight: 30., eye_color: 'blue_', fav_group: 'Raffi', age_sum: '0' }, 
  { name: 'Sarah', age: 8., job: 'kid', weight: 60., eye_color: 'green', fav_group: 'Wiggles', age_sum: '0' },
  { name: 'Paddy', age: 40, job: 'eng', weight: 190, eye_color: 'green', fav_group: 'Wiggles', age_sum: '0' },
  { name: 'Kay__', age: 77, job: 'ret', weight: 160, eye_color: 'green', fav_group: 'Beach Boys', age_sum: '0' },
  { name: 'Cliff', age: 86, job: 'ret', weight: 160, eye_color: 'gray_', fav_group: 'The Stones', age_sum: '0' }, 
  { name: 'Franz', age: 72, job: 'ret', weight: 170, eye_color: 'blue_', fav_group: 'Beach Boys', age_sum: '0' }, 
]


const UniquePeopleSheet = new Sheet('People', 
    {
      job: TextField(), 
      age: NumberField(),
      age_sum: GroupByField(
        ['job'],
	GroupConstraintItem(
	  NonUnique(Group(), 'fav_group'),
	  Error('fav_group must be unique'),
	  'fav_group', Group()))
})
const UniquePeopleBook = new Workbook({name: 't', namespace: 't', sheets: {UniquePeopleSheet}})

describe('SampleGroupBy groupConstraint 2 ->', () => {

      
  const testSheet = new SheetTester(UniquePeopleBook, 'UniquePeopleSheet')
  test('GroupByField works properly with sum - multiple rows', async () => {
    const res = await testSheet.testMessages(tgrps)
    console.log(res)
    expect(res[3][0]).toMatchObject({
        field: 'fav_group',
        message: 'fav_group must be unique',
    })
    expect(res[4]).toStrictEqual([])
  })
})


const CountSheet = new Sheet(
  'CountSheet',
  {
    category: TextField({}),
    count_of_instances: GroupByField(
      ['category'],
      Count(Group())
    )})
const CountBook = new Workbook({name: 't', namespace: 't', sheets: {CountSheet}})

describe('SampleGroupByField ->', () => {
  const testSheet = new SheetTester(CountBook, 'CountSheet')
  test('GroupByField works properly with count', async () => {
    const res = await testSheet.testRecord({category: 'apple_', count_of_instances: '_' })
    expect(res).toStrictEqual({ category: 'apple_', count_of_instances: 1 })
    })

  test('GroupByField works properly with count - multiple rows', async () => {
    const res = await testSheet.testRecords(
      [
        { category: 'apple_', count_of_instances: '_' },
        { category: 'orange', count_of_instances: '_' },
        { category: 'apple_', count_of_instances: '_' },
      ])

    expect(res).toStrictEqual(
      [
        { category: 'apple_', count_of_instances: 2 },
        { category: 'orange', count_of_instances: 1 },
        { category: 'apple_', count_of_instances: 2 },
      ]
    )
  })
})



const grps = [
  { name: 'Paddy', age: 40, job: 'eng', weight: 190, eye_color: 'green', age_sum: '0' },
  { name: 'Cliff', age: 86, job: 'ret', weight: 160, eye_color: 'gray_', age_sum: '0' }, 
  { name: 'Odin_', age: 3., job: 'kid', weight: 30., eye_color: 'blue_', age_sum: '0' }, 
  { name: 'Kay__', age: 77, job: 'ret', weight: 160, eye_color: 'green', age_sum: '0' },
  { name: 'Sarah', age: 8., job: 'kid', weight: 60., eye_color: 'green', age_sum: '0' }]


const JobAgeSheet = new Sheet(
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

const SumResults = [
  { name: 'Paddy', age: 40, job: 'eng', weight: 190, eye_color: 'green', age_sum: 40 },
  { name: 'Cliff', age: 86, job: 'ret', weight: 160, eye_color: 'gray_', age_sum: 163 }, 
  { name: 'Odin_', age: 3., job: 'kid', weight: 30., eye_color: 'blue_', age_sum: 11 }, 
  { name: 'Kay__', age: 77, job: 'ret', weight: 160, eye_color: 'green', age_sum: 163 },
  { name: 'Sarah', age: 8., job: 'kid', weight: 60., eye_color: 'green', age_sum: 11 }]


const JABook = new Workbook({name: 't', namespace: 't', sheets: {JobAgeSheet}})

describe('SampleGroupBy sum ->', () => {
  const testSheet = new SheetTester(JABook, 'JobAgeSheet')
  test('GroupByField works properly with sum - multiple rows', async () => {
    const res = await testSheet.testRecords(grps)
    expect(res).toStrictEqual(SumResults)
  })
})



const PeopleSheet = new Sheet('People', 
    {
      job: TextField(), 
      age: NumberField(),
      age_sum: GroupByField(
        ['job'],
	GroupConstraintItem(
	  Group(),
	  Unless(
	    GreaterThan(
	      Count(Match(Group(), {eye_color: 'blue_'})),
	      0),
	    Error('No Blue eyes')),
	  'name',
	  Group()))
	
})
const PeopleBook = new Workbook({name: 't', namespace: 't', sheets: {PeopleSheet}})

describe('SampleGroupBy groupConstraint ->', () => {

      
  const testSheet = new SheetTester(PeopleBook, 'PeopleSheet')
  test('GroupByField works properly with sum - multiple rows', async () => {
    const res = await testSheet.testMessages(grps)
    expect(res[0][0]).toMatchObject({
        field: 'name',
        message: 'No Blue eyes',
    })
    expect(res[2]).toStrictEqual([])
  })
})

const BothSheet =  new Sheet(
  'BothSheet',
  {
    job: TextField(), 
    age: NumberField(),
    age_sum: GroupByField(
      ['job'],
      // NOTE THE USE OF DO HERE...
      // Do allows multiple expressions to be executed and the result
      // of the last one is returned... in this case "SumField"
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
	SumField(Group(), 'age'))
    ),
  }
)

const BothBook = new Workbook({name: 't', namespace: 't', sheets: {BothSheet}})

describe('SampleGroupBy groupConstraint and Comp ->', () => {
  const testSheet = new SheetTester(BothBook, 'BothSheet')
  test('GroupByField works properly with groupconstraint and sum - messages', async () => {
    const res = await testSheet.testMessages(grps)
    expect(res[0][0]).toMatchObject({
        field: 'name',
        message: 'No Blue eyes',
    })
    expect(res[2]).toStrictEqual([])
  })
    test('GroupByField works properly with groupconstraint and sum - rows', async () => {
    const res = await testSheet.testRecords(grps)
      expect(res).toStrictEqual(SumResults)
 })
})
