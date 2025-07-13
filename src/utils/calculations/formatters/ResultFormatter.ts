import { format, fraction } from 'mathjs';
import { CalculatorUtils } from '@/utils/constants/CalculatorUtils';

export interface FormatterSettings {
  precision?: number;
  useFractions?: boolean;
  notationMode?: 'F-E' | 'SCI';
}

export class ResultFormatter {
  /**
   * Format a numeric result according to settings
   */
  format(result: number, settings: FormatterSettings = {}): string {
    if (result === undefined || result === null || !isFinite(result)) {
      return 'Error';
    }

    try {
      const { 
        precision = 10, 
        useFractions = false, 
        notationMode = 'F-E' 
      } = settings;

      // Use scientific notation if enabled
      if (notationMode === 'SCI') {
        return format(result, {
          precision,
          notation: 'exponential',
        });
      }

      // Try to display as fraction if enabled
      if (useFractions) {
        return fraction(result).toFraction();
      }

      // Handle special cases for very large or very small numbers
      if (
        Math.abs(result) >= 1e15 ||
        (Math.abs(result) < 1e-10 && result !== 0)
      ) {
        return format(result, {
          precision,
          notation: 'exponential',
        });
      }

      // For regular numbers
      if (Number.isInteger(result)) {
        return result.toString();
      }

      // For decimal numbers, respect precision but trim unnecessary zeros
      const formattedDecimal = format(result, {
        precision,
        notation: 'fixed',
      });

      return CalculatorUtils.trimUnnecessaryZeros(formattedDecimal);
    } catch (err) {
      console.error('Formatting error:', err);
      return result.toString();
    }
  }
}
