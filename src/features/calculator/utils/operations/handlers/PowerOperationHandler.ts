import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'

/**
 * Handles power-related operations (x², x³, x^y, 10^x, etc.)
 */
export class PowerOperationHandler {
  private calculator: any

  constructor(calculator: any) {
    this.calculator = calculator
  }

  /**
   * Handle cube operation (x³)
   */
  handleCubeOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'cube('
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}cube(`
        } else {
          const openParenCount = CalculatorUtils.getOpenParenthesesCount(currentInput)

          if (openParenCount > 0) {
            const lastOpenParen = currentInput.lastIndexOf('(')
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim()

            if (!contentAfterLastParen || CalculatorUtils.isOperator(contentAfterLastParen.slice(-1))) {
              this.calculator.input = `${currentInput}cube(`
            } else {
              this.calculator.input = `${currentInput} × cube(`
            }
          } else {
            this.calculator.input = `${currentInput} × cube(`
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
      } else {
        const lastChar = currentInput.trim().slice(-1)
        if (CalculatorUtils.isOperator(lastChar) || lastChar === '(' || lastChar === '^') {
          return this.createResponse()
        }

        const lastPart = CalculatorUtils.getLastComplexSegment(currentInput)
        if (!lastPart || (lastPart.includes('^(') && !lastPart.endsWith(')'))) {
          return this.createResponse()
        }

        this.calculator.input += '^('
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

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = `${base}^(`
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}${base}^(`
        } else {
          this.calculator.input = `${currentInput} × ${base}^(`
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
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}exp(`
        } else {
          this.calculator.input = `${currentInput} × exp(`
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
