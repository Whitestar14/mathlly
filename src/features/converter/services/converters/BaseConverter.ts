import { ConverterType, ConversionUnit, ExchangeRates } from '../../types'

export abstract class BaseConverter {
    abstract readonly id: ConverterType
    abstract readonly name: string
    abstract readonly description: string
    abstract readonly units: ConversionUnit[]
    abstract readonly defaultFromUnit: string
    abstract readonly defaultToUnit: string
    abstract readonly icon?: string

    abstract convert(value: number, fromUnit: string, toUnit: string): Promise<number> | number
    abstract validateUnits(fromUnit: string, toUnit: string): boolean

    // Optional methods for external services
    fetchRates?(baseCurrency: string): Promise<ExchangeRates>
    getCachedRate?(fromCurrency: string, toCurrency: string): number | null
    getLastUpdate?(): number | null
}
