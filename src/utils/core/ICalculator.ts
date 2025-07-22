import { useCalculatorOptions } from '@/composables/useCalculatorOptions'
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator'
import {
  CalculatorConstants,
} from '@/utils/constants/CalculatorConstants'
import { CalculatorUtils } from '../constants/CalculatorUtils'
import type { CalculatorOptions } from '@/composables/useCalculatorOptions'

/**
 * Interface for calculator implementations.
 * All calculator types should implement these methods.
 */
export class ICalculator {
  calculatorOptions: ReturnType<typeof useCalculatorOptions>
  options: CalculatorOptions
  input: string
  error: string
  currentExpression: string
  activeBase: string
  evaluator: ExpressionEvaluator
  operations: any
  calculations: any

  /**
   * Create a calculator instance
   */
  constructor() {
    // Use calculator options composable
    this.calculatorOptions = useCalculatorOptions()
    this.options = this.calculatorOptions.options.value
    this.input = '0'
    this.error = ''
    this.currentExpression = ''
    this.activeBase = 'DEC'

    // Use shared evaluator instance
    this.evaluator = ExpressionEvaluator.getInstance()

    // Operations will be injected by derived classes
    this.operations = null
    this.calculations = null
  }

  /**
   * Creates a standardized error response object
   */
  createErrorResponse(error: Error | string, fallbackInput: string = 'Error'): Record<string, any> {
    // Use CalculatorUtils.formatError for consistent error handling
    const errorMessage = CalculatorUtils.formatError(
      error instanceof Error ? error : new Error(error || 'Operation failed')
    )

    // Update calculator state
    this.error = errorMessage
    this.input = fallbackInput

    // Return standardized error response
    return {
      input: this.input,
      error: this.error,
      expression: this.currentExpression,
      success: false,
    }
  }

  /**
   * Normalizes operation results to a standard response format
   */
  normalizeResponse(result: any): Record<string, any> {
    // Handle null or undefined result
    if (!result) {
      return this.createErrorResponse('Invalid operation result')
    }

    // Use CalculatorUtils.createResponse for standardized response format
    return CalculatorUtils.createResponse({
      input: result.input ?? this.input,
      error: result.error ?? '',
      expression: result.expression ?? this.currentExpression,
      displayValues: result.displayValues ?? undefined,
      result: result.result,
    })
  }

  /**
   * Evaluate a mathematical expression
   */
  evaluateExpression(expr: string, base?: string): any {
    try {
      return this.evaluator.evaluate(expr, {
        base,
        maxValue: CalculatorConstants.MAX_VALUE,
        minValue: CalculatorConstants.MIN_VALUE,
      })
    } catch (err) {
      throw new Error(CalculatorUtils.formatError(err as Error, 'Invalid expression'))
    }
  }

  /**
   * Format a result for display
   */
  formatResult(result: any, base?: string): string {
    void result;
    void base;
    throw new Error('formatResult must be implemented in derived class')
  }

  /**
   * Process button input and route to appropriate handler
   */
  processButton(btn: string): Record<string, any> {
    try {
      this.error = ''

      // Handle basic calculator operations
      switch (btn) {
        // Equals operation
        case '=':
          return this.handleEquals()

        // Clear operations
        case 'AC':
          return this.handleClear()
        case 'CE':
          return this.handleClearEntry
            ? this.handleClearEntry()
            : this.handleClear()

        // Delete operation
        case 'backspace':
          return this.handleBackspace()

        // Basic arithmetic operators
        case '+':
        case '-':
        case '×':
        case '÷':
          return this.handleOperator(btn)

        // Scientific operations
        case 'x²':
          return this.handleSquare
            ? this.handleSquare()
            : this.createErrorResponse(new Error('Operation not supported'))
        case 'x³':
          return this.handleCube
            ? this.handleCube()
            : this.createErrorResponse(new Error('Operation not supported'))
        case '√':
          return this.handleSquareRoot
            ? this.handleSquareRoot()
            : this.createErrorResponse(new Error('Operation not supported'))
        case '∛':
          return this.handleCubeRoot
            ? this.handleCubeRoot()
            : this.createErrorResponse(new Error('Operation not supported'))
        case '1/x':
          return this.handleReciprocal
            ? this.handleReciprocal()
            : this.createErrorResponse(new Error('Operation not supported'))
        case '%':
          return this.handlePercentage
            ? this.handlePercentage()
            : this.createErrorResponse(new Error('Operation not supported'))
        case '±':
          return this.handleToggleSign
            ? this.handleToggleSign()
            : this.createErrorResponse(new Error('Operation not supported'))
        // Default case - handle as number or other input
        default:
          return this.handleNumber(btn)
      }
    } catch (err) {
      return this.createErrorResponse(err as Error)
    }
  }

  /**
   * Handle button click - main entry point for button processing
   */
  handleButtonClick(btn: string): Record<string, any> {
    // Check for error state first
    if (this.input === 'Error' && !['AC', 'CE'].includes(btn)) {
      this.handleClear()
    }

    // Check input length
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error('Maximum input length reached'),
        this.input
      )
    }

    try {
      // Use the standardized processButton method
      return this.normalizeResponse(this.processButton(btn))
    } catch (err) {
      return this.createErrorResponse(err as Error)
    }
  }

  /**
   * Handle equals operation
   */
  handleEquals(): Record<string, any> {
    throw new Error('handleEquals must be implemented in derived class')
  }

  /**
   * Handle operator input
   */
  handleOperator(operator: string): Record<string, any> {
    void operator;
    throw new Error('handleOperator must be implemented in derived class')
  }

  /**
   * Handle number input
   */
  handleNumber(num: string): Record<string, any> {
    void num;
    throw new Error('handleNumber must be implemented in derived class')
  }

  /**
   * Handle backspace operation
   */
  handleBackspace(): Record<string, any> {
    throw new Error('handleBackspace must be implemented in derived class')
  }

  /**
   * Handle clear entry operation - may be implemented by derived classes
   */
  handleClearEntry?(): Record<string, any>

  /**
   * Handle square operation - may be implemented by derived classes
   */
  handleSquare?(): Record<string, any>

  /**
   * Handle cube operation - may be implemented by derived classes
   */
  handleCube?(): Record<string, any>

  /**
   * Handle square root operation - may be implemented by derived classes
   */
  handleSquareRoot?(): Record<string, any>

  /**
   * Handle cube root operation - may be implemented by derived classes
   */
  handleCubeRoot?(): Record<string, any>

  /**
   * Handle reciprocal operation - may be implemented by derived classes
   */
  handleReciprocal?(): Record<string, any>

  /**
   * Handle percentage operation - may be implemented by derived classes
   */
  handlePercentage?(): Record<string, any>

  /**
   * Handle sign toggle operation - may be implemented by derived classes
   */
  handleToggleSign?(): Record<string, any>

  /**
   * Clear calculator state
   */
  handleClear(): Record<string, any> {
    this.input = '0'
    this.error = ''
    this.currentExpression = ''
    return {
      input: this.input,
      error: this.error,
    }
  }

  /**
   * Check if input is too long
   */
  isInputTooLong(btn: string): boolean {
    const excludedButtons = [
      '=',
      'AC',
      'backspace',
      ...CalculatorConstants.BUTTON_TYPES.MEMORY,
      'CE',
    ]
    return (
      this.input.length >= (this as any).MAX_INPUT_LENGTH &&
      !excludedButtons.includes(btn)
    )
  }
}
