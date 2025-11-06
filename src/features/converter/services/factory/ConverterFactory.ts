import type { ConverterType, ConversionResult, ConversionUnit } from '@converter/types'
import { TemperatureConverter } from '../converters/TemperatureConverter'
import { LengthConverter } from '../converters/LengthConverter'
import { WeightConverter } from '../converters/WeightConverter'
import { CurrencyConverter } from '../converters/CurrencyConverter'
import { CssUnitsConverter } from '../converters/CssUnitsConverter'
import type { BaseConverter } from '../converters/BaseConverter'

export class ConverterFactory {
  static create(type: ConverterType): BaseConverter {
    switch (type) {
      case 'temperature': return new TemperatureConverter()
      case 'length': return new LengthConverter()
      case 'weight': return new WeightConverter()
      case 'currency': return new CurrencyConverter()
      case 'css-units': return new CssUnitsConverter()
      default: throw new Error(`Unsupported converter type: ${type}`)
    }
  }

  static getAvailableTypes(): ConverterType[] {
    return ['temperature', 'length', 'weight', 'currency', 'css-units']
  }

  static getConverterInfo(type: ConverterType) {
    const converter = this.create(type)
    return {
      id: converter.id,
      name: converter.name,
      description: converter.description,
      icon: converter.icon
    }
  }
}