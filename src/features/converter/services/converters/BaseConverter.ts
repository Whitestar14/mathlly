import { ConverterType, ConversionUnit, ExchangeRates } from '../../types'

export abstract class BaseConverter {
  abstract readonly id: ConverterType
  abstract readonly name: string
  abstract readonly description: string
  abstract readonly units: ConversionUnit[]
  abstract readonly defaultFromUnit: string
  abstract readonly defaultToUnit: string
  abstract readonly icon?: string

  abstract convert(value: number, fromUnit: string, toUnit: string): Promise<number> | number
  abstract validateUnits(fromUnit: string, toUnit: string): boolean
}

export interface CurrencyConverter extends BaseConverter {
  fetchRates?(baseCurrency: string): Promise<ExchangeRates>
  refreshRates?(baseCurrency?: string): Promise<void>
  getCachedRate?(fromCurrency: string, toCurrency: string): number | null
  getLastUpdate?(): number | null
}

export interface ICssUnitConverter extends BaseConverter {
  setBaseFontSize(size: number): void
  convert(value: number, fromUnit: string, toUnit: string): number
}

export function isCssUnitConverter(conv: unknown): conv is ICssUnitConverter {
  return !!conv && (conv as ICssUnitConverter).id === 'css-units'
}

export function isCurrencyConverter(conv: BaseConverter | null): conv is CurrencyConverter {
  return !!conv && typeof (conv as CurrencyConverter).refreshRates === 'function'
}
