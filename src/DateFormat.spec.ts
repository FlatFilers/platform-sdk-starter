import { ChronoDateCast, zFormat } from './DateField'

const Feb17DstringSimple = '02/17/2009'
const Feb17DstringComplete = '2009-02-17T00:00:00.000Z'
const Feb17D = new Date(Feb17DstringComplete)


describe('Cast Function tests ->', () => {
  test('basic date equivalence', () => {
    expect(ChronoDateCast(Feb17DstringSimple)).toStrictEqual(Feb17D)
    expect(ChronoDateCast(Feb17DstringComplete)).toStrictEqual(Feb17D)
  })

  test('basic fromat equivalence', () => {
    expect(zFormat(Feb17D, 'yyyy-MM-dd')).toBe("2009-02-17")
  })

  test('basic fromat equivalence', () => {
    expect(zFormat(Feb17D, "yyyy-MM-dd'T'HH:mm:ss.000'Z'")).toBe(Feb17DstringComplete)
  })
})
