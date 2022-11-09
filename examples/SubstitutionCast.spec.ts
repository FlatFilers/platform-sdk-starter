import { SubstitutionCast } from '@flatfile/configure'


describe('Cast Function tests ->', () => {
  const makeCastAssert = (castFn: any) => {
    const assertFn = (raw: any, output: any): void => {
      expect(castFn(raw)).toBe(output)
    }
    return assertFn
  }
  const makeCastAssertException = (castFn: any) => {
    const assertFn = (raw: any, error: string): void => {
      expect(() => {
        castFn(raw)
      }).toThrow(error)
    }
    return assertFn
  }

  test('SubstitutionCast works ', () => {
    const numberSet = [
      ['1', 'one', 'un'],
      ['2', 'two', 'dos'],
    ]

    const SpanishNum = SubstitutionCast(
      numberSet,
      2,
      (val) => `Couldn't convert '${val}' to a spanish number`
    )

    const assertNC = makeCastAssert(SpanishNum)
    const assertThrow = makeCastAssertException(SpanishNum)

    assertNC('1', 'un')
    assertNC('two', 'dos')
    assertThrow(
      'not a number',
      "Couldn't convert 'not a number' to a spanish number"
    )
  })
})
