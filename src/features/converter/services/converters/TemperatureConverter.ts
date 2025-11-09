import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class TemperatureConverter extends BaseConverter {
  readonly id: ConverterType = 'temperature'
  readonly name = 'Temperature Converter'
  readonly description = 'Convert between temperature units'
  readonly icon = 'thermometer'
  readonly defaultFromUnit = 'celsius'
  readonly defaultToUnit = 'fahrenheit'
  protected readonly canonicalUnit: string = 'celsius'

  readonly units: ConversionUnit[] = [
    {
      id: 'celsius',
      symbol: '°C',
      name: 'Celsius',
      category: 'temperature'
    },
    {
      id: 'fahrenheit',
      symbol: '°F',
      name: 'Fahrenheit',
      category: 'temperature'
    },
    {
      id: 'kelvin',
      symbol: 'K',
      name: 'Kelvin',
      category: 'temperature'
    },
    {
      id: 'rankine',
      symbol: '°R',
      name: 'Rankine',
      category: 'temperature'
    }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
    const mathJsToUnit = getMathJsUnitName(toUnit, this.id)

    const mathUnit = unit(value, mathJsFromUnit)
    return mathUnit.to(mathJsToUnit).toNumber()
  }
}
