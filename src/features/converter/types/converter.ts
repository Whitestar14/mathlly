export type ConverterType = 'temperature' | 'length' | 'weight' | 'css-units' | 'currency'

export interface ConversionUnit {
  id: string
  symbol: string
  name: string
  category: ConverterType
}

export interface ConversionResult {
  value: number
  formattedValue: string
  fromUnit: ConversionUnit
  toUnit: ConversionUnit
  visualizations?: string[]
  error?: string
}

export interface VisualizationReference {
  value: number          // Reference value in the specified unit
  unit: string          // Unit of the reference value
  name: string          // Display name (e.g., "boiling point of water")
  minRatio?: number     // Minimum ratio to display (default: 0.1)
  maxRatio?: number     // Maximum ratio to display (default: 10)
  icon?: string         // Optional icon name from lucide-vue-next
}

export interface VisualizationData {
  converterType: ConverterType
  fromUnit: string
  toUnit: string
  references: VisualizationReference[]  // Changed from 'comparisons'
}

export interface ConverterConfig {
  id: ConverterType
  name: string
  description: string
  units: ConversionUnit[]
  defaultFromUnit: string
  defaultToUnit: string
  icon?: string
  useMathJs: boolean
  customConverter?: Function
}

export interface ConverterOptions {
  defaultConverterType: ConverterType
  precision: number
  autoConvert: boolean
  showUnitAbbreviations: boolean
  enableVisualizations: boolean
  baseFontSize: number
  swapUnitsOnFlip: boolean
}

/**
 * Exchange rates response from API
 */
export interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
  timestamp: number
}

/**
 * Interface for external API-based converters (e.g., currency, crypto)
 */
export interface ExternalConverterService {
  /**
   * Fetch latest conversion rates from external API
   * @param baseCurrency - Base currency code (e.g., 'USD')
   * @returns Promise with rates object
   */
  fetchRates(baseCurrency: string): Promise<ExchangeRates>

  /**
   * Convert value using cached or fresh rates
   * @param value - Amount to convert
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code
   * @returns Promise with conversion result
   */
  convert(value: number, fromCurrency: string, toCurrency: string): Promise<number>

  /**
   * Get cached rate without fetching
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code
   * @returns Cached rate or null
   */
  getCachedRate(fromCurrency: string, toCurrency: string): number | null

  /**
   * Get last update timestamp for cached rates
   */
  getLastUpdate(): number | null
}

/**
 * Configuration for external API converters
 */
export interface ExternalConverterConfig extends Omit<ConverterConfig, 'useMathJs' | 'customConverter'> {
  useMathJs: false
  externalService: ExternalConverterService
  requiresApiKey: boolean
  apiKeyConfigPath?: string // Path in options object
  cacheTTL: number // Cache time-to-live in milliseconds
  offlineFallback: boolean // Use cached data when offline
}
