import { BaseType } from '@/utils/constants/CalculatorConstants.ts';
import { CalculatorUtils } from '../constants/CalculatorUtils';
import { StandardCalculations } from './StandardCalculations';
import { ProgrammerCalculator } from '@/services/logic/ProgrammerCalculator';

/**
 * Programmer calculator wrapper that extends StandardCalculations
 * Adds base conversion and integer-only evaluation
 */
export class ProgrammerCalculations extends StandardCalculations {
  private programmer: ProgrammerCalculator;
  private currentBase: BaseType;

  constructor(calculator: ProgrammerCalculator, initialBase: BaseType = 'DEC') {
    super();
    this.programmer = calculator;
    this.currentBase = initialBase;
  }

  /**
   * Evaluates expressions with integer truncation and base support
   */
  evaluateExpression(expr: string, options: Record<string, any> = {}): number {
    try {
      const base = (options.base as BaseType) || this.currentBase;

      // Use parent evaluation with programmer mode
      const result = super.evaluateExpression(expr, {
        mode: 'programmer',
        base: base,
        ...options
      });

      return Math.trunc(result);
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  /**
   * Formats results for specific base with integer validation
   */
  formatResult(result: number, options?: Record<string, any>): string {
    const base: BaseType = (options?.base as BaseType) || this.currentBase;
    if (!result && result !== 0) return 'Overflow';

    try {
      this.validateResult(result);

      return CalculatorUtils.formatForBase(Math.abs(result), base);
    } catch (err) {
      console.error('Error formatting result:', err);
      return base === 'DEC' ? super.formatResult(result, options) : 'Overflow';
    }
  }

  /**
   * Evaluates expression with specific base
   */
  evaluateExpressionWithBase(expr: string, base: BaseType): number {
    return this.evaluateExpression(expr, { base });
  }

  /**
   * Set the current base for calculations
   */
  setCurrentBase(base: BaseType): void {
    this.currentBase = base;
  }

  /**
   * Get the current base
   */
  getCurrentBase(): BaseType {
    return this.currentBase;
  }
}
