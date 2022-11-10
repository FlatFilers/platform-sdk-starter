import { makeInterpreter, NestedIns } from '@flatfile/expression-lang'
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



export const Error = (message: string) => ['error', message]
export const Group = () => ['variable', 'group']
export const Val = () => ['variable', 'val']
export const MatchResult = () => ['variable', 'matchResult']

export const Match = (matchSpec: any, recordGrouping: any) => [
  'match',
  matchSpec,
  recordGrouping,
]
export const ImplicitGreaterThan = (comparand: any) => ['>', Val(), comparand]
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
export const Debug = (expr: NestedIns) => ['debug', expr]

const simpleInterpret = makeInterpreter({})
export const ValidateWhen = (predicate: any, expr: any) => {
  return (val: any) => {
    return simpleInterpret(['when', predicate, expr], { val: val })
  }
}
export const ValidateUnless = (predicate: any, expr: any) => {
  return (val: any) => {
    return simpleInterpret(['when', ['not', predicate], expr], { val: val })
  }
}



