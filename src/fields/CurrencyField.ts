import { StringCastCompose, GenericDefaults } from '../utils/CastCompose'
import { Field,  FieldHookDefaults, FullBaseFieldOptions } from '@flatfile/configure'
import { SchemaILField } from '@flatfile/schema'




export const getCurrencyCast = (currencySymbol: string) => {
  const BaseCurrencyCast = (raw: string): number | null => {
    const strippedStr = raw.replace(',', '').replace(currencySymbol, '')
    const num = Number(strippedStr)
    if (isFinite(num)) {
      return num
    } else {
      throw new Error(`'${raw}' parsed to '${num}' which is non-finite`)
    }
  }
  return StringCastCompose(BaseCurrencyCast)
}


type O = Record<string, any>
type T = number
type PartialBaseFieldsAndOptions = Partial<FullBaseFieldOptions<T, O>> & {fString?:string}


  //new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number));
  // the Japanese yen doesn't use a minor unit
  // ￥123,457

const numberFormatter = new Intl.NumberFormat(
  'en-US', {style: 'currency', currency: 'USD'})

export const egressFormatter = (val:number) => numberFormatter.format(val)

export const CurrencyField = (options?: string | PartialBaseFieldsAndOptions) => {
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
      cast:getCurrencyCast('$'),
      ...passedOptions,
      stageVisibility,
      annotations,
    }


  fullOpts.egressFormat = egressFormatter

  const field = new Field<T, O>(fullOpts as FullBaseFieldOptions<T, O>)
  return field
}

