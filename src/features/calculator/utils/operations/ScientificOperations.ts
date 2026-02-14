import { StandardOperations } from '../operations/StandardOperations.ts'
import { CalculatorUtils } from '../constants/CalculatorUtils'
import { ScientificFunctionHandler } from './handlers/ScientificFunctionHandler'
import { ScientificConstantHandler } from './handlers/ScientificConstantHandler'
import { ScientificParenthesesHandler } from './handlers/ScientificParenthesesHandler'
import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory.ts'

/**
 * Handles scientific calculator operations.
 * Extends StandardOperations to inherit basic expression building and parentheses tracking,
 * adding specialized scientific function handling.
 */
export class ScientificOperations extends StandardOperations {
  private functionHandler: ScientificFunctionHandler
  private constantHandler: ScientificConstantHandler
  private parenthesesHandler: ScientificParenthesesHandler

  /**
   * Creates a new ScientificOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    super(calculator)
    // ParenthesesTracker is initialized in super()

    this.functionHandler = new ScientificFunctionHandler(calculator)
    this.constantHandler = new ScientificConstantHandler(calculator)
    // Pass the inherited tracker to the handler
    this.parenthesesHandler = new ScientificParenthesesHandler(calculator, this.parenthesesTracker)
  }

  /**
   * Handle scientific function operations (sin, cos, log, sqrt, etc.)
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
   * Handle parenthesis operations using the specialized handler
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
   */
  handleBackspace(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        // super.handleBackspace() already syncs the tracker
        return super.handleBackspace()
      }

      const specialBackspace = CalculatorUtils.handleSpecialBackspace(currentInput)
      if (specialBackspace.handled) {
        this.calculator.input = specialBackspace.input
        this.parenthesesTracker.sync(this.calculator.input)
        return this.createResponse()
      }

      // Default backspace (also syncs tracker)
      return super.handleBackspace()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Backspace failed'))
    }
  }

  /**
   * Enhanced clear entry for scientific mode
   */
  handleClearEntry(): CalculatorResult {
    try {
      const input = this.calculator.input

      if (input !== '0' && input !== 'Error') {
        const lastOpenIndex = input.lastIndexOf('(')
        const lastCloseIndex = input.lastIndexOf(')')

        // If inside a function call, clear just that segment
        if (lastOpenIndex > lastCloseIndex) {
          this.calculator.input = input.substring(0, lastOpenIndex + 1)
          this.parenthesesTracker.sync(this.calculator.input)
          return this.createResponse()
        }
      }

      // Fallback to standard clear entry behavior
      return super.handleClearEntry()
    } catch(err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, 'Clear entry failed'))
    }
  }
}
