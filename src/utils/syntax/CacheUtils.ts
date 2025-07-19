import type { FormatOptions } from '@/types/syntax'

/**
 * Utility class for cache key generation and management
 */
export class CacheUtils {
  /**
   * Generate a comprehensive cache key for syntax highlighting
   */
  static generateCacheKey(
    expr: string,
    openParenCount: number,
    syntaxHighlightingEnabled: boolean,
    options: FormatOptions
  ): string {
    const optionsKey = options.options ? JSON.stringify(options.options) : ''
    const baseKey = `${expr}-${openParenCount}-${syntaxHighlightingEnabled}`
    const modeKey = `${options.mode || 'Standard'}-${options.base || 'DEC'}`
    
    return `${baseKey}-${modeKey}-${optionsKey}`
  }

  /**
   * Generate a simpler cache key for internal operations
   */
  static generateSimpleCacheKey(expr: string, options: FormatOptions): string {
    return `${expr}-${options.mode || 'Standard'}-${options.base || 'DEC'}`
  }

  /**
   * Check if cache key should be invalidated based on options change
   */
  static shouldInvalidateCache(oldOptions: FormatOptions, newOptions: FormatOptions): boolean {
    return (
      oldOptions.mode !== newOptions.mode ||
      oldOptions.base !== newOptions.base ||
      JSON.stringify(oldOptions.options) !== JSON.stringify(newOptions.options)
    )
  }
}
