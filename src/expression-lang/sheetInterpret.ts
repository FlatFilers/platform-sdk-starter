import { makeInterpreter, NestedIns } from '@flatfile/expression-lang'
import { TRecordStageLevel, Message } from '@flatfile/configure'
import { FlatfileRecord } from '@flatfile/hooks'
import * as _ from 'lodash'

//I would love message to be able to accept some type of format string
const error = (message: string, stage: TRecordStageLevel = 'validate') => {
  // I don't like returning a list here, not sure where to deal with scalar/list
  return [new Message(message, 'error', stage)]
}

const match = (matchSpec: object, records: FlatfileRecord[]) => {
  return _.filter(records, (rec: FlatfileRecord) =>
    _.isMatch(rec.originalValue, matchSpec)
  )
}

const groupConstraintRow = (
  rowFilterExpr: NestedIns,
  actionExpr: NestedIns,
  origField: string,
  group: any
) => {
  // how to pass along variables from where this is evaluated???
  const appliccableRows = sheetInterpret(rowFilterExpr, {
    group,
  }) as FlatfileRecord[]
  //some typeguard here
  if (Array.isArray(appliccableRows) && appliccableRows.length > 0) {
    const messagesToApply = sheetInterpret(actionExpr, {
      group,
      matchResult: appliccableRows,
    }) as Message[]
    if (Array.isArray(messagesToApply)) {
      appliccableRows.map((record: FlatfileRecord) => {
        messagesToApply.map((m) => {
          record.pushInfoMessage(origField, m.message, m.level, m.stage)
        })
      })
    }
  }
  return appliccableRows
}

export const debug = (expr: NestedIns) => {
  console.log('debug', expr)
  return expr
}

export const sheetInterpret = makeInterpreter({
  error,
  match,
  groupConstraintRow,
  debug,
})

