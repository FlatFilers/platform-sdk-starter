import { StringCastCompose, GenericDefaults } from '../utils/CastCompose'
import { Field,  FieldHookDefaults, FullBaseFieldOptions } from '@flatfile/configure'
import { SchemaILField } from '@flatfile/schema'


const ChronoStringDateCast = (raw:string) => {
  //const parsed = chrono.parseDate(raw)
  //const parsed = chrono.parse(raw )
  //const parsed = chrono.strict.parseDate(raw, )
  const parsedResult = chrono.strict.parse(raw)

  //const parsedDebug = chrono.strict.parse(raw)
  //console.dir(parsedDebug)
  if (parsedResult === null) {
    throw new Error(`'${raw}' parsed to 'null' which is invalid`)
  }
  if (parsedResult === undefined) {
    throw new Error(`'${raw}' parsed to undefined which is invalid`)
  }
  //folloiwng code necessary for JS compatability

  const firstResult = parsedResult[0]
  if (firstResult === null || firstResult === undefined) {
    throw new Error(`'${raw}' returned no parse results`)
  }

  const d = firstResult.date()
  //console.log(d.getHours())
  d.setHours(0)
  return d
}

export const ChronoDateCast = StringCastCompose(ChronoStringDateCast)


type O = Record<string, any>
type T = number
type PartialBaseFieldsAndOptions = Partial<FullBaseFieldOptions<T, O>> & {fString?:string}

export const DateField = (options?: string | PartialBaseFieldsAndOptions) => {
    // if labelOptions is a string, then it is the label
  let passedOptions:PartialBaseFieldsAndOptions 
  if (options === undefined) {
    passedOptions = {}
  }
  else if (typeof options === 'string') {
    passedOptions = {label: options}
  } else {
    passedOptions = options
  }

    const passedStageVisibility = (passedOptions as SchemaILField)
      ?.stageVisibility

    const stageVisibility = {
      ...GenericDefaults.stageVisibility,
      ...passedStageVisibility,
    }

    const passedAnnotations = (passedOptions as SchemaILField)?.annotations

    const annotations = {
      ...GenericDefaults.annotations,
      ...passedAnnotations,
    }

    const fullOpts = {
      ...GenericDefaults,
      ...FieldHookDefaults<T>(),
      cast:ChronoDateCast, 
      ...passedOptions,
      stageVisibility,
      annotations,
    }


  //new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number));
  // the Japanese yen doesn't use a minor unit
  // ￥123,457

  const numberFormatter = new Intl.NumberFormat(
    'en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 2,  })
  fullOpts.egressFormat = (val:number):string => numberFormatter.format(val)

  const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
  return field
}

