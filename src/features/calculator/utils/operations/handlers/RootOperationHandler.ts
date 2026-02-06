import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'

/**
 * Handles root-related operations (√, ∛, y√x, 1/x)
 */
export class RootOperationHandler {
  private calculator: any

  constructor(calculator: any) {
    this.calculator = calculator
  }

  /**
   * Handle square root operation (√)
   */
  handleSquareRootOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '√('
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          const newInput = `${currentInput}√(`
          this.calculator.input = newInput
        } else {
          const openParenCount = CalculatorUtils.getOpenParenthesesCount(currentInput)

          if (openParenCount > 0) {
            const lastOpenParen = currentInput.lastIndexOf('(')
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim()

            if (!contentAfterLastParen || CalculatorUtils.isOperator(contentAfterLastParen.slice(-1))) {
              const newInput = `${currentInput}√(`
              this.calculator.input = newInput
            } else {
              const newInput = `${currentInput} × √(`
              this.calculator.input = newInput
            }
          } else {
            const newInput = `${currentInput} × √(`
            this.calculator.input = newInput
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Square root operation failed'))
    }
  }

  /**
   * Handle cube root operation (∛)
   */
  handleCubeRootOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '∛('
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}∛(`
        } else {
          this.calculator.input = `${currentInput} × ∛(`
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Cube root operation failed'))
    }
  }

  /**
   * Handle nth root operation (y√x)
   */
  handleNthRootOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'nthroot('
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}nthroot(`
        } else {
          const openParenCount = CalculatorUtils.getOpenParenthesesCount(currentInput)

          if (openParenCount > 0) {
            const lastOpenParen = currentInput.lastIndexOf('(')
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim()

            if (!contentAfterLastParen || CalculatorUtils.isOperator(contentAfterLastParen.slice(-1))) {
              this.calculator.input = `${currentInput}nthroot(`
            } else {
              this.calculator.input = `${currentInput} × nthroot(`
            }
          } else {
            this.calculator.input = `${currentInput} × nthroot(`
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Nth root operation failed'))
    }
  }

  /**
   * Handle reciprocal operation (1/x)
   */
  handleReciprocalOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '1/('
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input += '1/('
        } else {
          const lastPart = CalculatorUtils.getLastComplexSegment(currentInput)
          if (lastPart) {
            const lastPartIndex = currentInput.lastIndexOf(lastPart)

            if (lastPart.startsWith('1/(') && lastPart.endsWith(')')) {
              return this.createResponse()
            }
            this.calculator.input =
              currentInput.substring(0, lastPartIndex) +
              `1/(${lastPart})`
          } else {
            this.calculator.input = `1/(${currentInput})`
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Reciprocal operation failed'))
    }
  }

  private createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}