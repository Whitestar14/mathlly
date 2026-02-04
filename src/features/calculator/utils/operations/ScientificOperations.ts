import { StandardOperations } from '../operations/StandardOperations.ts'
import { ParenTracker } from '../core/ParenTracker.ts'
import { CalculatorUtils } from '../constants/CalculatorUtils'
import { ScientificFunctionHandler } from './handlers/ScientificFunctionHandler'
import { ScientificConstantHandler } from './handlers/ScientificConstantHandler'
import { ScientificParenthesesHandler } from './handlers/ScientificParenthesesHandler'
import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory.ts'

/**
 * Handles scientific calculator operations
 * Delegates basic operations to StandardOperations and scientific operations to specialized handlers
 * This approach keeps the class focused and maintainable while preserving all functionality
 */
export class ScientificOperations extends StandardOperations {
  parenthesesTracker: ParenTracker
  private functionHandler: ScientificFunctionHandler
  private constantHandler: ScientificConstantHandler
  private parenthesesHandler: ScientificParenthesesHandler

  /**
   * Creates a new ScientificOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    super(calculator)
    this.parenthesesTracker = new ParenTracker()

    this.functionHandler = new ScientificFunctionHandler(calculator)
    this.constantHandler = new ScientificConstantHandler(calculator)
    this.parenthesesHandler = new ScientificParenthesesHandler(calculator, this.parenthesesTracker)
  }

  /**
   * Handle scientific function operations (sin, cos, log, sqrt, etc.)
   * Delegates to specialized function handler
   */
  handleScientificFunction(func: string): CalculatorResult {
    try {
      const result = this.functionHandler.handle(func)
      this.parenthesesTracker.sync(this.calculator.input)
      return result
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Scientific function failed'))
    }
  }

  /**
   * Handle constant input (π, e)
   * Delegates to specialized constant handler
   */
  handleConstant(constant: string): CalculatorResult {
    try {
      const result = this.constantHandler.handle(constant)
      this.parenthesesTracker.sync(this.calculator.input)
      return result
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Constant input failed'))
    }
  }

  /**
   * Handle parenthesis operations with scientific expression tracking
   * Delegates to specialized parentheses handler
   */
  handleParenthesis(parenthesis: string): CalculatorResult {
    try {
      const result = this.parenthesesHandler.handle(parenthesis)
      this.parenthesesTracker.sync(this.calculator.input)
      return result
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Parentheses operation failed'))
    }
  }

  /**
   * Enhanced backspace handling for scientific expressions
   * Extends StandardOperations backspace with scientific-specific logic
   */
  handleBackspace(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        const res = super.handleBackspace()
        this.parenthesesTracker.sync(this.calculator.input)
        return res
      }

      const specialBackspace = CalculatorUtils.handleSpecialBackspace(currentInput)
      if (specialBackspace.handled) {
        this.calculator.input = specialBackspace.input
        this.parenthesesTracker.sync(this.calculator.input)
        return this.createResponse()
      }

      const response = super.handleBackspace()
      this.parenthesesTracker.sync(this.calculator.input)
      return response
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Backspace failed'))
    }
  }

  /**
   * Enhanced clear entry for scientific mode
   * Handles clearing within parentheses and complex expressions
   */
  handleClearEntry(): CalculatorResult {
    try {
      const input = this.calculator.input

      if (input !== '0' && input !== 'Error') {
        const lastOpenIndex = input.lastIndexOf('(')
        const lastCloseIndex = input.lastIndexOf(')')

        if (lastOpenIndex > lastCloseIndex) {
          this.calculator.input = input.substring(0, lastOpenIndex + 1)
        } else {
          const res = super.handleClearEntry()
          this.parenthesesTracker.sync(this.calculator.input)
          return res
        }
      } else {
        this.calculator.input = '0'
        this.resetParentheses()
      }

      this.parenthesesTracker.sync(this.calculator.input)
      return this.createResponse()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Clear entry failed'))
    }
  }

  /**
   * Handle numeric input - delegates to StandardOperations
   * StandardOperations already handles numbers, decimals, and comma properly
   */
  handleNumber(num: string): CalculatorResult {
    const res = super.handleNumber(num)
    this.parenthesesTracker.sync(this.calculator.input)
    return res
  }

  /**
   * Handle arithmetic operators - delegates to StandardOperations
   * StandardOperations already handles +, -, ×, ÷ properly
   */
  handleOperator(op: string): CalculatorResult {
    const res = super.handleOperator(op)
    this.parenthesesTracker.sync(this.calculator.input)
    return res
  }

  /**
   * Handle percentage - delegates to StandardOperations
   */
  handlePercentage(): CalculatorResult {
    const res = super.handlePercentage()
    this.parenthesesTracker.sync(this.calculator.input)
    return res
  }

  /**
   * Handle sign toggle - delegates to StandardOperations
   */
  handleToggleSign(): CalculatorResult {
    const res = super.handleToggleSign()
    this.parenthesesTracker.sync(this.calculator.input)
    return res
  }

  /**
   * Handle comma for function arguments - delegates to StandardOperations
   */
  handleComma(): CalculatorResult {
    return super.handleComma()
  }

  /**
   * Get the current count of unclosed parentheses
   */
  getParenthesesCount(): number {
    return this.parenthesesTracker.getOpenCount()
  }

  /**
   * Reset parentheses tracker
   */
  resetParentheses(): void {
    this.parenthesesTracker.reset()
  }

  /**
   * Create a standardized response
   * Uses the same format as StandardOperations for consistency
   */
  createResponse(error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    })
  }
}