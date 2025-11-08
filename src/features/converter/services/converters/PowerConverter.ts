import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class PowerConverter extends BaseConverter {
  readonly id: ConverterType = 'power'
  readonly name = 'Power Converter'
  readonly description = 'Convert between power and energy rate units'
  readonly icon = 'bolt'
  readonly defaultFromUnit = 'watt'
  readonly defaultToUnit = 'horsepower'

  private readonly customConversions: Record<string, number> = {
    'horsepower-metric': 735.49875,
    'foot-pound-per-minute': 0.0225969658055233,
    'calorie-per-minute': 0.0697333333333333,
    'calorie-per-second': 4.1868
  }

  readonly units: ConversionUnit[] = [
    { id: 'watt', symbol: 'W', name: 'Watt', category: 'power' },
    { id: 'kilowatt', symbol: 'kW', name: 'Kilowatt', category: 'power' },
    { id: 'megawatt', symbol: 'MW', name: 'Megawatt', category: 'power' },
    { id: 'gigawatt', symbol: 'GW', name: 'Gigawatt', category: 'power' },

    { id: 'horsepower', symbol: 'hp', name: 'Horsepower', category: 'power' },
    { id: 'horsepower-metric', symbol: 'hp(M)', name: 'Metric Horsepower', category: 'power' },

    { id: 'british-thermal-unit-per-hour', symbol: 'BTU/h', name: 'BTU per Hour', category: 'power' },
    { id: 'british-thermal-unit-per-minute', symbol: 'BTU/min', name: 'BTU per Minute', category: 'power' },

    { id: 'foot-pound-per-second', symbol: 'ft⋅lb/s', name: 'Foot Pound per Second', category: 'power' },
    { id: 'foot-pound-per-minute', symbol: 'ft⋅lb/min', name: 'Foot Pound per Minute', category: 'power' },
    { id: 'calorie-per-second', symbol: 'cal/s', name: 'Calorie per Second', category: 'power' },
    { id: 'calorie-per-minute', symbol: 'cal/min', name: 'Calorie per Minute', category: 'power' },
    { id: 'joule-per-second', symbol: 'J/s', name: 'Joule per Second', category: 'power' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
      let watts: number
      if (this.customConversions[fromUnit]) {
        watts = value * this.customConversions[fromUnit]
      } else {
        const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
        const mathUnit = unit(value, mathJsFromUnit)
        watts = mathUnit.to('W').toNumber()
      }

      if (this.customConversions[toUnit]) {
        return watts / this.customConversions[toUnit]
      } else {
        const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
        return unit(watts, 'W').to(mathJsToUnit).toNumber()
      }
    }

    const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
    const mathJsToUnit = getMathJsUnitName(toUnit, this.id)

    const mathUnit = unit(value, mathJsFromUnit)
    return mathUnit.to(mathJsToUnit).toNumber()
  }

  validateUnits(fromUnit: string, toUnit: string): boolean {
    return this.units.some(u => u.id === fromUnit) &&
      this.units.some(u => u.id === toUnit)
  }
}
