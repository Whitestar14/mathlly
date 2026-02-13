import { CalculatorUtils } from '../constants/CalculatorUtils'
import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { ParenTracker } from '../core/ParenTracker'

/**
 * Handles standard calculator operations.
 * Acts as the base class for other modes, providing expression building
 * and parentheses tracking capabilities.
 */
export class StandardOperations {
  protected calculator: any
  public parenthesesTracker: ParenTracker

  /**
   * Creates a new StandardOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    this.calculator = calculator
    this.parenthesesTracker = new ParenTracker()
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
      this.parenthesesTracker.sync(this.calculator.input)

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Operation failed'))
    }
  }

  /**
   * Handles numeric input including decimal point
   */
  handleNumber(num: string): CalculatorResult {
    if (num === ',') {
      return this.handleComma()
    }

    const currentInput = this.calculator.input

    if (currentInput === '0' && num !== '.') {
      this.calculator.input = num
      this.parenthesesTracker.sync(this.calculator.input)
      return this.createResponse()
    }

    if (CalculatorUtils.needsMultiplication(currentInput)) {
      this.calculator.input += ' × '
    }

    if (!this.validateNumberInput(num)) {
      return this.createResponse()
    }
    
    this.calculator.input += num
    this.parenthesesTracker.sync(this.calculator.input)
    
    return this.createResponse()
  }

  /**
   * Handles arithmetic operator input
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

    this.parenthesesTracker.sync(this.calculator.input)
    return this.createResponse()
  }

  /**
   * Parse the current operator state of the input
   */
  protected parseOperatorState(input: string): {
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
   */
  handleBackspace(): CalculatorResult {
    const input = this.calculator.input

    if (input === '0' || input === 'Error' || input === 'Overflow') {
      return this.createResponse()
    }

    // Check for special backspace patterns (functions)
    const specialBackspace = CalculatorUtils.handleSpecialBackspace(input)
    if (specialBackspace.handled) {
      this.calculator.input = specialBackspace.input
      this.parenthesesTracker.sync(this.calculator.input)
      return this.createResponse()
    }

    const newInput = input.slice(0, -1)

    this.calculator.input = newInput.trim().length === 0 ? '0' : newInput

    this.calculator.input = this.calculator.input
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')

    this.parenthesesTracker.sync(this.calculator.input)
    return this.createResponse()
  }

  /**
   * Handles clearing the last entered number or operator.
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
    
    this.parenthesesTracker.sync(this.calculator.input)
    return this.createResponse()
  }

  /**
   * Toggles the sign of the current number
   */
  handleToggleSign(): CalculatorResult {
    const currentInput = this.calculator.input
    if (currentInput !== '0' && currentInput !== 'Error') {
      const parts = currentInput.split(/([+×÷])/)
      const lastPart = parts[parts.length - 1].trim()
      
      if (lastPart) {
        if (lastPart.startsWith('-')) {
           parts[parts.length - 1] = lastPart.slice(1)
        } else if (lastPart.startsWith('(-')) {
           parts[parts.length - 1] = lastPart.slice(2, -1) // Remove (- and )
        } else {
           parts[parts.length - 1] = '(-' + lastPart + ')'
        }
        this.calculator.input = parts.join(' ').trim()
      }
    }
    
    this.parenthesesTracker.sync(this.calculator.input)
    return this.createResponse()
  }

  /**
   * Applies a function pattern to the last complex segment
   */
  protected applyFunctionPattern(pattern: (val: string) => string): CalculatorResult {
    try {
      const currentInput = this.calculator.input
      if (currentInput === '0' || currentInput === 'Error') {
         this.calculator.input = pattern('0')
         return this.createResponse()
      }

      const lastPart = CalculatorUtils.getLastComplexSegment(currentInput)
      
      if (lastPart) {
        const lastPartIndex = currentInput.lastIndexOf(lastPart)
        // Ensure we don't accidentally match earlier occurrences if duplicates exist,
        // though logic typically operates on the tail.
        // A safer approach is string slicing if we know it's at the end.
        
        // Check if the input ends with the last part (ignoring trailing parens for a moment)
        if (currentInput.endsWith(lastPart) || currentInput.includes(lastPart)) {
             this.calculator.input =
              currentInput.substring(0, lastPartIndex) +
              pattern(lastPart)
        } else {
            // Fallback: append
            this.calculator.input += ` × ${pattern(lastPart)}` 
        }
      } else {
         this.calculator.input = pattern(currentInput)
      }

      this.parenthesesTracker.sync(this.calculator.input)
      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(err.message)
    }
  }

  handleSquare(): CalculatorResult {
    return this.applyFunctionPattern(val => `sqr(${val})`)
  }

  handleSquareRoot(): CalculatorResult {
    return this.applyFunctionPattern(val => `√(${val})`)
  }

  handleReciprocal(): CalculatorResult {
    return this.applyFunctionPattern(val => `1/(${val})`)
  }

  handlePercentage(): CalculatorResult {
    // Append % operator. mathjs handles 10% as 0.1
    this.calculator.input += '%'
    this.parenthesesTracker.sync(this.calculator.input)
    return this.createResponse()
  }

  /**
   * Validates if a number can be added to the current input
   */
  validateNumberInput(num: string): boolean {
    if (num === '.') {
      const parts = this.calculator.input.split(/[+\-×÷]+/)
      return !parts[parts.length - 1].includes('.')
    }
    return true
  }

  isOperator(char: string): boolean {
    return CalculatorUtils.isOperator(char)
  }

  getParenthesesCount(): number {
    return this.parenthesesTracker.getOpenCount()
  }

  resetParentheses(): void {
    this.parenthesesTracker.reset()
  }

  createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}