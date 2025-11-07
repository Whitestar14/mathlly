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
        // Major Reserve Currencies
        { id: 'USD', symbol: '$', name: 'US Dollar', category: 'currency' },
        { id: 'EUR', symbol: '€', name: 'Euro', category: 'currency' },
        { id: 'GBP', symbol: '£', name: 'British Pound', category: 'currency' },
        { id: 'JPY', symbol: '¥', name: 'Japanese Yen', category: 'currency' },
        { id: 'CHF', symbol: 'Fr', name: 'Swiss Franc', category: 'currency' },

        // Other Major Currencies
        { id: 'CAD', symbol: 'C$', name: 'Canadian Dollar', category: 'currency' },
        { id: 'AUD', symbol: 'A$', name: 'Australian Dollar', category: 'currency' },
        { id: 'CNY', symbol: '¥', name: 'Chinese Yuan', category: 'currency' },
        { id: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', category: 'currency' },
        { id: 'SGD', symbol: 'S$', name: 'Singapore Dollar', category: 'currency' },
        { id: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', category: 'currency' },
        { id: 'KRW', symbol: '₩', name: 'South Korean Won', category: 'currency' },
        { id: 'INR', symbol: '₹', name: 'Indian Rupee', category: 'currency' },
        { id: 'BRL', symbol: 'R$', name: 'Brazilian Real', category: 'currency' },
        { id: 'RUB', symbol: '₽', name: 'Russian Ruble', category: 'currency' },
        { id: 'ZAR', symbol: 'R', name: 'South African Rand', category: 'currency' },
        { id: 'MXN', symbol: '$', name: 'Mexican Peso', category: 'currency' },

        // European Currencies
        { id: 'SEK', symbol: 'kr', name: 'Swedish Krona', category: 'currency' },
        { id: 'NOK', symbol: 'kr', name: 'Norwegian Krone', category: 'currency' },
        { id: 'DKK', symbol: 'kr', name: 'Danish Krone', category: 'currency' },
        { id: 'PLN', symbol: 'zł', name: 'Polish Złoty', category: 'currency' },

        // Middle Eastern Currencies
        { id: 'AED', symbol: 'د.إ', name: 'UAE Dirham', category: 'currency' },
        { id: 'SAR', symbol: '﷼', name: 'Saudi Riyal', category: 'currency' },
        { id: 'ILS', symbol: '₪', name: 'Israeli Shekel', category: 'currency' },
        { id: 'TRY', symbol: '₺', name: 'Turkish Lira', category: 'currency' },

        // Asian Currencies
        { id: 'THB', symbol: '฿', name: 'Thai Baht', category: 'currency' },
        { id: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', category: 'currency' },
        { id: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', category: 'currency' },
        { id: 'PHP', symbol: '₱', name: 'Philippine Peso', category: 'currency' },
        { id: 'VND', symbol: '₫', name: 'Vietnamese Dong', category: 'currency' },

        // African Currencies
        { id: 'EGP', symbol: '£', name: 'Egyptian Pound', category: 'currency' },
        { id: 'NGN', symbol: '₦', name: 'Nigerian Naira', category: 'currency' },
        { id: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', category: 'currency' },
        { id: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', category: 'currency' },

        // Cryptocurrencies (if you want to add them later)
        // { id: 'BTC', symbol: '₿', name: 'Bitcoin', category: 'currency' },
        // { id: 'ETH', symbol: 'Ξ', name: 'Ethereum', category: 'currency' }
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
