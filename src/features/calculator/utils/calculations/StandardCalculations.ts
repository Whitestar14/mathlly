import { CalculatorConstants } from '../constants/CalculatorConstants.ts';
import { ExpressionEvaluator } from '../core/ExpressionEvaluator.ts';
import {
  ResultFormatter,
  type FormatterSettings,
} from './formatters/ResultFormatter';
import { CalculatorUtils } from '../constants/CalculatorUtils';
import type { StandardCalculator } from '../../services/logic/StandardCalculator';

/**
 * Handles calculations for calculator modes
 * Base class with extensible evaluation and formatting
 */
export class StandardCalculations {
  protected formatter: ResultFormatter;
  protected evaluator: ExpressionEvaluator;
  protected calculator?: StandardCalculator;

  constructor(calculator?: StandardCalculator) {
    this.calculator = calculator;
    this.formatter = new ResultFormatter();
    this.evaluator = ExpressionEvaluator.getInstance();
  }

  /**
   * Evaluates a mathematical expression
   */
  evaluateExpression(expr: string, options: Record<string, any> = {}): number {
    if (!expr?.trim()) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION);
    }

    try {
      this.validateExpression(expr);

      const evaluationOptions = {
        mode: 'standard',
        maxValue: CalculatorConstants.MAX_VALUE,
        minValue: CalculatorConstants.MIN_VALUE,
        ...options,
      };

      const result = this.evaluator.evaluate(expr, evaluationOptions);
      this.validateResult(result);

      return result;
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'));
    }
  }

  protected _formatResult(
    result: number,
    options: Record<string, any> = {}
  ): string {

    let notationMode: FormatterSettings['notationMode'] = 'F-E';
    if (options.notationMode === 'scientific') {
      notationMode = 'SCI';
    } else if (options.notationMode === 'engineering') {
      notationMode = 'ENG';
    }

    const settings = {
      precision: options.precision || 10,
      useFractions: options.useFractions || false,
      notationMode: notationMode || 'F-E',
    };

    return this.formatter.format(result, settings);
  }

  /**
   * Formats a numeric result according to settings
   */
  public formatResult(result: number): string {
    const options = this.calculator?.options || {};
    return this._formatResult(result, options);
  }

  /**
   * Validates expression before evaluation
   */
  protected validateExpression(expr: string): void {
    if (!CalculatorUtils.hasBalancedParentheses(expr)) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION);
    }
  }

  /**
   * Validates calculation result
   */
  protected validateResult(result: number): void {
    if (!isFinite(result)) {
      const message = isNaN(result)
        ? CalculatorConstants.ERROR_MESSAGES.DOMAIN_ERROR
        : CalculatorConstants.ERROR_MESSAGES.OVERFLOW;
      throw new Error(message);
    }

    const maxValue = Number(CalculatorConstants.MAX_VALUE.toString());
    const minValue = Number(CalculatorConstants.MIN_VALUE.toString());

    if (result > maxValue || result < minValue) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.OVERFLOW);
    }
  }
}
