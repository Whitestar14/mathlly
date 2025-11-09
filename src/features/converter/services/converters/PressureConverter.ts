import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'

export class PressureConverter extends BaseConverter {
  readonly id: ConverterType = 'pressure'
  readonly name = 'Pressure Converter'
  readonly description = 'Convert between pressure and stress units'
  readonly icon = 'bar-chart-3'
  readonly defaultFromUnit = 'pascal'
  readonly defaultToUnit = 'bar'
  protected readonly canonicalUnit: string = 'Pa'

  protected readonly customConversions: Record<string, number> = {
    millibar: 100,
    'pound-per-square-foot': 47.8802589804,
    barye: 0.1,
    'centimeter-of-water': 98.0665,
    'inch-of-water': 249.088908333,
    'centimeter-of-mercury': 1333.22387415,
    'inch-of-mercury': 3386.389
  }

  readonly units: ConversionUnit[] = [
    { id: 'pascal', symbol: 'Pa', name: 'Pascal', category: 'pressure' },
    { id: 'kilopascal', symbol: 'kPa', name: 'Kilopascal', category: 'pressure' },
    { id: 'megapascal', symbol: 'MPa', name: 'Megapascal', category: 'pressure' },

    { id: 'bar', symbol: 'bar', name: 'Bar', category: 'pressure' },
    { id: 'millibar', symbol: 'mbar', name: 'Millibar', category: 'pressure' },
    { id: 'atmosphere', symbol: 'atm', name: 'Atmosphere', category: 'pressure' },
    { id: 'torr', symbol: 'Torr', name: 'Torr', category: 'pressure' },
    { id: 'millimeter-of-mercury', symbol: 'mmHg', name: 'Millimeter of Mercury', category: 'pressure' },

    { id: 'pound-per-square-inch', symbol: 'psi', name: 'Pound per Square Inch', category: 'pressure' },
    { id: 'pound-per-square-foot', symbol: 'psf', name: 'Pound per Square Foot', category: 'pressure' },

    { id: 'barye', symbol: 'Ba', name: 'Barye', category: 'pressure' },
    { id: 'centimeter-of-water', symbol: 'cmH₂O', name: 'Centimeter of Water', category: 'pressure' },
    { id: 'inch-of-water', symbol: 'inH₂O', name: 'Inch of Water', category: 'pressure' },
    { id: 'centimeter-of-mercury', symbol: 'cmHg', name: 'Centimeter of Mercury', category: 'pressure' },
    { id: 'inch-of-mercury', symbol: 'inHg', name: 'Inch of Mercury', category: 'pressure' }
  ]
}
