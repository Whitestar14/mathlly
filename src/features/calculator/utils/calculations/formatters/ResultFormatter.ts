import { format, fraction } from 'mathjs'
import { CalculatorUtils } from '@calculator/utils/constants/CalculatorUtils'

export interface FormatterSettings {
  precision?: number;
  useFractions?: boolean;
  notationMode?: 'F-E' | 'SCI' | 'ENG';
  maxFractionDenominator?: number;
}

export class ResultFormatter {
  /**
   * Format a numeric result according to settings
   */
  format(result: number, settings: FormatterSettings = {}): string {
    if (!isFinite(result)) {
      return 'Error'
    }

    const {
      precision = 10,
      useFractions = false,
      notationMode = 'F-E',
      maxFractionDenominator = 1000
    } = settings

    try {
      if (notationMode === 'SCI') {
        return format(result, { precision, notation: 'exponential' })
      }

      if (notationMode === 'ENG') {
        return format(result, { precision, notation: 'engineering' })
      }

      if (Math.abs(result) >= 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
        return format(result, { precision, notation: 'exponential' })
      }

      if (useFractions && !Number.isInteger(result)) {
        try {
          const frac = fraction(result)
          if (frac.d <= maxFractionDenominator) {
            return frac.toFraction()
          }
        } catch {
          return result.toString()
        }
      }

      const formatted = format(result, { precision, notation: 'fixed' })
      return CalculatorUtils.trimUnnecessaryZeros(formatted)
    } catch(err) {
      console.error('Formatting error:', err)
      return result.toString()
    }
  }
}
