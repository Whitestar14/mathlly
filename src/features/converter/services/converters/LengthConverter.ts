import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { convertWithCustom } from '@features/converter/utils/customConversionsHelper'

export class LengthConverter extends BaseConverter {
  readonly id: ConverterType = 'length'
  readonly name = 'Length Converter'
  readonly description = 'Convert between length and distance units'
  readonly icon = 'ruler'
  readonly defaultFromUnit = 'meter'
  readonly defaultToUnit = 'foot'

  private readonly customConversions: Record<string, number> = {
    fathom: 1.8288,
    chain: 20.1168,
    rod: 5.0292,
    league: 4828.032,
    furlong: 201.168,
    'light-year': 9460730472580800,
    parsec: 3085677581491367,
    'astronomical-unit': 149597870700,
    'nautical-mile': 1852
  }

  readonly units: ConversionUnit[] = [

    { id: 'meter', symbol: 'm', name: 'Meter', category: 'length' },
    { id: 'kilometer', symbol: 'km', name: 'Kilometer', category: 'length' },
    { id: 'centimeter', symbol: 'cm', name: 'Centimeter', category: 'length' },
    { id: 'millimeter', symbol: 'mm', name: 'Millimeter', category: 'length' },
    { id: 'micrometer', symbol: 'µm', name: 'Micrometer', category: 'length' },
    { id: 'nanometer', symbol: 'nm', name: 'Nanometer', category: 'length' },

    { id: 'mile', symbol: 'mi', name: 'Mile', category: 'length' },
    { id: 'yard', symbol: 'yd', name: 'Yard', category: 'length' },
    { id: 'foot', symbol: 'ft', name: 'Foot', category: 'length' },
    { id: 'inch', symbol: 'in', name: 'Inch', category: 'length' },
    { id: 'fathom', symbol: 'ftm', name: 'Fathom', category: 'length' },
    { id: 'chain', symbol: 'ch', name: 'Chain', category: 'length' },
    { id: 'rod', symbol: 'rd', name: 'Rod', category: 'length' },

    { id: 'nautical-mile', symbol: 'nmi', name: 'Nautical Mile', category: 'length' },

    { id: 'light-year', symbol: 'ly', name: 'Light Year', category: 'length' },
    { id: 'parsec', symbol: 'pc', name: 'Parsec', category: 'length' },
    { id: 'astronomical-unit', symbol: 'AU', name: 'Astronomical Unit', category: 'length' },

    { id: 'league', symbol: 'lea', name: 'League', category: 'length' },
    { id: 'furlong', symbol: 'fur', name: 'Furlong', category: 'length' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    return convertWithCustom(this.id, value, fromUnit, toUnit, this.customConversions, 'm')
  }

  validateUnits(fromUnit: string, toUnit: string): boolean {
    return this.units.some(u => u.id === fromUnit) &&
            this.units.some(u => u.id === toUnit)
  }
}
