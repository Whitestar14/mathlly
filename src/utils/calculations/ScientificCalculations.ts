import { CalculatorUtils } from '../constants/CalculatorUtils';
import { CalculatorConstants } from '../constants/CalculatorConstants';
import { StandardCalculations } from './StandardCalculations';
import { ExpressionConverter } from './converters/ExpressionConverter';
import { DomainValidator } from './validators/DomainValidator';
import type { ScientificCalculator } from '@/services/logic/ScientificCalculator';

/**
 * Scientific calculator wrapper that extends StandardCalculations
 * Adds expression conversion and domain validation
 */
export class ScientificCalculations extends StandardCalculations {
  private scientificCalculator: ScientificCalculator;
  private converter: ExpressionConverter;
  private validator: DomainValidator;

  constructor(calculator: ScientificCalculator) {
    super();
    this.scientificCalculator = calculator;
    this.converter = new ExpressionConverter();
    this.validator = new DomainValidator();
  }

  /**
   * Evaluates scientific expressions with conversion and validation
   */
  evaluateExpression(expr: string, options: Record<string, any> = {}): number {
    try {
      // Scientific-specific preprocessing
      this.converter.setAngleMode(this.scientificCalculator.angleMode.value);
      this.validator.validate(expr);
      const convertedExpr = this.converter.convert(expr);

      // Use parent evaluation with scientific mode
      return super.evaluateExpression(convertedExpr, {
        mode: 'scientific',
        ...options
      });
    } catch (err: any) {
      if (err.message?.includes(CalculatorConstants.ERROR_MESSAGES.DOMAIN_ERROR)) {
        throw err;
      }
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'));
    }
  }

  /**
   * Formats results with scientific notation support
   */
  formatResult(result: number, options: Record<string, any> = {}): string {
    return super.formatResult(result, {
      precision: this.scientificCalculator.toolSettings?.precision,
      useFractions: this.scientificCalculator.toolSettings?.useFractions,
      notationMode: this.scientificCalculator.notationMode.value,
      ...options
    });
  }
}
