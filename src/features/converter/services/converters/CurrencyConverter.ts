import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType, ExchangeRates } from '../../types'
import { BaseCurrencyService } from '../external/BaseCurrencyService'

export class CurrencyConverter extends BaseConverter {
    readonly id: ConverterType = 'currency'
    readonly name = 'Currency Converter'
    readonly description = 'Convert between world currencies with live exchange rates (powered by open.er-api.com)'
    readonly icon = 'banknote'
    readonly defaultFromUnit = 'USD'
    readonly defaultToUnit = 'EUR'

    private currencyService = new BaseCurrencyService()

    readonly units: ConversionUnit[] = [
        { id: 'USD', symbol: '$', name: 'US Dollar', category: 'currency' },
        { id: 'EUR', symbol: '€', name: 'Euro', category: 'currency' },
        { id: 'GBP', symbol: '£', name: 'British Pound', category: 'currency' },
        { id: 'JPY', symbol: '¥', name: 'Japanese Yen', category: 'currency' },
        { id: 'CNY', symbol: '¥', name: 'Chinese Yuan', category: 'currency' },
        { id: 'INR', symbol: '₹', name: 'Indian Rupee', category: 'currency' },
        { id: 'CAD', symbol: 'C$', name: 'Canadian Dollar', category: 'currency' },
        { id: 'AUD', symbol: 'A$', name: 'Australian Dollar', category: 'currency' },
        { id: 'CHF', symbol: 'Fr', name: 'Swiss Franc', category: 'currency' },
        { id: 'BRL', symbol: 'R$', name: 'Brazilian Real', category: 'currency' },
        { id: 'ZAR', symbol: 'R', name: 'South African Rand', category: 'currency' },
        { id: 'NGN', symbol: '₦', name: 'Nigerian Naira', category: 'currency' }
    ]

    async convert(value: number, fromUnit: string, toUnit: string): Promise<number> {
        return await this.currencyService.convert(value, fromUnit, toUnit)
    }

    validateUnits(fromUnit: string, toUnit: string): boolean {
        return this.units.some(u => u.id === fromUnit) &&
            this.units.some(u => u.id === toUnit)
    }

    async fetchRates(baseCurrency: string): Promise<ExchangeRates> {
        return await this.currencyService.fetchRates(baseCurrency)
    }

    getCachedRate(fromCurrency: string, toCurrency: string): number | null {
        return this.currencyService.getCachedRate(fromCurrency, toCurrency)
    }

    getLastUpdate(): number | null {
        return this.currencyService.getLastUpdate()
    }
}
