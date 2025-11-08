import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { convertWithCustom } from '../../utils/customConversionsHelper'

export class TimeConverter extends BaseConverter {
  readonly id: ConverterType = 'time'
  readonly name = 'Time Converter'
  readonly description = 'Convert between time units'
  readonly icon = 'clock'
  readonly defaultFromUnit = 'second'
  readonly defaultToUnit = 'minute'

  private readonly customConversions: Record<string, number> = {
    decade: 315360000,
    century: 3153600000,
    millennium: 31536000000,
    'sidereal-day': 86164.0905,
    'sidereal-year': 31558149.7632
  }

  readonly units: ConversionUnit[] = [

    { id: 'second', symbol: 's', name: 'Second', category: 'time' },
    { id: 'millisecond', symbol: 'ms', name: 'Millisecond', category: 'time' },
    { id: 'microsecond', symbol: 'µs', name: 'Microsecond', category: 'time' },
    { id: 'nanosecond', symbol: 'ns', name: 'Nanosecond', category: 'time' },

    { id: 'minute', symbol: 'min', name: 'Minute', category: 'time' },
    { id: 'hour', symbol: 'h', name: 'Hour', category: 'time' },
    { id: 'day', symbol: 'd', name: 'Day', category: 'time' },
    { id: 'week', symbol: 'wk', name: 'Week', category: 'time' },
    { id: 'month', symbol: 'mo', name: 'Month (30 days)', category: 'time' },
    { id: 'year', symbol: 'yr', name: 'Year (365 days)', category: 'time' },
    { id: 'decade', symbol: 'dec', name: 'Decade', category: 'time' },
    { id: 'century', symbol: 'cent', name: 'Century', category: 'time' },
    { id: 'millennium', symbol: 'mill', name: 'Millennium', category: 'time' },

    { id: 'sidereal-day', symbol: 'sidereal d', name: 'Sidereal Day', category: 'time' },
    { id: 'sidereal-year', symbol: 'sidereal yr', name: 'Sidereal Year', category: 'time' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    return convertWithCustom(this.id, value, fromUnit, toUnit, this.customConversions, 's')
  }

  validateUnits(fromUnit: string, toUnit: string): boolean {
    return this.units.some(u => u.id === fromUnit) &&
            this.units.some(u => u.id === toUnit)
  }
}
