import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class SpeedConverter extends BaseConverter {
  readonly id: ConverterType = 'speed'
  readonly name = 'Speed Converter'
  readonly description = 'Convert between speed and velocity units'
  readonly icon = 'gauge'
  readonly defaultFromUnit = 'kilometer-per-hour'
  readonly defaultToUnit = 'mile-per-hour'

  private readonly customConversions: Record<string, number> = {
    'mile-per-hour': 1.609344,
    'foot-per-second': 0.3048,
    'mach': 1234.84127,
    'knot': 1.852,
    'speed-of-light': 299792458
  }

  readonly units: ConversionUnit[] = [
    // Metric Units
    { id: 'meter-per-second', symbol: 'm/s', name: 'Meter per Second', category: 'speed' },
    { id: 'kilometer-per-hour', symbol: 'km/h', name: 'Kilometer per Hour', category: 'speed' },

    // Imperial/US Units
    { id: 'mile-per-hour', symbol: 'mi/h', name: 'Mile per Hour', category: 'speed' },
    { id: 'foot-per-second', symbol: 'ft/s', name: 'Foot per Second', category: 'speed' },
    { id: 'inch-per-second', symbol: 'in/s', name: 'Inch per Second', category: 'speed' },

    // Nautical Units
    { id: 'knot', symbol: 'kn', name: 'Knot', category: 'speed' },

    // Other Units
    { id: 'mach', symbol: 'Ma', name: 'Mach', category: 'speed' },
    { id: 'speed-of-light', symbol: 'c', name: 'Speed of Light', category: 'speed' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
      let speed: number
      if (this.customConversions[fromUnit])
        speed = value * this.customConversions[fromUnit]
      else {
        const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
        const mathUnit = unit(value, mathJsFromUnit)
        speed = mathUnit.to('m/s').toNumber()
      }

      if (this.customConversions[toUnit]) {
        return speed / this.customConversions[toUnit]
      } else {
        const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
        return unit(speed, 'm/s').to(mathJsToUnit).toNumber()
      }
    }

    // Both units are supported by Math.js
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
