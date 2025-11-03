import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'
import { ParenthesesTracker } from '../../core/ParenthesesTracker'

/**
 * Handles power-related operations (x², x³, x^y, 10^x, etc.)
 */
export class PowerOperationHandler {
  private calculator: any
  private parenthesesTracker: ParenthesesTracker

  constructor(calculator: any, parenthesesTracker: ParenthesesTracker) {
    this.calculator = calculator
    this.parenthesesTracker = parenthesesTracker
  }

  /**
   * Handle cube operation (x³)
   */
  handleCubeOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'cube('
        this.parenthesesTracker.open(5)
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}cube(`
          this.parenthesesTracker.open(currentInput.length + 5)
        } else {
          const openParenCount = ParenthesesTracker.getOpenParenthesesCount(currentInput)

          if (openParenCount > 0) {
            const lastOpenParen = currentInput.lastIndexOf('(')
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim()

            if (!contentAfterLastParen || CalculatorUtils.isOperator(contentAfterLastParen.slice(-1))) {
              this.calculator.input = `${currentInput}cube(`
              this.parenthesesTracker.open(currentInput.length + 5)
            } else {
              this.calculator.input = `${currentInput} × cube(`
              this.parenthesesTracker.open(currentInput.length + 7)
            }
          } else {
            this.calculator.input = `${currentInput} × cube(`
            this.parenthesesTracker.open(currentInput.length + 7)
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Cube operation failed'))
    }
  }

  /**
   * Handle power operation (x^y)
   */
  handlePowerOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '0^('
        this.parenthesesTracker.open(2)
      } else {
        const lastChar = currentInput.trim().slice(-1)
        if (CalculatorUtils.isOperator(lastChar) || lastChar === '(' || lastChar === '^') {
          return this.createResponse()
        }

        const lastPart = ParenthesesTracker.getLastExpressionPart(currentInput)
        if (!lastPart || (lastPart.includes('^(') && !lastPart.endsWith(')'))) {
          return this.createResponse()
        }

        this.calculator.input += '^('
        this.parenthesesTracker.open(currentInput.length + 2)
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Power operation failed'))
    }
  }

  /**
   * Handle common base power operations (10^, 2^, e^)
   */
  handleBasePowerOperation(base: string): CalculatorResult {
    try {
      const currentInput = this.calculator.input
      const baseLength = base.length

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = `${base}^(`
        this.parenthesesTracker.open(baseLength + 2)
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}${base}^(`
          this.parenthesesTracker.open(currentInput.length + baseLength + 2)
        } else {
          this.calculator.input = `${currentInput} × ${base}^(`
          this.parenthesesTracker.open(currentInput.length + baseLength + 4)
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Base power operation failed'))
    }
  }

  handle10PowerOperation(): CalculatorResult {
    return this.handleBasePowerOperation('10')
  }

  handle2PowerOperation(): CalculatorResult {
    return this.handleBasePowerOperation('2')
  }

  handleEPowerOperation(): CalculatorResult {
    return this.handleBasePowerOperation('e')
  }

  handleExponentialOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'exp('
        this.parenthesesTracker.open(4)
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}exp(`
          this.parenthesesTracker.open(currentInput.length + 4)
        } else {
          this.calculator.input = `${currentInput} × exp(`
          this.parenthesesTracker.open(currentInput.length + 6)
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Exponential operation failed'))
    }
  }

  private createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}
