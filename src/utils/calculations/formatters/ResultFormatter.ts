import { format, fraction } from 'mathjs';
import { CalculatorUtils } from '@/utils/constants/CalculatorUtils';

export interface FormatterSettings {
  precision?: number;
  useFractions?: boolean;
  notationMode?: 'F-E' | 'SCI';
  maxFractionDenominator?: number;
}

export class ResultFormatter {
  /**
   * Format a numeric result according to settings
   */
  format(result: number, settings: FormatterSettings = {}): string {
    if (!isFinite(result)) {
      return 'Error';
    }

    const { 
      precision = 10, 
      useFractions = false, 
      notationMode = 'F-E',
      maxFractionDenominator = 1000
    } = settings;

    try {
      // Scientific notation
      if (notationMode === 'SCI') {
        return format(result, { precision, notation: 'exponential' });
      }

      // Auto scientific for very large/small numbers
      if (Math.abs(result) >= 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
        return format(result, { precision, notation: 'exponential' });
      }

      // Fractions for non-integers only
      if (useFractions && !Number.isInteger(result)) {
        try {
          const frac = fraction(result);
          if (frac.d <= maxFractionDenominator) {
            return frac.toFraction();
          }
        } catch {
          // Ignore fraction conversion errors
          return result.toString();
        }
      }

      // Integer formatting
      if (Number.isInteger(result)) {
        return result.toString();
      }

      // Decimal formatting
      const formatted = format(result, { precision, notation: 'fixed' });
      return CalculatorUtils.trimUnnecessaryZeros(formatted);

    } catch {
      return result.toString();
    }
  }
}
