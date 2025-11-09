import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
export class WeightConverter extends BaseConverter {
  readonly id: ConverterType = 'weight'
  readonly name = 'Weight & Mass Converter'
  readonly description = 'Convert between weight and mass units'
  readonly icon = 'weight'
  readonly defaultFromUnit = 'kilogram'
  readonly defaultToUnit = 'pound'
  readonly canonicalUnit = 'kg'

  protected readonly customConversions: Record<string, number> = {
    stone: 6.35029318,
    'long-ton': 1016.0469088,
    carat: 0.0002,
    grain: 0.00006479891,
    dram: 0.0017718451953125,
    'hundredweight-us': 45.359237,
    'hundredweight-uk': 50.80234544,
    'atomic-mass-unit': 1.66053906660e-27,
    dalton: 1.66053906660e-27,
    slug: 14.593902937206364
  }

  readonly units: ConversionUnit[] = [

    { id: 'kilogram', symbol: 'kg', name: 'Kilogram', category: 'weight' },
    { id: 'gram', symbol: 'g', name: 'Gram', category: 'weight' },
    { id: 'milligram', symbol: 'mg', name: 'Milligram', category: 'weight' },
    { id: 'microgram', symbol: 'µg', name: 'Microgram', category: 'weight' },
    { id: 'metric-ton', symbol: 't', name: 'Metric Ton', category: 'weight' },

    { id: 'pound', symbol: 'lb', name: 'Pound', category: 'weight' },
    { id: 'ounce', symbol: 'oz', name: 'Ounce', category: 'weight' },
    { id: 'stone', symbol: 'st', name: 'Stone', category: 'weight' },
    { id: 'short-ton', symbol: 'ton', name: 'Short Ton (US)', category: 'weight' },
    { id: 'long-ton', symbol: 'ton', name: 'Long Ton (UK)', category: 'weight' },

    { id: 'carat', symbol: 'ct', name: 'Carat', category: 'weight' },
    { id: 'grain', symbol: 'gr', name: 'Grain', category: 'weight' },
    { id: 'dram', symbol: 'dr', name: 'Dram', category: 'weight' },
    { id: 'hundredweight-us', symbol: 'cwt', name: 'Hundredweight (US)', category: 'weight' },
    { id: 'hundredweight-uk', symbol: 'cwt', name: 'Hundredweight (UK)', category: 'weight' },

    { id: 'atomic-mass-unit', symbol: 'u', name: 'Atomic Mass Unit', category: 'weight' },
    { id: 'dalton', symbol: 'Da', name: 'Dalton', category: 'weight' },
    { id: 'slug', symbol: 'slug', name: 'Slug', category: 'weight' }
  ]
}
