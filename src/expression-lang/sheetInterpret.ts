import { makeInterpreter, NestedIns } from '@flatfile/expression-lang'
import { Message } from '@flatfile/configure'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { Sheet } from '@flatfile/configure'
import * as _ from 'lodash'

export type TRecordStageLevel =
  | 'compute'
  | 'validate'
  | 'apply'
  | 'other'


//I would love message to be able to accept some type of format string
export const error = (message: string, stage: TRecordStageLevel = 'validate') => {
  // I don't like returning a list here, not sure where to deal with scalar/list
  return [new Message(message, 'error', stage)]
}
export const warn = (message: string, stage: TRecordStageLevel = 'validate') => {
  return [new Message(message, 'warn', stage)]
}
export const info = (message: string, stage: TRecordStageLevel = 'validate') => {
  return [new Message(message, 'info', stage)]
}


const match = (matchSpec: object, records: FlatfileRecord[]) => {
  return _.filter(records, (rec: FlatfileRecord) =>
    _.isMatch(rec.originalValue, matchSpec)
  )
}

const nonUnique = (column:string, records: FlatfileRecord[]) => {
  const groups = _.groupBy(records, (rec) =>
    rec.get(column))
  //_.forEach(groups, (group: FlatfileRecord[], gbKey) => {
  const groupSets = _.map(groups, (group: FlatfileRecord[]) => group)
  const nonUniqueSets = _.filter(groupSets,
	   (groupedBy:FlatfileRecord[]) => {
	     if (groupedBy.length > 1) {
	       return true}
	     return false})
  return _.flatten(nonUniqueSets)
}




const groupByCompute = (
  gbArgs: any,
  sheet: Sheet<any>,
  records: FlatfileRecords<any>
) => {
  const { groupBy, expression, destination } = gbArgs
  const recs = records.records
  const groups: Record<string, FlatfileRecord[]> = _.groupBy(recs, (rec) =>
    rec.get(groupBy)
  )

  _.forEach(groups, (group: FlatfileRecord[], gbKey) => {
    const res = simpleInterpret(expression, { sheet, group })
    for (const rec of group) {
      //@ts-ignore
      rec.set(destination, res)
    }
  })
  return records
}


const sumField = (records: FlatfileRecord<any>[], field: string) =>  {
    //@ts-ignore
    const allVals = records.map((rec) => rec.get(field))
    const presentVals =   _.remove(allVals)
    //@ts-ignore
    const numberVals = presentVals.map((val:string|number) => parseFloat(val))
    const sum_ = numberVals.reduce((a,b) => a+b)
    return sum_
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
	  //@ts-ignore
          record.pushInfoMessage(origField, m.message, m.level, 'validate')
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

const do_ = (...exprs: any) => exprs[exprs.length -1]

//@ts-ignore
const simpleInterpret = makeInterpreter({sumField, groupConstraintRow, nonUnique, error, match, 'do': do_})

export const sheetInterpret = makeInterpreter({
  error,
  match,
  groupByCompute,
  groupConstraintRow,
  nonUnique,
  debug,
})

