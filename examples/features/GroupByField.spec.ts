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

describe('SampleGroupByField ->', () => {
  const TestSchema = new WorkbookTester(
    {
      category: TextField({}),
      count_of_instances: GroupByField(
        ['category'],
        ['count', ['variable', 'group']]
      ),
      //    Count(Group())
    },
    {}
  )
  test('GroupByField works properly with count', async () => {
    await TestSchema.checkRowResult({
      rawData: { category: 'apple_', count_of_instances: '_' },
      expectedOutput: { category: 'apple_', count_of_instances: 1 },
    })
  })
  test('GroupByField works properly with count - multiple rows', async () => {
    await TestSchema.checkRows(
      [
        { category: 'apple_', count_of_instances: '_' },
        { category: 'orange', count_of_instances: '_' },
        { category: 'apple_', count_of_instances: '_' },
      ],
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

describe('SampleGroupBy sum ->', () => {
  const TestSchema = new WorkbookTester(
    {
      job: TextField(), 
      age: NumberField(),
      age_sum: GroupByField(
        ['job'],
        ['sumField', ['variable', 'group'], 'age']
      ),
    },
    {}
  )
  test('GroupByField works properly with sum - multiple rows', async () => {
    await TestSchema.checkRows(grps, 
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


describe('SampleGroupBy groupConstraint ->', () => {
  const TestSchema = new WorkbookTester(
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
    },
    {}
  )
  test('GroupByField works properly with sum - multiple rows', async () => {
    //await TestSchema.checkRows(grps,
    const res = await TestSchema.runRowResult(grps)
    expect(res[0].info[0]).toMatchObject({
        field: 'name',
        message: 'No Kids',
    })
    expect(res[2].info).toStrictEqual([])
  })
})

describe('SampleGroupBy groupConstraint and Comp ->', () => {
  const TestSchema = new WorkbookTester(
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
    },
    {}
  )
  test('GroupByField works properly with groupconstraint and sum - multiple rows', async () => {
    //await TestSchema.checkRows(grps,
    const res = await TestSchema.runRowResult(grps)
    // console.log(res[0].info)
    // console.log(res[2].info)
    expect(res[0].info[0]).toMatchObject({
        field: 'name',
        message: 'No Kids',
    })
    expect(res[2].info).toStrictEqual([])
 
    await TestSchema.checkRows(grps, 
      [{ name: 'Paddy', age: 40, job: 'eng', weight: 190, eyeColor: 'green', age_sum: 40 },
       { name: 'Cliff', age: 86, job: 'ret', weight: 160, eyeColor: 'gray_', age_sum: 163 }, 
       { name: 'Odin_', age: 3., job: 'kid', weight: 30., eyeColor: 'blue_', age_sum: 11 }, 
       { name: 'Kay__', age: 77, job: 'ret', weight: 160, eyeColor: 'green', age_sum: 163 },
       { name: 'Sarah', age: 8., job: 'kid', weight: 60., eyeColor: 'green', age_sum: 11 }]
    )
 })
})

