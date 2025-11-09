import { unit } from 'mathjs'
import { ConversionUnit, ConverterType, ExchangeRates } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export abstract class BaseConverter {
  abstract readonly id: ConverterType
  abstract readonly name: string
  abstract readonly description: string
  abstract readonly icon: string
  abstract readonly defaultFromUnit: string
  abstract readonly defaultToUnit: string
  abstract readonly units: ConversionUnit[]

  /** canonical unit for mathjs conversions (e.g. 'm/s', 'rad') */
  abstract readonly canonicalUnit: string

  /** optional custom conversions relative to canonical */
  protected readonly customConversions?: Record<string, number> = {}

  convert(value: number, fromUnit: string, toUnit: string): number | Promise<number> {
    if (!this.customConversions) return 0
    let baseValue: number

    if (this.customConversions[fromUnit]) {
      baseValue = value * this.customConversions[fromUnit]
    } else {
      const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
      baseValue = unit(value, mathJsFromUnit).to(this.canonicalUnit).toNumber()
    }

    if (this.customConversions[toUnit]) {
      return baseValue / this.customConversions[toUnit]
    } else {
      const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
      return unit(baseValue, this.canonicalUnit).to(mathJsToUnit).toNumber()
    }
  }

  validateUnits(fromUnit: string, toUnit: string): boolean {
    return this.units.some(u => u.id === fromUnit) &&
           this.units.some(u => u.id === toUnit)
  }
}

export interface CurrencyConverter extends BaseConverter {
  fetchRates?(baseCurrency: string): Promise<ExchangeRates>
  refreshRates?(baseCurrency?: string): Promise<void>
  getCachedRate?(fromCurrency: string, toCurrency: string): number | null
  getLastUpdate?(): number | null
}

export interface CssUnitConverter extends BaseConverter {
  setBaseFontSize(size: number): void
  convert(value: number, fromUnit: string, toUnit: string): number
}

export function isCssUnitConverter(conv: BaseConverter | null): conv is CssUnitConverter {
  return !!conv && (conv as CssUnitConverter).id === 'css-units'
}

export function isCurrencyConverter(conv: BaseConverter | null): conv is CurrencyConverter {
  return !!conv && typeof (conv as CurrencyConverter).refreshRates === 'function'
}
