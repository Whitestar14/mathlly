import { CalculatorUtils } from '../constants/CalculatorUtils';
import { CalculatorConstants } from '../constants/CalculatorConstants';
import { StandardCalculations } from './StandardCalculations';
import { ExpressionConverter } from './converters/ExpressionConverter';
import { DomainValidator } from './validators/DomainValidator';
import type { ScientificCalculator } from '../../services/logic/ScientificCalculator';

/**
 * Scientific calculator wrapper that extends StandardCalculations
 * Adds expression conversion and domain validation
 */
export class ScientificCalculations extends StandardCalculations {
  private scientific: ScientificCalculator;
  private converter: ExpressionConverter;
  private validator: DomainValidator;

  constructor(calculator: ScientificCalculator) {
    super();
    this.scientific = calculator;
    this.converter = new ExpressionConverter();
    this.validator = new DomainValidator();
  }

  /**
   * Evaluates scientific expressions with conversion and validation
   */
  evaluateExpression(expr: string, options: Record<string, any> = {}): number {
    try {
      // Scientific-specific preprocessing
      const angle = this.normalizeAngle(this.scientific.options.angleUnit);
      this.validator.validate(expr);
      const convertedExpr = this.converter.convert(expr, angle);

      // Use parent evaluation with scientific mode
      return super.evaluateExpression(convertedExpr, {
        mode: 'scientific',
        ...options,
      });
    } catch (err: any) {
      if (
        err.message?.includes(CalculatorConstants.ERROR_MESSAGES.DOMAIN_ERROR)
      ) {
        throw err;
      }
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'));
    }
  }

  /**
   * Extended formatResult function wit notation support
   */
  public formatResult(result: number): string {
    const options = this.scientific?.options;
    return this._formatResult(result, options);
  }

  /**
   * Normalizes an angle mode string to a consistent format.
   * @param mode The angle mode string (e.g., 'gradians', 'degrees', 'radians').
   * @returns The normalized angle mode ('RAD', 'DEG', 'GRAD') or null if invalid.
   */
  private normalizeAngle(mode: string): 'RAD' | 'DEG' | 'GRAD' {
    switch (mode) {
      case 'radians':
        return 'RAD';
      case 'degrees':
        return 'DEG';
      case 'gradient':
        return 'GRAD';
      default:
        return 'DEG';
    }
  }
}
