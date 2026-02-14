import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'
import { ParenTracker } from '../../core/ParenTracker'

/**
 * Handles parentheses operations for scientific calculator
 */
export class ScientificParenthesesHandler {
  private calculator: any
  private parenthesesTracker: ParenTracker

  constructor(calculator: any, parenthesesTracker: ParenTracker) {
    this.calculator = calculator
    this.parenthesesTracker = parenthesesTracker
  }

  /**
   * Handle parenthesis operations
   */
  handle(parenthesis: string): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (parenthesis === '(') {
        this.handleOpenParenthesis(currentInput)
      } else if (parenthesis === ')' && this.canCloseParenthesis(currentInput)) {
        this.handleCloseParenthesis(currentInput)
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Parentheses operation failed'))
    }
  }

  /**
   * Check if a closing parenthesis can be added
   * Uses ParenTracker to check open count from synced state
   */
  private canCloseParenthesis(expr: string): boolean {
    // Ensure tracker is in sync with current input before check
    this.parenthesesTracker.sync(expr)

    if (this.parenthesesTracker.getOpenCount() <= 0) return false
    if (!expr.trim()) return false

    const lastChar = expr.trim().slice(-1)
    return /[0-9A-Fa-fπe)!]/.test(lastChar)
  }

  private handleOpenParenthesis(currentInput: string): void {
    const trimmedInput = currentInput.trim()

    if (trimmedInput === '0' || trimmedInput === 'Error') {
      this.calculator.input = '('
    } else {
      const lastChar = trimmedInput.slice(-1)

      if (lastChar === '(' || /[+\-×÷]/.test(lastChar)) {
        this.calculator.input = `${currentInput}(`
      } else {
        this.calculator.input = `${currentInput} × (`
      }
    }
  }

  private handleCloseParenthesis(currentInput: string): void {
    this.calculator.input = `${currentInput})`
  }

  private createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}
