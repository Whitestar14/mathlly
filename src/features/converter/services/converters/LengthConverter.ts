import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class LengthConverter extends BaseConverter {
    readonly id: ConverterType = 'length'
    readonly name = 'Length Converter'
    readonly description = 'Convert between length and distance units'
    readonly icon = 'ruler'
    readonly defaultFromUnit = 'meter'
    readonly defaultToUnit = 'foot'

    // Conversion factors for units not supported by Math.js (relative to meters)
    private readonly customConversions: Record<string, number> = {
        fathom: 1.8288,
        chain: 20.1168,
        rod: 5.0292,
        league: 4828.032,
        furlong: 201.168,
        'light-year': 9460730472580800,
        parsec: 30856775814913673,
        'astronomical-unit': 149597870700,
        'nautical-mile': 1852
    }

    readonly units: ConversionUnit[] = [
        // SI Units
        { id: 'meter', symbol: 'm', name: 'Meter', category: 'length' },
        { id: 'kilometer', symbol: 'km', name: 'Kilometer', category: 'length' },
        { id: 'centimeter', symbol: 'cm', name: 'Centimeter', category: 'length' },
        { id: 'millimeter', symbol: 'mm', name: 'Millimeter', category: 'length' },
        { id: 'micrometer', symbol: 'µm', name: 'Micrometer', category: 'length' },
        { id: 'nanometer', symbol: 'nm', name: 'Nanometer', category: 'length' },

        // Imperial/US Units
        { id: 'mile', symbol: 'mi', name: 'Mile', category: 'length' },
        { id: 'yard', symbol: 'yd', name: 'Yard', category: 'length' },
        { id: 'foot', symbol: 'ft', name: 'Foot', category: 'length' },
        { id: 'inch', symbol: 'in', name: 'Inch', category: 'length' },
        { id: 'fathom', symbol: 'ftm', name: 'Fathom', category: 'length' },
        { id: 'chain', symbol: 'ch', name: 'Chain', category: 'length' },
        { id: 'rod', symbol: 'rd', name: 'Rod', category: 'length' },

        // Nautical Units
        { id: 'nautical-mile', symbol: 'nmi', name: 'Nautical Mile', category: 'length' },

        // Astronomical Units
        { id: 'light-year', symbol: 'ly', name: 'Light Year', category: 'length' },
        { id: 'parsec', symbol: 'pc', name: 'Parsec', category: 'length' },
        { id: 'astronomical-unit', symbol: 'AU', name: 'Astronomical Unit', category: 'length' },

        // Historical Units
        { id: 'league', symbol: 'lea', name: 'League', category: 'length' },
        { id: 'furlong', symbol: 'fur', name: 'Furlong', category: 'length' }
    ]

    convert(value: number, fromUnit: string, toUnit: string): number {
        // If either unit is custom, use conversion factors
        if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
            // Convert to meters first
            let meters: number
            if (this.customConversions[fromUnit]) {
                meters = value * this.customConversions[fromUnit]
            } else {
                const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
                const mathUnit = unit(value, mathJsFromUnit)
                meters = mathUnit.to('m').toNumber() // Fix: call toNumber()
            }

            // Convert from meters to target unit
            if (this.customConversions[toUnit]) {
                return meters / this.customConversions[toUnit]
            } else {
                const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
                return unit(meters, 'm').to(mathJsToUnit).toNumber()
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
