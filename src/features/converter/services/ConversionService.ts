import { unit } from 'mathjs'
import { CacheManager } from '@utils/cache/CacheManager'
import type { ConverterType, ConversionResult } from '../types/converter'
import { ConverterRegistry } from './ConverterRegistry'
import { getMathJsUnitName } from '../utils/unitHelpers'
import { useConverterOptions } from '@converter/composables/useConverterOptions'
import { useConversionVisualization } from '@converter/composables/useConversionVisualization'
import { useDisplayFormatter } from '@calculator/services/display/DisplayFormatter'

/**
 * Singleton conversion service with caching for unit conversions
 */
export class ConversionService {
  /** Singleton instance */
  static instance: ConversionService | null = null

  /** Cache name for unit conversions */
  private static readonly CACHE_NAME = 'unit-conversion'

  /**
   * Get singleton instance
   */
  static getInstance(): ConversionService {
    if (!this.instance) {
      this.instance = new ConversionService()
    }
    return this.instance
  }

  /**
   * Create a new conversion service
   */
  constructor() {
    CacheManager.getCache(ConversionService.CACHE_NAME, 200)
  }

  /**
   * Convert value between units
   */
  async convert(value: number, fromUnit: string, toUnit: string, converterType: ConverterType, precision?: number): Promise<ConversionResult> {
    const cacheKey = `${converterType}:${value}:${fromUnit}:${toUnit}`
    const cache = CacheManager.getCache(ConversionService.CACHE_NAME)

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    const registry = ConverterRegistry.getInstance()
    const config = registry.get(converterType)

    if (!config) {
      return {
        value: 0,
        formattedValue: '',
        fromUnit: { id: fromUnit, symbol: '', name: '', category: converterType },
        toUnit: { id: toUnit, symbol: '', name: '', category: converterType },
        error: 'Invalid converter type'
      }
    }

    const fromUnitObj = registry.getUnit(converterType, fromUnit)
    const toUnitObj = registry.getUnit(converterType, toUnit)

    if (!fromUnitObj || !toUnitObj) {
      return {
        value: 0,
        formattedValue: '',
        fromUnit: fromUnitObj || { id: fromUnit, symbol: '', name: '', category: converterType },
        toUnit: toUnitObj || { id: toUnit, symbol: '', name: '', category: converterType },
        error: 'Invalid units'
      }
    }

    try {
      let convertedValue: number

      const mathJsFromUnit = getMathJsUnitName(fromUnit, converterType)
      const mathJsToUnit = getMathJsUnitName(toUnit, converterType)

      // Note: CSS units converter uses a hybrid approach:
      // - Math.js for absolute units (px, pt, cm, mm, in)
      // - Custom logic for relative units (rem, em, %) and viewport units (vh, vw)
      if (config.useMathJs) {
        const mathUnit = unit(value, mathJsFromUnit)
        convertedValue = mathUnit.to(mathJsToUnit).toNumber()
      } else {
        if (config.customConverter) {
          // Check if converter returns Promise (async)
          const result = config.customConverter(value, fromUnit, toUnit)
          convertedValue = result instanceof Promise ? await result : result
        } else {
          throw new Error('No conversion method available')
        }
      }

      const actualPrecision = precision ?? useConverterOptions().precision.value
      const formattedValue = this.formatResult(convertedValue, actualPrecision)

      const { getVisualization } = useConversionVisualization()
      const { enableVisualizations } = useConverterOptions()
      let visualizations: string[] | undefined
      if (enableVisualizations.value) {
        visualizations = getVisualization(
          convertedValue,
          fromUnit,
          toUnit,
          converterType
        )
      }

      const result: ConversionResult = {
        value: convertedValue,
        formattedValue,
        fromUnit: fromUnitObj,
        toUnit: toUnitObj,
        visualizations
      }

      cache.set(cacheKey, result)
      return result
    } catch (error) {
      return {
        value: 0,
        formattedValue: '',
        fromUnit: fromUnitObj,
        toUnit: toUnitObj,
        error: (error as Error).message
      }
    }
  }

  /**
   * Validate if conversion is possible between units
   */
  validateConversion(fromUnit: string, toUnit: string, converterType: ConverterType): boolean {
    const registry = ConverterRegistry.getInstance()
    const config = registry.get(converterType)

    if (!config) return false

    const fromUnitObj = registry.getUnit(converterType, fromUnit)
    const toUnitObj = registry.getUnit(converterType, toUnit)

    if (!fromUnitObj || !toUnitObj) return false

    if (config.useMathJs) {
      try {
        const mathJsFromUnit = getMathJsUnitName(fromUnit, converterType)
        const mathJsToUnit = getMathJsUnitName(toUnit, converterType)
        const testUnit = unit(1, mathJsFromUnit)
        testUnit.to(mathJsToUnit)
        return true
      } catch {
        return false
      }
    } else {
      // Assume custom converters can handle if units exist
      return true
    }
  }

  /**
   * Format result with precision and thousand separators
   */
  formatResult(value: number, precision: number): string {
    // precision is now required parameter
    const { formatDecimalNumber } = useDisplayFormatter()
    const fixedValue = value.toFixed(precision)
    return formatDecimalNumber(fixedValue, true)
  }

  /**
   * Clear conversion cache
   */
  clearCache(): void {
    CacheManager.clearCache(ConversionService.CACHE_NAME)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; capacity: number } {
    const stats = CacheManager.getCacheStats()
    return stats[ConversionService.CACHE_NAME] || { size: 0, capacity: 0 }
  }
}
