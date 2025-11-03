import { StandardOperations } from '../operations/StandardOperations.ts'
import { ParenthesesTracker } from '../core/ParenthesesTracker.ts'
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
  parenthesesTracker: ParenthesesTracker
  private functionHandler: ScientificFunctionHandler
  private constantHandler: ScientificConstantHandler
  private parenthesesHandler: ScientificParenthesesHandler

  /**
   * Creates a new ScientificOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    super(calculator)
    this.parenthesesTracker = new ParenthesesTracker()

    this.functionHandler = new ScientificFunctionHandler(calculator, this.parenthesesTracker)
    this.constantHandler = new ScientificConstantHandler(calculator)
    this.parenthesesHandler = new ScientificParenthesesHandler(calculator, this.parenthesesTracker)
  }

  /**
   * Handle scientific function operations (sin, cos, log, sqrt, etc.)
   * Delegates to specialized function handler
   */
  handleScientificFunction(func: string): CalculatorResult {
    try {
      return this.functionHandler.handle(func)
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
      return this.constantHandler.handle(constant)
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
      return this.parenthesesHandler.handle(parenthesis)
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
        return super.handleBackspace()
      }

      const specialBackspace = CalculatorUtils.handleSpecialBackspace(currentInput)
      if (specialBackspace.handled) {
        this.calculator.input = specialBackspace.input

        if (specialBackspace.input.length < currentInput.length - 1) {
          if (this.parenthesesTracker.getOpenCount() > 0) {
            this.parenthesesTracker.close(specialBackspace.input.length)
          }
        }

        return this.createResponse()
      }

      const lastChar = currentInput.slice(-1)
      if (lastChar === '(') {
        if (this.parenthesesTracker.getOpenCount() > 0) {
          this.parenthesesTracker.close(currentInput.length - 1)
        }
      } else if (lastChar === ')') {
        this.parenthesesTracker.open(currentInput.length - 1)
      }

      return super.handleBackspace()
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
          return super.handleClearEntry()
        }
      } else {
        this.calculator.input = '0'
        this.resetParentheses()
      }

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
    return super.handleNumber(num)
  }

  /**
   * Handle arithmetic operators - delegates to StandardOperations
   * StandardOperations already handles +, -, ×, ÷ properly
   */
  handleOperator(op: string): CalculatorResult {
    return super.handleOperator(op)
  }

  /**
   * Handle percentage - delegates to StandardOperations
   */
  handlePercentage(): CalculatorResult {
    return super.handlePercentage()
  }

  /**
   * Handle sign toggle - delegates to StandardOperations
   */
  handleToggleSign(): CalculatorResult {
    return super.handleToggleSign()
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
    this.parenthesesTracker = new ParenthesesTracker()
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
