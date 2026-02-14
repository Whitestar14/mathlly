import { CacheManager } from '@utils/cache/CacheManager'

interface FormattingOptions {
  base?: string
  mode?: string
  useThousandsSeparator?: boolean
  formatProgrammerNumbers?: boolean
}

interface ProgrammerFormattingOptions {
  useThousandsSeparator: boolean
  formatProgrammerNumbers: boolean
}

/**
 * Composable for formatting display values
 */
export function useDisplayFormatter() {
  const CACHE_NAMES = {
    FORMAT: 'display-format',
    DISPLAY: 'display-preview',
    CONTENT: 'display-content'
  } as const

  /**
   * Format a value based on calculator mode and options
   */
  function format(value: string | number, options: FormattingOptions = {}): string {
    if (!value && value !== 0) return '0'
    if (value === 'Error') return value

    const cacheKey = generateCacheKey(value, options)

    const formatCache = CacheManager.getCache<string>(CACHE_NAMES.FORMAT, 100)

    if (formatCache.has(cacheKey)) {
      return formatCache.get(cacheKey)!
    }

    const {
      base = 'DEC',
      mode = 'Standard',
      useThousandsSeparator = true,
      formatProgrammerNumbers = false
    } = options

    let result: string
    if (mode === 'Programmer') {
      result = formatProgrammer(value, base, {
        useThousandsSeparator,
        formatProgrammerNumbers
      })
    } else {
      result = formatStandard(value, useThousandsSeparator)
    }

    formatCache.set(cacheKey, result)

    return result
  }

  /**
   * Generate a cache key for the given value and options
   */
  function generateCacheKey(value: string | number, options: FormattingOptions): string {
    const {
      base = 'DEC',
      mode = 'Standard',
      useThousandsSeparator = true,
      formatProgrammerNumbers = false
    } = options

    return `${value}-${base}-${mode}-${useThousandsSeparator}-${formatProgrammerNumbers}`
  }

  /**
   * Format a value for Programmer mode
   */
  function formatProgrammer(
    value: string | number,
    base: string,
    options: ProgrammerFormattingOptions
  ): string {
    const parts = String(value).split(/(\s*<<\s*|\s*>>\s*|\s*[+\-×÷()%]\s*)/g)

    const formattedParts = parts
      .map(part => {
        part = part.trim()
        if (!part) return ''

        if (['+', '-', '×', '÷', '(', ')', '<<', '>>', '%'].includes(part)) return part

        switch (base) {
          case 'BIN':
            return formatBinaryNumber(part, options.formatProgrammerNumbers)
          case 'HEX':
            return formatHexNumber(part, options.formatProgrammerNumbers)
          case 'OCT':
            return formatOctNumber(part, options.formatProgrammerNumbers)
          default:
            return formatDecimalNumber(part, options.useThousandsSeparator)
        }
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim()

    return formattedParts
  }

  /**
   * Format a binary number with optional grouping
   */
  function formatBinaryNumber(value: string, useFormatting: boolean): string {
    if (!value || value === 'NaN') return '0'

    let binString = value

    const padding = 4 - (binString.length % 4)
    if (padding < 4) {
      binString = '0'.repeat(padding) + binString
    }

    if (useFormatting) {
      const chunks = binString.match(/.{1,4}/g) || ['0']
      return chunks.join(' ')
    }
    return binString
  }

  /**
   * Format a hexadecimal number with optional grouping
   */
  function formatHexNumber(value: string, useFormatting: boolean): string {
    const hexValue = String(value).toUpperCase()
    if (!useFormatting) return hexValue

    return hexValue.replace(/\B(?=(\w{2})+(?!\w))/g, ' ')
  }

  /**
   * Format an octal number with optional grouping
   */
  function formatOctNumber(value: string, useFormatting: boolean): string {
    if (!useFormatting) return value

    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  /**
   * Format a decimal number with optional thousands separator
   */
  function formatDecimalNumber(value: string | number, useFormatting: boolean): string {
    if (!useFormatting) return String(value)

    const parts = String(value).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  /**
   * Format a value for Standard mode
   */
  function formatStandard(value: string | number, useFormatting: boolean): string {
    return formatDecimalNumber(value, useFormatting)
  }

  /**
   * Format a display value for preview
   */
  function formatDisplayValue(value: string | number, base: string): string {
    if (!value && value !== 0) return '0'

    const cacheKey = `${value}-${base}`

    const displayCache = CacheManager.getCache<string>(CACHE_NAMES.DISPLAY, 50)

    if (displayCache.has(cacheKey)) {
      return displayCache.get(cacheKey)!
    }

    const MAX_PREVIEW_LENGTHS: Record<string, number> = {
      BIN: 12,
      OCT: 8,
      DEC: 8,
      HEX: 6
    }

    let result = String(value)
      .replace(/^(0x|0o|0b)/, '')
      .toUpperCase()

    if (result.length > MAX_PREVIEW_LENGTHS[base]) {
      result = result.slice(0, MAX_PREVIEW_LENGTHS[base]) + '…'
    }

    displayCache.set(cacheKey, result)

    return result
  }

  /**
   * Clear all formatter caches
   */
  function clearCache(): void {
    CacheManager?.clearAllCaches?.()
  }

  return {
    format,
    formatProgrammer,
    formatStandard,
    formatBinaryNumber,
    formatHexNumber,
    formatOctNumber,
    formatDecimalNumber,
    formatDisplayValue,
    clearCache
  }
}

export type { FormattingOptions, ProgrammerFormattingOptions }
