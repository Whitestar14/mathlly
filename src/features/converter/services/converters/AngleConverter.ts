import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
export class AngleConverter extends BaseConverter {
  readonly id: ConverterType = 'angle'
  readonly name = 'Angle Converter'
  readonly description = 'Convert between angle and angular measurement units'
  readonly icon = 'triangle'
  readonly defaultFromUnit = 'degree'
  readonly defaultToUnit = 'radian'
  readonly canonicalUnit = 'rad'

  protected readonly customConversions: Record<string, number> = {
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
}
