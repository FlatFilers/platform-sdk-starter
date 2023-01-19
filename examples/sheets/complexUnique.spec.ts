import { TextField, NumberField, GroupByField, Sheet, Workbook } from '@flatfile/configure'
import { SheetTester, matchMessages, matchSingleMessage } from '../../src/utils/testing/SheetTester'
import {
  Group,
  And,
  Count,
  Match,
  Error,
  GreaterThan,
  When,
  GroupConstraintItem,

} from '../../src/expression-lang/EXPR'

//any name that occurs with a job of 'kid', must be unique across the entire sheet
const tgrps = [
  { name: 'Odin_', job: 'kid', f:''}, //0
  { name: 'Odin_', job: 'ret', f:''}, //1
  { name: 'Sarah', job: 'kid', f:''}, //2
  { name: 'Paddy', job: 'eng', f:''},
  { name: 'Paddy', job: 'ret', f:''}, //4
  { name: 'Franz', job: 'ret', f:''}, 
  { name: 'Franz', job: 'ret', f:''}, //6
  { name: 'Kay__', job: 'ret', f:''}, 
  { name: 'Cliff', job: 'ret', f:''}, //8
]

const UniquePeopleSheet = new Sheet('People', 
    {
  job: TextField(), 
  name: TextField(),
  f: GroupByField(
    ['name'],
    GroupConstraintItem(
      Group(),
      When(
	And(
	  GreaterThan(Count(Match(Group(), {job:'kid'})), 0),
	  GreaterThan(Count(Group()), 1)),
	   Error("name appears in row with 'kid', and other rows too")),
      'name'))
})

const UniquePeopleBook = new Workbook({name: 't', namespace: 't', sheets: {UniquePeopleSheet}})

describe('SampleGroupBy groupConstraint 2 ->', () => {

      
  const testSheet = new SheetTester(UniquePeopleBook, 'UniquePeopleSheet')
  test('GroupByField works properly with sum - multiple rows', async () => {
    const res = await testSheet.testMessages(tgrps)
    expect(res[0][0]).toMatchObject({
        field: 'name',
        message: "name appears in row with 'kid', and other rows too",
    })
    expect(res[1][0]).toMatchObject({
        field: 'name',
        message: "name appears in row with 'kid', and other rows too",
    })

    expect(res[3]).toStrictEqual([])
    expect(res[4]).toStrictEqual([])
    expect(res[5]).toStrictEqual([])
    expect(res[6]).toStrictEqual([])
  })
})

