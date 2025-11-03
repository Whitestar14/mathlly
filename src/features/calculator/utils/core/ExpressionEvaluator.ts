import { evaluate, bignumber } from 'mathjs'
import { CalculatorConstants } from '@calculator/utils/constants/CalculatorConstants'
import { CalculatorUtils } from '../constants/CalculatorUtils'
import { CacheManager } from '@utils/cache/CacheManager'

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
    CacheManager.getCache(ExpressionEvaluator.CACHE_NAME, 100)
  }

  /**
   * Evaluate expression with caching
   */
  evaluate(expr: string, options: Record<string, any> = {}): any {
    const cacheKey = this.getCacheKey(expr, options)
    const cache = CacheManager.getCache(ExpressionEvaluator.CACHE_NAME)

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    const result = this.performEvaluation(expr, options)

    cache.set(cacheKey, result)

    return result
  }

  /**
   * Generate cache key from expression and options
   */
  getCacheKey(expr: string, options: Record<string, any>): string {
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
      minValue = CalculatorConstants.MIN_VALUE
    } = options

    if (!expr || expr.trim() === '') return bignumber(0)

    if (expr.includes('÷ 0') || expr.includes('/ 0')) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.DIVISION_BY_ZERO)
    }

    let sanitizedExpr: string
    if (base && base !== 'DEC') {
      sanitizedExpr = this.convertToDecimal(CalculatorUtils.sanitizeExpression(expr), base)
    } else {
      sanitizedExpr = CalculatorUtils.sanitizeExpression(expr)
    }

    try {
      const result = evaluate(sanitizedExpr)

      this.validateEvaluationResult(result, maxValue, minValue, mode)

      return result
    } catch(err) {
      throw new Error(CalculatorUtils.formatError(err as Error))
    }
  }

  /**
   * Validate evaluation result based on calculator mode
   */
  validateEvaluationResult(result: any, maxValue: any, minValue: any, mode: string): void {
    if (!isFinite(result)) {
      if (isNaN(result)) {
        throw new Error(CalculatorConstants.ERROR_MESSAGES.DOMAIN_ERROR)
      } else {
        throw new Error(CalculatorConstants.ERROR_MESSAGES.OVERFLOW)
      }
    }

    const numericResult = typeof result === 'object' && result.toNumber ? result.toNumber() : result
    const maxVal = typeof maxValue === 'object' && maxValue.toNumber ? maxValue.toNumber() : maxValue
    const minVal = typeof minValue === 'object' && minValue.toNumber ? minValue.toNumber() : minValue

    if (mode === 'programmer') {
      if (!Number.isInteger(numericResult) && Math.abs(numericResult) > 1e-10) {
        console.warn('Non-integer result in programmer mode:', numericResult)
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

    const parts = expr.split(/(\s*<<\s*|\s*>>\s*|\s*%\s*|\s*[+\-*/()]\s*)/)
    return parts
      .map(part => {
        part = part.trim()
        if (!part) return ''

        if (/^(<<|>>|[+\-*/%()]|\s+)$/.test(part)) return part

        try {
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
