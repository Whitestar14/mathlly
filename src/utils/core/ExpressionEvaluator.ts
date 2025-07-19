import { evaluate, bignumber } from 'mathjs'
import { CalculatorConstants } from '@/utils/constants/CalculatorConstants'
import { CalculatorUtils } from '../constants/CalculatorUtils'
import { CacheManager } from '@/services/cache/CacheManager'

/**
 * Singleton expression evaluator with memoization using CacheManager
 */
export class ExpressionEvaluator {
  /** Singleton instance */
  static instance: ExpressionEvaluator | null = null

  /** Cache name for expression evaluation */
  private static readonly CACHE_NAME = 'expression-evaluation'

  /**
   * Get singleton instance
   */
  static getInstance(): ExpressionEvaluator {
    if (!this.instance) {
      this.instance = new ExpressionEvaluator()
    }
    return this.instance
  }

  /**
   * Create a new expression evaluator
   */
  constructor() {
    // Initialize cache through CacheManager
    CacheManager.getCache(ExpressionEvaluator.CACHE_NAME, 100)
  }

  /**
   * Evaluate expression with caching
   */
  evaluate(expr: string, options: Record<string, any> = {}): any {
    const cacheKey = this.getCacheKey(expr, options)
    const cache = CacheManager.getCache(ExpressionEvaluator.CACHE_NAME)

    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    // Perform actual evaluation
    const result = this.performEvaluation(expr, options)

    // Cache result using CacheManager
    cache.set(cacheKey, result)

    return result
  }

  /**
   * Generate cache key from expression and options
   */
  getCacheKey(expr: string, options: Record<string, any>): string {
    // Include mode and base in cache key for better cache separation
    const mode = options.mode || 'standard'
    const base = options.base || 'DEC'
    return `${mode}:${base}:${expr}|${JSON.stringify(options)}`
  }

  /**
   * Perform actual expression evaluation
   */
  performEvaluation(expr: string, options: Record<string, any>): any {
    const {
      base,
      mode = 'standard',
      maxValue = CalculatorConstants.MAX_VALUE,
      minValue = CalculatorConstants.MIN_VALUE,
    } = options

    if (!expr || expr.trim() === '') return bignumber(0)

    // Check for division by zero before sanitization
    if (expr.includes('÷ 0') || expr.includes('/ 0')) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.DIVISION_BY_ZERO)
    }

    // Sanitize expression based on mode
    let sanitizedExpr: string
    if (base && base !== 'DEC') {
      // Programmer mode with base conversion
      sanitizedExpr = this.convertToDecimal(CalculatorUtils.sanitizeExpression(expr), base)
    } else {
      // Standard/Scientific mode
      sanitizedExpr = CalculatorUtils.sanitizeExpression(expr)
    }

    // Evaluate using mathjs
    try {
      const result = evaluate(sanitizedExpr)

      // Validate result based on mode
      this.validateEvaluationResult(result, maxValue, minValue, mode)

      return result
    } catch (err) {
      // Use CalculatorUtils.formatError for consistent error handling
      throw new Error(CalculatorUtils.formatError(err as Error))
    }
  }

  /**
   * Validate evaluation result based on calculator mode
   */
  private validateEvaluationResult(result: any, maxValue: any, minValue: any, mode: string): void {
    if (!isFinite(result)) {
      if (isNaN(result)) {
        throw new Error(CalculatorConstants.ERROR_MESSAGES.DOMAIN_ERROR)
      } else {
        throw new Error(CalculatorConstants.ERROR_MESSAGES.OVERFLOW)
      }
    }

    // Check bounds - convert BigNumber to regular number for comparison if needed
    const numericResult = typeof result === 'object' && result.toNumber ? result.toNumber() : result
    const maxVal = typeof maxValue === 'object' && maxValue.toNumber ? maxValue.toNumber() : maxValue
    const minVal = typeof minValue === 'object' && minValue.toNumber ? minValue.toNumber() : minValue

    // Apply mode-specific validation
    if (mode === 'programmer') {
      // For programmer mode, check for integer overflow in 64-bit range
      if (!Number.isInteger(numericResult) && Math.abs(numericResult) > 1e-10) {
        // Allow small floating point errors but not actual decimals
        console.warn('Non-integer result in programmer mode:', numericResult);
      }
    }

    if (numericResult > maxVal || numericResult < minVal) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.OVERFLOW)
    }
  }

  /**
   * Convert expression from given base to decimal
   */
  convertToDecimal(expr: string, fromBase: string): string {
    const bases = CalculatorConstants.BASES
    // Split expression keeping operators intact
    const parts = expr.split(/(\s*<<\s*|\s*>>\s*|\s*%\s*|\s*[+\-*/()]\s*)/)
    return parts
      .map((part) => {
        part = part.trim()
        if (!part) return ''
        // Keep operators as is
        if (/^(<<|>>|[+\-*/%()]|\s+)$/.test(part)) return part

        // Convert numbers to decimal
        try {
          // Use CalculatorUtils.isValidForBase to check validity
          if (CalculatorUtils.isValidForBase(part, fromBase as any)) {
            const decimal = parseInt(part, (bases as any)[fromBase])
            return isNaN(decimal) ? part : decimal.toString(10)
          }
          return part
        } catch {
          return part
        }
      })
      .join('')
  }

  /**
   * Clear evaluation cache using CacheManager
   */
  clearCache(): void {
    CacheManager.clearCache(ExpressionEvaluator.CACHE_NAME)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; capacity: number } {
    const stats = CacheManager.getCacheStats()
    return stats[ExpressionEvaluator.CACHE_NAME] || { size: 0, capacity: 0 }
  }
}
