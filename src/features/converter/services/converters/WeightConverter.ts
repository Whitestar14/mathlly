import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class WeightConverter extends BaseConverter {
    readonly id: ConverterType = 'weight'
    readonly name = 'Weight & Mass Converter'
    readonly description = 'Convert between weight and mass units'
    readonly icon = 'weight'
    readonly defaultFromUnit = 'kilogram'
    readonly defaultToUnit = 'pound'

    // Conversion factors for units not supported by Math.js (relative to kilograms)
    private readonly customConversions: Record<string, number> = {
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
        // SI Units
        { id: 'kilogram', symbol: 'kg', name: 'Kilogram', category: 'weight' },
        { id: 'gram', symbol: 'g', name: 'Gram', category: 'weight' },
        { id: 'milligram', symbol: 'mg', name: 'Milligram', category: 'weight' },
        { id: 'microgram', symbol: 'µg', name: 'Microgram', category: 'weight' },
        { id: 'metric-ton', symbol: 't', name: 'Metric Ton', category: 'weight' },

        // Imperial/US Units
        { id: 'pound', symbol: 'lb', name: 'Pound', category: 'weight' },
        { id: 'ounce', symbol: 'oz', name: 'Ounce', category: 'weight' },
        { id: 'stone', symbol: 'st', name: 'Stone', category: 'weight' },
        { id: 'short-ton', symbol: 'ton', name: 'Short Ton (US)', category: 'weight' },
        { id: 'long-ton', symbol: 'ton', name: 'Long Ton (UK)', category: 'weight' },

        // Other Common Units
        { id: 'carat', symbol: 'ct', name: 'Carat', category: 'weight' },
        { id: 'grain', symbol: 'gr', name: 'Grain', category: 'weight' },
        { id: 'dram', symbol: 'dr', name: 'Dram', category: 'weight' },
        { id: 'hundredweight-us', symbol: 'cwt', name: 'Hundredweight (US)', category: 'weight' },
        { id: 'hundredweight-uk', symbol: 'cwt', name: 'Hundredweight (UK)', category: 'weight' },

        // Scientific Units
        { id: 'atomic-mass-unit', symbol: 'u', name: 'Atomic Mass Unit', category: 'weight' },
        { id: 'dalton', symbol: 'Da', name: 'Dalton', category: 'weight' },
        { id: 'slug', symbol: 'slug', name: 'Slug', category: 'weight' }
    ]

    convert(value: number, fromUnit: string, toUnit: string): number {
        // If either unit is custom, use conversion factors
        if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
            // Convert to kilograms first
            let kilograms: number
            if (this.customConversions[fromUnit]) {
                kilograms = value * this.customConversions[fromUnit]
            } else {
                const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
                kilograms = unit(value, mathJsFromUnit).to('kg').toNumber()
            }

            // Convert from kilograms to target unit
            if (this.customConversions[toUnit]) {
                return kilograms / this.customConversions[toUnit]
            } else {
                const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
                return unit(kilograms, 'kg').to(mathJsToUnit).toNumber()
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
