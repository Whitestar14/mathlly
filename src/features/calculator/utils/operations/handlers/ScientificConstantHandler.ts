import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'

/**
 * Handles scientific constant operations (π, e)
 */
export class ScientificConstantHandler {
  private calculator: any

  constructor(calculator: any) {
    this.calculator = calculator
  }

  /**
   * Handle constant input (π, e)
   */
  handle(constant: string): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = constant
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input += constant
        } else {
          if (/[0-9)\]πe]/.test(lastChar)) {
            this.calculator.input += ` × ${constant}`
          } else {
            this.calculator.input += constant
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Operation failed'))
    }
  }

  private createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}
