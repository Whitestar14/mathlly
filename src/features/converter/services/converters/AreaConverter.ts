import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'

export class AreaConverter extends BaseConverter {
  readonly id: ConverterType = 'area'
  readonly name = 'Area Converter'
  readonly description = 'Convert between area and surface units'
  readonly icon = 'square'
  readonly defaultFromUnit = 'square-meter'
  readonly defaultToUnit = 'square-foot'
  protected readonly canonicalUnit: string = 'm2'

  protected readonly customConversions: Record<string, number> = {
    acre: 4046.8564224,
    hectare: 10000,
    'square-mile': 2589988.110336,
    'square-yard': 0.83612736,
    'square-inch': 0.00064516,
    are: 100,
    'square-millimeter': 0.000001,
    'square-centimeter': 0.0001,
    'square-micrometer': 1e-12,
    'square-nanometer': 1e-18
  }

  readonly units: ConversionUnit[] = [

    { id: 'square-meter', symbol: 'm²', name: 'Square Meter', category: 'area' },
    { id: 'square-kilometer', symbol: 'km²', name: 'Square Kilometer', category: 'area' },
    { id: 'square-centimeter', symbol: 'cm²', name: 'Square Centimeter', category: 'area' },
    { id: 'square-millimeter', symbol: 'mm²', name: 'Square Millimeter', category: 'area' },
    { id: 'square-micrometer', symbol: 'µm²', name: 'Square Micrometer', category: 'area' },
    { id: 'square-nanometer', symbol: 'nm²', name: 'Square Nanometer', category: 'area' },

    { id: 'square-mile', symbol: 'mi²', name: 'Square Mile', category: 'area' },
    { id: 'square-yard', symbol: 'yd²', name: 'Square Yard', category: 'area' },
    { id: 'square-foot', symbol: 'ft²', name: 'Square Foot', category: 'area' },
    { id: 'square-inch', symbol: 'in²', name: 'Square Inch', category: 'area' },
    { id: 'acre', symbol: 'ac', name: 'Acre', category: 'area' },

    { id: 'hectare', symbol: 'ha', name: 'Hectare', category: 'area' },
    { id: 'are', symbol: 'a', name: 'Are', category: 'area' }
  ]
}
