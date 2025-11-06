export type ConverterType = 'temperature' | 'length' | 'weight' | 'css-units'

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
