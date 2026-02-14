import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'

/**
 * Handles special operations (|x|, n!, mod, rand, dms, deg)
 */
export class SpecialOperationHandler {
  private calculator: any

  constructor(calculator: any) {
    this.calculator = calculator
  }

  /**
   * Handle absolute value operation (|x|)
   * Creates |x| notation that will be converted to abs(x) by ExpressionConverter
   */
  handleAbsoluteOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '|'
        return this.createResponse()
      }

      const pipes = [...currentInput.matchAll(/\|/g)]
      const openPipes = pipes.length

      if (openPipes % 2 !== 0) {
        const lastPipeIndex = pipes[pipes.length - 1].index!
        const contentAfterPipe = currentInput.slice(lastPipeIndex + 1).trim()

        if (contentAfterPipe) {
          this.calculator.input = `${currentInput}|`
          return this.createResponse()
        } else {
          this.calculator.input = currentInput.slice(0, lastPipeIndex)
          return this.createResponse()
        }
      }

      const lastChar = currentInput.trim().slice(-1)
      const isLastCharOperator =
        CalculatorUtils.isOperator(lastChar) || lastChar === '('

      if (isLastCharOperator) {
        this.calculator.input = `${currentInput}|`
      } else {
        this.calculator.input = `${currentInput} × |`
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(
        CalculatorUtils.formatError(err, 'Absolute value operation failed')
      )
    }
  }

  /**
   * Handle factorial operation (n!)
   * Adds ! directly to the input - mathjs handles factorial natively
   */
  handleFactorialOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '0!'
        return this.createResponse()
      }

      const trimmedInput = currentInput.trim()
      const lastChar = trimmedInput.slice(-1)

      if (
        CalculatorUtils.isOperator(lastChar) ||
        lastChar === '(' ||
        lastChar === '!'
      ) {
        return this.createResponse()
      }

      const lastValidMatch = trimmedInput.match(/(\d+(?:\.\d+)?|\)|π|e)$/)

      if (lastValidMatch) {
        this.calculator.input = `${currentInput}!`
      } else {
        const operatorMatch = trimmedInput.match(
          /^(.*[+\-×÷\s])([^+\-×÷\s]+)$/
        )

        if (operatorMatch) {
          const [, beforeOperand, operand] = operatorMatch
          this.calculator.input = `${beforeOperand}${operand}!`
        } else {
          this.calculator.input = `${currentInput}!`
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(
        CalculatorUtils.formatError(err, 'Factorial operation failed')
      )
    }
  }

  /**
   * Handle modulo operation
   */
  handleModuloOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = '0 mod '
      } else {
        const lastChar = currentInput.trim().slice(-1)
        if (CalculatorUtils.isOperator(lastChar) || lastChar === '(') {
          return this.createResponse() // Don't allow operator after operator
        }

        this.calculator.input += ' mod '
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(
        CalculatorUtils.formatError(err, 'Modulo operation failed')
      )
    }
  }

  /**
   * Handle random number generation
   */
  handleRandomOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input
      const randomValue = Math.random().toString()

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = randomValue
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator =
          CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input += randomValue
        } else {
          this.calculator.input += ` × ${randomValue}`
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(
        CalculatorUtils.formatError(err, 'Random operation failed')
      )
    }
  }

  /**
   * Handle DMS (Degrees, Minutes, Seconds) conversion
   */
  handleDMSOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'dms('
      } else {
        const needsParentheses =
          CalculatorUtils.needsParentheses(currentInput)

        if (needsParentheses) {
          this.calculator.input = `dms(${currentInput})`
        } else {
          const lastPart =
            CalculatorUtils.getLastComplexSegment(currentInput)
          if (lastPart) {
            const lastPartIndex = currentInput.lastIndexOf(lastPart)
            this.calculator.input =
              currentInput.substring(0, lastPartIndex) + `dms(${lastPart})`
          } else {
            this.calculator.input = `dms(${currentInput})`
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(
        CalculatorUtils.formatError(err, 'DMS operation failed')
      )
    }
  }

  /**
   * Handle degree conversion
   */
  handleDegreeOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'deg('
      } else {
        const needsParentheses =
          CalculatorUtils.needsParentheses(currentInput)

        if (needsParentheses) {
          this.calculator.input = `deg(${currentInput})`
        } else {
          const lastPart =
            CalculatorUtils.getLastComplexSegment(currentInput)
          if (lastPart) {
            const lastPartIndex = currentInput.lastIndexOf(lastPart)
            this.calculator.input =
              currentInput.substring(0, lastPartIndex) + `deg(${lastPart})`
          } else {
            this.calculator.input = `deg(${currentInput})`
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(
        CalculatorUtils.formatError(err, 'Degree operation failed')
      )
    }
  }

  private createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}
