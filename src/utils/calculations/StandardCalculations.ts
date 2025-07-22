import { CalculatorConstants } from "@/utils/constants/CalculatorConstants.ts";
import { ExpressionEvaluator } from "@/utils/core/ExpressionEvaluator.ts";
import { ResultFormatter } from './formatters/ResultFormatter';
import { CalculatorUtils } from '../constants/CalculatorUtils';
import type { StandardCalculator } from '@/services/logic/StandardCalculator';

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
        ...options
      };

      const result = this.evaluator.evaluate(expr, evaluationOptions);
      this.validateResult(result);
      
      return result;
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  /**
   * Formats a numeric result according to settings
   */
  formatResult(result: number, options: Record<string, any> = {}): string {
    const settings = {
      precision: options.precision || this.calculator?.options.precision || 10,
      useFractions: options.useFractions || this.calculator?.options.useFractions || false,
      notationMode: options.notationMode || 'F-E',
      ...options
    };

    return this.formatter.format(result, settings);
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
