import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator';
import { CalculatorUtils } from '../constants/CalculatorUtils';
import { ERROR_MESSAGES } from '../constants/CalculatorConstants';
import { ExpressionConverter } from './converters/ExpressionConverter';
import { ResultFormatter } from './formatters/ResultFormatter';
import { DomainValidator } from './validators/DomainValidator';
import type { ScientificCalculator } from '@/services/logic/ScientificCalculator';

/**
 * Handles calculations for the scientific calculator mode
 */
export class ScientificCalculations {
  private calculator: ScientificCalculator;
  private evaluator: ExpressionEvaluator;
  private converter: ExpressionConverter;
  private formatter: ResultFormatter;
  private validator: DomainValidator;

  constructor(calculator: ScientificCalculator) {
    this.calculator = calculator;
    this.evaluator = ExpressionEvaluator.getInstance();
    this.converter = new ExpressionConverter();
    this.formatter = new ResultFormatter();
    this.validator = new DomainValidator();
  }

  /**
   * Evaluates a mathematical expression
   */
  evaluateExpression(expr: string): number {
    try {
      // Update converter with current angle mode
      this.converter.setAngleMode(this.calculator.angleMode.value);
      
      // Check for domain violations before conversion
      this.validator.validate(expr);
      
      // Convert expression to mathjs format
      const convertedExpr = this.converter.convert(expr);
      
      // Sanitize and evaluate
      const sanitizedExpr = CalculatorUtils.sanitizeExpression(convertedExpr);
      const result = this.evaluator.evaluate(sanitizedExpr);

      if (!isFinite(result)) {
        throw new Error(ERROR_MESSAGES.DOMAIN_ERROR);
      }

      return result;
    } catch (err: any) {
      if (err.message?.includes(ERROR_MESSAGES.DOMAIN_ERROR)) {
        throw err;
      }
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'));
    }
  }

  /**
   * Formats a numeric result according to calculator settings
   */
  formatResult(result: number): string {
    return this.formatter.format(result, {
      precision: this.calculator.toolSettings?.precision,
      useFractions: this.calculator.toolSettings?.useFractions,
      notationMode: this.calculator.notationMode.value
    });
  }
}
