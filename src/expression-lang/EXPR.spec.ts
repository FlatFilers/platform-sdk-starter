import { FlatfileRecord } from '@flatfile/hooks'
import { sheetInterpret } from './sheetInterpret'
import {
  When,
  Error,
  Val,
  Group,
  Match,
  ImplicitGreaterThan,
  GroupConstraintItem,
  Count,
  MatchResult,
  GreaterThan,
  Unless,
  Debug,
  ValidateWhen
} from './EXPR'

describe('VExpression Tests ->', () => {
  test('Simple test', () => {
    const valFunc = ValidateWhen(GreaterThan(Val(), 5), Error('val greater than 5'))
    expect(valFunc(3)).toStrictEqual([])
    expect(valFunc(7)).toMatchObject([
      { level: 'error', message: 'val greater than 5' },
    ])
  })

  test('Implicit Greater Than test', () => {
    const valFunc = ValidateWhen(ImplicitGreaterThan(5), Error('val greater than 5'))
    expect(valFunc(3)).toStrictEqual([])
    expect(valFunc(7)).toMatchObject([
      { level: 'error', message: 'val greater than 5' },
    ])
  })
})

// [WholeGroup(), Unless(GreaterThan(Count(Match({'RowType':'Header'}, Group())), 0), ErrorC("Group must contain a Header row"))],
// [WholeGroup(), Unless(GreaterThan(Count(Match({'RowType':'Item'}, Group())), 0), ErrorC("Group must contain a Item row"))],
// [Match({'RowType':'Header'}, Group()), When(GreaterThan(Count(MatchResult()), 1), ErrorC("Group must contain only a single Header row"))],

describe('GroupConstraint Tests ->', () => {
  const getRecs = () => [
    new FlatfileRecord({
      rawData: {
        name: 'Paddy',
        age: 40,
        job: 'eng',
        weight: 190,
        eyeColor: 'green',
      },
      rowId: 1,
    }),
    new FlatfileRecord({
      rawData: {
        name: 'Cliff',
        age: 86,
        job: 'ret',
        weight: 160,
        eyeColor: 'gray_',
      },
      rowId: 2,
    }),
    new FlatfileRecord({
      rawData: {
        name: 'Odin_',
        age: 3,
        job: 'kid',
        weight: 30,
        eyeColor: 'blue_',
      },
      rowId: 3,
    }),
    new FlatfileRecord({
      rawData: {
        name: 'Kay__',
        age: 77,
        job: 'ret',
        weight: 160,
        eyeColor: 'green',
      },
      rowId: 4,
    }),
    new FlatfileRecord({
      rawData: {
        name: 'Sarah',
        age: 8,
        job: 'kid',
        weight: 60,
        eyeColor: 'green',
      },
      rowId: 5,
    }),
  ]

  test('Match', () => {
    const recs = getRecs()
    const matchResult = sheetInterpret(
      Match({ name: 'Paddy' }, recs)
    ) as any[]
    expect(matchResult.length).toBe(1)
    expect(matchResult[0].value).toMatchObject({ age: 40, name: 'Paddy' })

    const matchResult2 = sheetInterpret(
      Match({ name: 'no name' }, recs)
    ) as any[]
    expect(matchResult2).toStrictEqual([])
  })


  test('GroupConstraint', () => {
    const recs = getRecs()
    const greenEyes = sheetInterpret(Match({ eyeColor: 'green' }, recs), {})
    const retireds = sheetInterpret(Match({ job: 'ret' }, recs), {})

    const gcResult = sheetInterpret(
      GroupConstraintItem(
        Group(),
        Unless(
          GreaterThan(Count(Match({ job: 'kid' }, MatchResult())), 0),
          Error('No Kids')
        ),
        'name',
        greenEyes
      ),
      { group: greenEyes }
    ) as FlatfileRecord[]
    expect(gcResult[0].toJSON()['info']).toStrictEqual([])

    const gcResult2 = sheetInterpret(
      GroupConstraintItem(
        Group(),
        Unless(
          GreaterThan(Count(Match({ job: 'kid' }, MatchResult())), 0),
          Error('No Kids')
        ),
        'name',
        retireds
      ),
      {}
    ) as FlatfileRecord[]
    expect(gcResult2[0].toJSON()['info'][0]).toMatchObject({
      field: 'name',
      message: 'No Kids',
    })
  })
})
