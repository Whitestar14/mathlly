import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
export class SpeedConverter extends BaseConverter {
  readonly id: ConverterType = 'speed'
  readonly name = 'Speed Converter'
  readonly description = 'Convert between speed and velocity units'
  readonly icon = 'gauge'
  readonly defaultFromUnit = 'kilometer-per-hour'
  readonly defaultToUnit = 'mile-per-hour'
  readonly canonicalUnit = 'm/s'

  protected readonly customConversions: Record<string, number> = {
    'mile-per-hour': 1.609344,
    'foot-per-second': 0.3048,
    'mach': 1234.84127,
    'knot': 1.852,
    'speed-of-light': 299792458
  }

  readonly units: ConversionUnit[] = [
    { id: 'meter-per-second', symbol: 'm/s', name: 'Meter per Second', category: 'speed' },
    { id: 'kilometer-per-hour', symbol: 'km/h', name: 'Kilometer per Hour', category: 'speed' },
    { id: 'mile-per-hour', symbol: 'mi/h', name: 'Mile per Hour', category: 'speed' },
    { id: 'foot-per-second', symbol: 'ft/s', name: 'Foot per Second', category: 'speed' },
    { id: 'inch-per-second', symbol: 'in/s', name: 'Inch per Second', category: 'speed' },
    { id: 'knot', symbol: 'kn', name: 'Knot', category: 'speed' },
    { id: 'mach', symbol: 'Ma', name: 'Mach', category: 'speed' },
    { id: 'speed-of-light', symbol: 'c', name: 'Speed of Light', category: 'speed' }
  ]
}
