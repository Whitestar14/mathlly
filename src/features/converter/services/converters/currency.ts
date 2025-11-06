import type { ConverterConfig } from '../../types/converter'
import { BaseCurrencyService } from '../external/BaseCurrencyService'

const currencyService = new BaseCurrencyService()

// Custom converter function for currency conversion
const customConverter = async (value: number, fromUnit: string, toUnit: string): Promise<number> => {
  return await currencyService.convert(value, fromUnit, toUnit)
}

export const currencyConfig: ConverterConfig = {
  id: 'currency',
  name: 'Currency Converter',
  description: 'Convert between world currencies with live exchange rates (powered by open.er-api.com)',
  icon: 'banknote',
  useMathJs: false,
  customConverter,
  defaultFromUnit: 'USD',
  defaultToUnit: 'EUR',
  units: [
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
}

export { currencyService }