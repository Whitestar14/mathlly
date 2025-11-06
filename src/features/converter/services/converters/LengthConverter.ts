import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConverterType, ConversionUnit } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class LengthConverter extends BaseConverter {
    readonly id: ConverterType = 'length'
    readonly name = 'Length Converter'
    readonly description = 'Convert between length and distance units'
    readonly icon = 'ruler'
    readonly defaultFromUnit = 'meter'
    readonly defaultToUnit = 'foot'

    readonly units: ConversionUnit[] = [
        { id: 'meter', symbol: 'm', name: 'Meter', category: 'length' },
        { id: 'centimeter', symbol: 'cm', name: 'Centimeter', category: 'length' },
        { id: 'millimeter', symbol: 'mm', name: 'Millimeter', category: 'length' },
        { id: 'kilometer', symbol: 'km', name: 'Kilometer', category: 'length' },
        { id: 'foot', symbol: 'ft', name: 'Foot', category: 'length' },
        { id: 'yard', symbol: 'yd', name: 'Yard', category: 'length' },
        { id: 'mile', symbol: 'mi', name: 'Mile', category: 'length' },
        { id: 'inch', symbol: 'in', name: 'Inch', category: 'length' }
    ]

    convert(value: number, fromUnit: string, toUnit: string): number {
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
