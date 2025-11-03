
import { unref } from 'vue'
import { CalculatorUtils } from '../constants/CalculatorUtils'
import { CalculatorConstants } from '../constants/CalculatorConstants'
import { StandardCalculations } from './StandardCalculations'
import { ExpressionConverter } from './converters/ExpressionConverter'
import { DomainValidator } from './validators/DomainValidator'

/**
 * Scientific calculator wrapper that extends StandardCalculations
 * Adds expression conversion and domain validation
 */
export class ScientificCalculations extends StandardCalculations {
  private converter: ExpressionConverter
  private validator: DomainValidator

  constructor() {
    super()
    this.converter = new ExpressionConverter()
    this.validator = new DomainValidator()
  }

  /**
   * Evaluates scientific expressions with conversion and validation
   */
  evaluateExpression(expr: string, options: Record<string, any> = {}): number {
    try {
      const angleUnit = unref(this.options.angleUnit)
      const angle = this.normalizeAngle(angleUnit)

      this.validator.validate(expr)
      const convertedExpr = this.converter.convert(expr, angle)

      return super.evaluateExpression(convertedExpr, {
        mode: 'scientific',
        ...options
      })
    } catch(err: any) {
      if (err.message?.includes(CalculatorConstants.ERROR_MESSAGES.DOMAIN_ERROR)) {
        throw err
      }
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'))
    }
  }

  /**
   * Extended formatResult function with notation support
   */
  public formatResult(result: number): string {
    const options = this.options.options
    return this._formatResult(result, options)
  }

  /**
   * Normalizes an angle mode string to a consistent format.
   */
  private normalizeAngle(mode: string): 'RAD' | 'DEG' | 'GRAD' {
    switch (mode) {
      case 'radians': return 'RAD'
      case 'degrees': return 'DEG'
      case 'gradians': return 'GRAD'
      default: return 'DEG'
    }
  }
}
