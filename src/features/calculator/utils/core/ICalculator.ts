import { useCalculatorOptions } from '@calculator/composables/useCalculatorOptions'
import { ExpressionEvaluator } from '@calculator/utils/core/ExpressionEvaluator'
import { CalculatorConstants } from '../constants/CalculatorConstants'
import { CalculatorUtils } from '../constants/CalculatorUtils'

export interface CalculatorResult {
  input: string
  error?: string
  result?: string
  expression?: string
  displayValues?: Record<string, any>
}

export interface ICalculatorCore {
  input: string
  error: string
  currentExpression: string
  activeBase: string
  MAX_INPUT_LENGTH: number
  calculatorOptions: ReturnType<typeof useCalculatorOptions>
  evaluator: ExpressionEvaluator
  operations: any
  calculations: any
  handleButtonClick(button: string): CalculatorResult
  evaluateExpression(expression: string, base?: string): any
  formatResult(result: any, base?: string): string
  handleEquals(): CalculatorResult
  handleClear(): CalculatorResult
  processButton(btn: string): CalculatorResult
  createErrorResponse(error: Error | string, fallbackInput?: string): CalculatorResult
  normalizeResponse(result: any): CalculatorResult
  isInputTooLong(btn: string): boolean
}

/**
 * Interface for calculator implementations.
 * All calculator types should implement these methods.
 */
export abstract class ICalculator implements ICalculatorCore {
  input: string
  error: string
  currentExpression: string
  activeBase: string
  evaluator: ExpressionEvaluator
  operations: any
  calculations: any
  MAX_INPUT_LENGTH: number
  calculatorOptions: ReturnType<typeof useCalculatorOptions>

  /**
   * Create a calculator instance
   */
  constructor() {
    this.input = '0'
    this.error = ''
    this.currentExpression = ''
    this.activeBase = 'DEC'

    this.evaluator = ExpressionEvaluator.getInstance()

    this.operations = null
    this.calculations = null
    this.MAX_INPUT_LENGTH = 50
    this.calculatorOptions = useCalculatorOptions()
  }

  /**
   * Creates a standardized error response object
   */
  createErrorResponse(
    error: Error | string,
    fallbackInput: string = 'Error'
  ): CalculatorResult {
    const errorMessage = CalculatorUtils.formatError(
      error instanceof Error ? error : new Error(error || 'Operation failed')
    )

    this.error = errorMessage
    this.input = fallbackInput

    return {
      input: this.input,
      error: this.error,
      expression: this.currentExpression
    }
  }

  /**
   * Normalizes operation results to a standard response format
   */
  normalizeResponse(result: any): CalculatorResult {
    if (!result) {
      return this.createErrorResponse('Invalid operation result')
    }

    return CalculatorUtils.createResponse({
      input: result.input ?? this.input,
      error: result.error ?? '',
      expression: result.expression ?? this.currentExpression,
      displayValues: result.displayValues ?? undefined,
      result: result.result
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
        minValue: CalculatorConstants.MIN_VALUE
      })
    } catch(err) {
      throw new Error(
        CalculatorUtils.formatError(err as Error, 'Invalid expression')
      )
    }
  }

  /**
   * Format a result for display
   */
  formatResult(result: any, base?: string): string {
    void result
    void base
    throw new Error('formatResult must be implemented in derived class')
  }

  /**
   * Process button input and route to appropriate handler
   */
  processButton(btn: string): CalculatorResult {
    try {
      this.error = ''

      switch (btn) {
        case '=':
          return this.handleEquals()

        case 'AC':
          return this.handleClear()

        case 'backspace':
          return this.handleBackspace()

        case '+':
        case '-':
        case '×':
        case '÷':
          return this.handleOperator(btn)

        default:
          return this.handleNumber(btn)
      }
    } catch(err) {
      return this.createErrorResponse(err as Error)
    }
  }

  /**
   * Handle button click - main entry point for button processing
   */
  handleButtonClick(btn: string): CalculatorResult {
    if (this.input === 'Error' && !['AC', 'CE'].includes(btn)) {
      this.handleClear()
    }

    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error('Maximum input length reached'),
        this.input
      )
    }

    try {
      return this.normalizeResponse(this.processButton(btn))
    } catch(err) {
      return this.createErrorResponse(err as Error)
    }
  }

  /**
   * Handle equals operation
   */
  handleEquals(): CalculatorResult {
    throw new Error('handleEquals must be implemented in derived class')
  }

  /**
   * Handle operator input
   */
  handleOperator(operator: string): CalculatorResult {
    void operator
    throw new Error('handleOperator must be implemented in derived class')
  }

  /**
   * Handle number input
   */
  handleNumber(num: string): CalculatorResult {
    void num
    throw new Error('handleNumber must be implemented in derived class')
  }

  /**
   * Handle backspace operation
   */
  handleBackspace(): CalculatorResult {
    throw new Error('handleBackspace must be implemented in derived class')
  }

  /**
   * Clear calculator state
   */
  handleClear(): CalculatorResult {
    this.input = '0'
    this.error = ''
    this.currentExpression = ''
    return {
      input: this.input,
      error: this.error
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
      'CE'
    ]

    if (excludedButtons.includes(btn)) {
      return false
    }

    const newLength = this.input.length + btn.length
    const maxLength = (this as any).MAX_INPUT_LENGTH

    return newLength > maxLength
  }
}
