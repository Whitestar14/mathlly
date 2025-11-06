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

    readonly units: ConversionUnit[] = [
        { id: 'kilogram', symbol: 'kg', name: 'Kilogram', category: 'weight' },
        { id: 'gram', symbol: 'g', name: 'Gram', category: 'weight' },
        { id: 'milligram', symbol: 'mg', name: 'Milligram', category: 'weight' },
        { id: 'pound', symbol: 'lb', name: 'Pound', category: 'weight' },
        { id: 'ounce', symbol: 'oz', name: 'Ounce', category: 'weight' },
        { id: 'ton', symbol: 't', name: 'Ton (US)', category: 'weight' },
        { id: 'tonne', symbol: 't', name: 'Tonne (metric)', category: 'weight' }
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
