import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class AngleConverter extends BaseConverter {
  readonly id: ConverterType = 'angle'
  readonly name = 'Angle Converter'
  readonly description = 'Convert between angle and angular measurement units'
  readonly icon = 'triangle'
  readonly defaultFromUnit = 'degree'
  readonly defaultToUnit = 'radian'

  private readonly customConversions: Record<string, number> = {
    quadrant: Math.PI / 2,
    sextant: Math.PI / 3
  }

  readonly units: ConversionUnit[] = [
    { id: 'degree', symbol: '°', name: 'Degree', category: 'angle' },
    { id: 'radian', symbol: 'rad', name: 'Radian', category: 'angle' },
    { id: 'gradian', symbol: 'grad', name: 'Gradian', category: 'angle' },

    { id: 'arcminute', symbol: "'", name: 'Arcminute', category: 'angle' },
    { id: 'arcsecond', symbol: '"', name: 'Arcsecond', category: 'angle' },
    { id: 'milliradian', symbol: 'mil', name: 'Milliradian', category: 'angle' },
    { id: 'turn', symbol: 'turn', name: 'Turn', category: 'angle' },
    { id: 'quadrant', symbol: 'quad', name: 'Quadrant', category: 'angle' },
    { id: 'sextant', symbol: 'sextant', name: 'Sextant', category: 'angle' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
      let radians: number
      if (this.customConversions[fromUnit]) {
        radians = value * this.customConversions[fromUnit]
      } else {
        const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
        const mathUnit = unit(value, mathJsFromUnit)
        radians = mathUnit.to('rad').toNumber()
      }

      if (this.customConversions[toUnit]) {
        return radians / this.customConversions[toUnit]
      } else {
        const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
        return unit(radians, 'rad').to(mathJsToUnit).toNumber()
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
