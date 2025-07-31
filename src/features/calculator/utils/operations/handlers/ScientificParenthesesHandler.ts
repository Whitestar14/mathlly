import { CalculatorUtils } from '../../constants/CalculatorUtils'
import { ParenthesesTracker } from '../../core/ParenthesesTracker'

/**
 * Handles parentheses operations for scientific calculator
 */
export class ScientificParenthesesHandler {
  private calculator: any
  private parenthesesTracker: ParenthesesTracker

  constructor(calculator: any, parenthesesTracker: ParenthesesTracker) {
    this.calculator = calculator
    this.parenthesesTracker = parenthesesTracker
  }

  /**
   * Handle parenthesis operations
   */
  handle(parenthesis: string): Record<string, any> {
    try {
      const result = this.parenthesesTracker.handleParenthesisInput(this.calculator.input, parenthesis)
      this.calculator.input = result.input
      return this.createResponse()
    } catch (err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, "Parentheses operation failed"));
    }
  }

  private createResponse(error: string = ""): Record<string, any> {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    });
  }
}
