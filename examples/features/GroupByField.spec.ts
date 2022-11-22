//import { Sheet, Workbook } from '@flatfile/configure'
import { TextField, NumberField, GroupByField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester, matchMessages, matchSingleMessage } from '../../src/utils/testing/SheetTester'
//import { WorkbookTester } from '../../ddl/WorkbookTester'

const CountSheet = new Sheet(
  'CountSheet',
  {
    category: TextField({}),
    count_of_instances: GroupByField(
      ['category'],
      ['count', ['variable', 'group']]
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
  { name: 'Paddy', age: 40, job: 'eng', weight: 190, eyeColor: 'green', age_sum: '0' },
  { name: 'Cliff', age: 86, job: 'ret', weight: 160, eyeColor: 'gray_', age_sum: '0' }, 
  { name: 'Odin_', age: 3., job: 'kid', weight: 30., eyeColor: 'blue_', age_sum: '0' }, 
  { name: 'Kay__', age: 77, job: 'ret', weight: 160, eyeColor: 'green', age_sum: '0' },
  { name: 'Sarah', age: 8., job: 'kid', weight: 60., eyeColor: 'green', age_sum: '0' }]


const JobAgeSheet = new Sheet(
  'JobAgeSheet',
    {
      job: TextField(), 
      age: NumberField(),
      age_sum: GroupByField(
        ['job'],
        ['sumField', ['variable', 'group'], 'age']
      ),
  }
)
const JABook = new Workbook({name: 't', namespace: 't', sheets: {JobAgeSheet}})

describe('SampleGroupBy sum ->', () => {
  const testSheet = new SheetTester(JABook, 'JobAgeSheet')
  test('GroupByField works properly with sum - multiple rows', async () => {
    const res = await testSheet.testRecords(grps)
    expect(res).toStrictEqual(
      [{ name: 'Paddy', age: 40, job: 'eng', weight: 190, eyeColor: 'green', age_sum: 40 },
       { name: 'Cliff', age: 86, job: 'ret', weight: 160, eyeColor: 'gray_', age_sum: 163 }, 
       { name: 'Odin_', age: 3., job: 'kid', weight: 30., eyeColor: 'blue_', age_sum: 11 }, 
       { name: 'Kay__', age: 77, job: 'ret', weight: 160, eyeColor: 'green', age_sum: 163 },
       { name: 'Sarah', age: 8., job: 'kid', weight: 60., eyeColor: 'green', age_sum: 11 }]
    )
  })
})


const PeopleSheet = new Sheet('People', 
    {
      job: TextField(), 
      age: NumberField(),
      age_sum: GroupByField(
        ['job'],
	['groupConstraintRow',
	 ['quote', ['variable', 'group']],
	 ['quote', ['when', ['not', ['>', ['count', ['match', {job:'kid'}, ['variable', 'group']]], 0 ]],
		    ['error', 'No Kids']]],
	 'name',
	 ['variable', 'group']]),
})
const PeopleBook = new Workbook({name: 't', namespace: 't', sheets: {PeopleSheet}})

describe('SampleGroupBy groupConstraint ->', () => {
  const testSheet = new SheetTester(PeopleBook, 'PeopleSheet')
  test('GroupByField works properly with sum - multiple rows', async () => {
    const res = await testSheet.testMessages(grps)
    expect(res[0][0]).toMatchObject({
        field: 'name',
        message: 'No Kids',
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
      ['do',
       ['groupConstraintRow',
	['quote', ['variable', 'group']],
	['quote', ['when', ['not', ['>', ['count', ['match', {job:'kid'}, ['variable', 'group']]], 0 ]],
		    ['error', 'No Kids']]],
	'name',
	['variable', 'group']],
       ['sumField', ['variable', 'group'], 'age']]	 
    ),
  }
)

const BothBook = new Workbook({name: 't', namespace: 't', sheets: {BothSheet}})

describe('SampleGroupBy groupConstraint and Comp ->', () => {
  const testSheet = new SheetTester(BothBook, 'BothSheet')
  test('GroupByField works properly with groupconstraint and sum - messages', async () => {
    //await TestSchema.checkRows(grps,
    const res = await testSheet.testMessages(grps)
    // console.log(res[0].info)
    // console.log(res[2].info)
    expect(res[0][0]).toMatchObject({
        field: 'name',
        message: 'No Kids',
    })
    expect(res[2]).toStrictEqual([])
  })
    test('GroupByField works properly with groupconstraint and sum - rows', async () => {
    const res = await testSheet.testRecords(grps)
    expect(res).toStrictEqual(
      [{ name: 'Paddy', age: 40, job: 'eng', weight: 190, eyeColor: 'green', age_sum: 40 },
       { name: 'Cliff', age: 86, job: 'ret', weight: 160, eyeColor: 'gray_', age_sum: 163 }, 
       { name: 'Odin_', age: 3., job: 'kid', weight: 30., eyeColor: 'blue_', age_sum: 11 }, 
       { name: 'Kay__', age: 77, job: 'ret', weight: 160, eyeColor: 'green', age_sum: 163 },
       { name: 'Sarah', age: 8., job: 'kid', weight: 60., eyeColor: 'green', age_sum: 11 }]
    )
 })
})
