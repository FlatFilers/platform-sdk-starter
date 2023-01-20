import { makeInterpreter, NestedIns } from '@flatfile/expression-lang'
import { error, warn, info, debug } from './sheetInterpret'
import { Message } from '@flatfile/configure'

export const Add = (...args: any) => ['+', ...args]
export const Subtract = (...args: any) => ['-', ...args]
export const Mult = (...args: any) => ['*', ...args]
export const Div = (...args: any) => ['/', ...args]
export const Mod = (a: any, b: any) => ['mod', a, b]

//Comparisons
export const GreaterThan = (a: any, b: any) => ['>', a, b]
export const GT = GreaterThan

export const LessThan = (a: any, b: any) => ['<', a, b]
export const LT = LessThan

export const GreaterThanEqual = (a: any, b: any) => ['>=', a, b]
export const GTE = GreaterThanEqual

export const LessThanEqual = (a: any, b: any) => ['<', a, b]
export const LTE = LessThanEqual

export const Equal = (a: any, b: any) => ['equal', a, b]

export const Between = (a: any, test: any, b: any) => [
  'and',
  ['<', a, test],
  ['<', test, b],
]

//Math
export const Abs = (a: any) => ['abs', a]
export const Min = (...args: any) => ['min', ...args]
export const Max = (...args: any) => ['max', ...args]
export const Round = (...args: any) => ['round', ...args]

//logic
export const Not = (a: any) => ['not', a]
export const And = (...args: any) => ['and', ...args]
export const Or = (...args: any) => ['or', ...args] // returns the first true element


export const Count = (expr: NestedIns) => ['count', expr]
export const NotEqual = (a: any, b: any) => ['neq', a, b]
export const When = (predicate: any, expr: any) => ['when', predicate, expr]
export const Unless = (predicate: any, expr: any) => [
  'when',
  ['not', predicate],
  expr,
]

export const NonUnique = (group:NestedIns, column:string) => ['nonUnique', group, column]

export const Error = (message: string) => ['error', message]
export const Group = () => ['variable', 'group']
export const Val = () => ['variable', 'val']
export const MatchResult = () => ['variable', 'matchResult']

export const Match = (recordGrouping: any, matchSpec: any) => [
  'match',
  recordGrouping,
  matchSpec
]
export const ImplicitGreaterThan = (comparand: any) => ['>', Val(), comparand]
export const ImplicitLessThan = (comparand: any) => ['>', Val(), comparand]

export const GroupConstraintItem = (
  rowFilterExpr: NestedIns,
  actionExpr: NestedIns,
  origField: string,
  group: NestedIns = ['variable', 'group']
) => {
  return [
    'groupConstraintRow',
    ['quote', rowFilterExpr],
    ['quote', actionExpr],
    origField,
    group,
  ]
}

export const SumField = (grp:any, field:string) => ['sumField', grp, field]
export const Do = (...exprs:any[]) => ['do', ...exprs]


export const Debug = (expr: NestedIns) => ['debug', expr]

export const RecordPick = (recordGroup:any, fieldName:any, defaultVal:any = undefined ) =>
  ['recordPick', recordGroup, fieldName, defaultVal]
export const Pick = (objs:any, fieldName:any) => ['pick', objs, fieldName]
export const JSONLoad = (str:any) => ['JSONLoad', str]
export const JSONStringify = (obj:any) => ['JSONStringify', obj]
export const SortedBy = (objs:any, field:any=undefined, direction:string='asc') => ['sortedBy', objs, field, direction]
export const First = (objs:any) => ['first', objs]
export const Get = (rec:any, field:any, defaultVal:any=undefined) => ['get', rec, field, defaultVal]
export const Without = (minuend:any, subtrahend:any) => ['without', minuend, subtrahend]
export const StrConcat = (a:any, b:any) => ['strConcat', a, b]
export const ArrayEquals = (a:any, b:any) => ['arrayEquals', a, b]


const simpleInterpret = makeInterpreter({error, warn, info, debug})

export const ErrorWhen = (predicate: any, errString: string) => {
  return (val: any) => {
    return simpleInterpret(['when', predicate, ['error', errString]], { val: val }) as Message[]
  }
}

export const ErrorUnless = (predicate: any, errString: string) => {
  return (val: any) => {
    return simpleInterpret(['when', ['not', predicate], ['error', errString]], { val: val }) as Message[]
  }
}


export const WarnWhen = (predicate: any, errString: string) => {
  return (val: any) => {
    return simpleInterpret(['when', predicate, ['warn', errString]], { val: val }) as Message[]
  }
}

export const WarnUnless = (predicate: any, errString: string) => {
  return (val: any) => {
    return simpleInterpret(['unless', ['not', predicate], ['warn', errString]], { val: val }) as Message[]
  }
}

export const InfoWhen = (predicate: any, errString: string) => {
  return (val: any) => {
    return simpleInterpret(['when', predicate, ['info', errString]], { val: val }) as Message[]
  }
}

export const InfoUnless = (predicate: any, errString: string) => {
  return (val: any) => {
    return simpleInterpret(['when', ['not',  predicate], ['info', errString]], { val: val }) as Message[]
  }
}

