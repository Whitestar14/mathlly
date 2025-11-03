import { CalculatorUtils } from '../constants/CalculatorUtils'
import { CalculatorConstants } from '../constants/CalculatorConstants'
import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'

/**
 * Handles standard calculator operations
 */
export class StandardOperations {
  protected calculator: any

  /**
   * Creates a new StandardOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    this.calculator = calculator
  }

  /**
   * Handle comma input for function arguments
   */
  handleComma(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error' || !currentInput.trim()) {
        return this.createResponse()
      }

      const lastChar = currentInput.trim().slice(-1)

      if (this.isOperator(lastChar) || lastChar === '(' || lastChar === ',') {
        return this.createResponse()
      }

      this.calculator.input = `${currentInput}, `

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Operation failed'))
    }
  }

  /**
   * Handles numeric input including decimal point
   * @param {string} num - The number or decimal point to add
   * @returns {Object} Updated input state and error message
   */
  handleNumber(num: string): CalculatorResult {
    if (num === ',') {
      return this.handleComma()
    }

    const currentInput = this.calculator.input

    if (currentInput === '0' && num !== '.') {
      this.calculator.input = num
      return this.createResponse()
    }

    if (CalculatorUtils.needsMultiplication(currentInput)) {
      this.calculator.input += ' × '
    }

    if (!this.validateNumberInput(num)) {
      return this.createResponse()
    }
    this.calculator.input += num
    return this.createResponse()
  }

  /**
   * Handles arithmetic operator input
   * @param {string} op - The operator to add (+, -, ×, ÷)
   * @returns {Object} Updated input state and error message
   */
  handleOperator(op: string): CalculatorResult {
    const currentInput = this.calculator.input.trim()

    if (currentInput === 'Error' || !currentInput) {
      return this.createResponse()
    }

    const state = this.parseOperatorState(currentInput)

    if (op === '-' && state.canAddNegative) {
      this.calculator.input = `${state.baseExpression} ${state.lastOperator} ${op} `
    } else {
      this.calculator.input = `${state.baseExpression} ${op} `
    }

    return this.createResponse()
  }

  /**
   * Parse the current operator state of the input
   * @param {string} input - Current input to parse
   * @returns {Object} Parsed state information
   */
  private parseOperatorState(input: string): {
    baseExpression: string;
    lastOperator: string | null;
    hasNegative: boolean;
    canAddNegative: boolean;
  } {
    const operatorPattern = /^(.*?)\s*([+\-×÷])\s*(-\s*)?$/
    const match = input.match(operatorPattern)

    if (!match) {
      return {
        baseExpression: input,
        lastOperator: null,
        hasNegative: false,
        canAddNegative: false
      }
    }

    const [, baseExpression, lastOperator, negativeSign] = match
    const hasNegative = !!negativeSign
    const canAddNegative = !hasNegative && ['×', '÷', '+'].includes(lastOperator)

    return {
      baseExpression,
      lastOperator,
      hasNegative,
      canAddNegative
    }
  }

  /**
   * Handles backspace operation
   * @returns {Object} Updated input state and error message
   */
  handleBackspace(): CalculatorResult {
    const input = this.calculator.input

    if (input === '0' || input === 'Error' || input === 'Overflow') {
      return this.createResponse()
    }

    const newInput = input.slice(0, -1)

    this.calculator.input = newInput.trim().length === 0 ? '0' : newInput

    this.calculator.input = this.calculator.input
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')

    return this.createResponse()
  }

  /**
   * Handles clearing the last entered number or operator.
   * This is a basic implementation for standard mode.
   * @returns {Object} Updated input state and error message
   */
  handleClearEntry(): CalculatorResult {
    const input = this.calculator.input
    if (input === '0' || input === 'Error') {
      return this.createResponse()
    }
    if (/\s*[+\-×÷]\s*$/.test(input)) {
      this.calculator.input = input.replace(/\s*[+\-×÷]\s*$/, '').trim()
    } else {
      const match = input.match(/(.*[+\-×÷])\s*(.*)$/)
      if (match) {
        this.calculator.input = match[1]
      } else {
        this.calculator.input = '0'
      }
    }
    if (this.calculator.input.trim() === '') {
      this.calculator.input = '0'
    }
    return this.createResponse()
  }

  /**
   * Toggles the sign of the current number
   * @returns {Object} Updated input state and error message
   */
  handleToggleSign(): CalculatorResult {
    const currentInput = this.calculator.input
    if (currentInput !== '0' && currentInput !== 'Error') {
      const parts = currentInput.split(/([+×÷])/)
      const lastPart = parts[parts.length - 1].trim()
      if (lastPart) {
        if (lastPart.startsWith('-')) parts[parts.length - 1] = lastPart.slice(1)
        else parts[parts.length - 1] = '- ' + lastPart
        this.calculator.input = parts.join(' ').trim()
      }
    }
    return this.createResponse()
  }

  /**
   * Squares the current value
   * @returns {Object} Updated input state and error message
   */
  handleSquare(): CalculatorResult {
    return this.handleOperation((value: number) => {
      if (!Number.isFinite(value)) throw new Error('Overflow')
      return Math.pow(value, 2)
    })
  }

  /**
   * Calculates the square root of the current value
   * @returns {Object} Updated input state and error message
   */
  handleSquareRoot(): CalculatorResult {
    return this.handleOperation((value: number) => {
      if (value < 0)
        throw new Error('Cannot calculate square root of negative number')
      return Math.sqrt(value)
    })
  }

  /**
   * Calculates the reciprocal (1/x) of the current value
   * @returns {Object} Updated input state and error message
   */
  handleReciprocal(): CalculatorResult {
    return this.handleOperation((value: number) => {
      if (value === 0) throw new Error('Cannot divide by zero')
      return 1 / value
    })
  }

  /**
   * Converts the current value to a percentage
   * @returns {Object} Updated input state and error message
   */
  handlePercentage(): CalculatorResult {
    return this.handleOperation((value: number) => value / 100)
  }

  /**
   * Generic handler for operations that transform the current value
   * @param {Function} operation - Function that takes a number and returns a transformed number
   * @returns {Object} Updated input state and error message
   */
  handleOperation(operation: (value: number) => number): CalculatorResult {
    try {
      const value = this.calculator.calculations.evaluateExpression(this.calculator.input)
      const result = operation(value)
      if (!Number.isFinite(result)) {
        throw new Error('Overflow')
      }
      this.calculator.input = this.calculator.calculations.formatResult(result)
      return this.createResponse()
    } catch(err: any) {
      if (err.message === 'Overflow')
        return this.createResponse(CalculatorConstants.ERROR_MESSAGES.OVERFLOW)
      return this.createResponse(err.message)
    }
  }

  /**
   * Validates if a number can be added to the current input
   * @param {string} num - The number to validate
   * @returns {boolean} Whether the number can be added
   */
  validateNumberInput(num: string): boolean {
    if (num === '.') {
      const parts = this.calculator.input.split(/[+\-×÷]+/)
      return !parts[parts.length - 1].includes('.')
    }
    return true
  }

  /**
   * Checks if a character is an operator
   * @param {string} char - Character to check
   * @returns {boolean} Whether the character is an operator
   */
  isOperator(char: string): boolean {
    return CalculatorUtils.isOperator(char)
  }

  /**
   * Creates a standardized response object
   * @param {string} [error=""] - Optional error message
   * @returns {Object} Standardized response with input and error
   */
  createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}
