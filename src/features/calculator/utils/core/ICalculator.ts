import { useCalculatorOptions } from '@calculator/composables/useCalculatorOptions';
import { ExpressionEvaluator } from '@calculator/utils/core/ExpressionEvaluator';
import { CalculatorConstants } from '../constants/CalculatorConstants';
import { CalculatorUtils } from '../constants/CalculatorUtils';
import { CalculatorResult } from '@features/calculator/composables/MainCalculator';
import { ICalculatorCore } from '@features/calculator/services/factory/CalculatorFactory';

/**
 * Interface for calculator implementations.
 * All calculator types should implement these methods.
 */
export abstract class ICalculator implements ICalculatorCore {
  input: string;
  error: string;
  currentExpression: string;
  activeBase: string;
  evaluator: ExpressionEvaluator;
  operations: any;
  calculations: any;
  MAX_INPUT_LENGTH: number;
  calculatorOptions: ReturnType<typeof useCalculatorOptions>

  /**
   * Create a calculator instance
   */
  constructor() {
    this.input = '0';
    this.error = '';
    this.currentExpression = '';
    this.activeBase = 'DEC';

    // Use shared evaluator instance
    this.evaluator = ExpressionEvaluator.getInstance();

    // Operations will be injected by derived classes
    this.operations = null;
    this.calculations = null;
    this.MAX_INPUT_LENGTH = 50;
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
    );

    // Update calculator state
    this.error = errorMessage;
    this.input = fallbackInput;

    // Return standardized error response
    return {
      input: this.input,
      error: this.error,
      expression: this.currentExpression,
    };
  }

  /**
   * Normalizes operation results to a standard response format
   */
  normalizeResponse(result: any): CalculatorResult {
    // Handle null or undefined result
    if (!result) {
      return this.createErrorResponse('Invalid operation result');
    }

    // Use CalculatorUtils.createResponse for standardized response format
    return CalculatorUtils.createResponse({
      input: result.input ?? this.input,
      error: result.error ?? '',
      expression: result.expression ?? this.currentExpression,
      displayValues: result.displayValues ?? undefined,
      result: result.result,
    });
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
      });
    } catch (err) {
      throw new Error(
        CalculatorUtils.formatError(err as Error, 'Invalid expression')
      );
    }
  }

  /**
   * Format a result for display
   */
  formatResult(result: any, base?: string): string {
    void result;
    void base;
    throw new Error('formatResult must be implemented in derived class');
  }

  /**
   * Process button input and route to appropriate handler
   */
  processButton(btn: string): CalculatorResult {
    try {
      this.error = '';

      // Handle basic calculator operations
      switch (btn) {
        // Equals operation
        case '=':
          return this.handleEquals();

        // Clear operations
        case 'AC':
          return this.handleClear();

        // Delete operation
        case 'backspace':
          return this.handleBackspace();

        // Basic arithmetic operators
        case '+':
        case '-':
        case '×':
        case '÷':
          return this.handleOperator(btn);
        // Default case - handle as number or other input
        default:
          return this.handleNumber(btn);
      }
    } catch (err) {
      return this.createErrorResponse(err as Error);
    }
  }

  /**
   * Handle button click - main entry point for button processing
   */
  handleButtonClick(btn: string): CalculatorResult {
    // Check for error state first
    if (this.input === 'Error' && !['AC', 'CE'].includes(btn)) {
      this.handleClear();
    }

    // Check input length
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error('Maximum input length reached'),
        this.input
      );
    }

    try {
      // Use the standardized processButton method
      return this.normalizeResponse(this.processButton(btn));
    } catch (err) {
      return this.createErrorResponse(err as Error);
    }
  }

  /**
   * Handle equals operation
   */
  handleEquals(): CalculatorResult {
    throw new Error('handleEquals must be implemented in derived class');
  }

  /**
   * Handle operator input
   */
  handleOperator(operator: string): CalculatorResult {
    void operator;
    throw new Error('handleOperator must be implemented in derived class');
  }

  /**
   * Handle number input
   */
  handleNumber(num: string): CalculatorResult {
    void num;
    throw new Error('handleNumber must be implemented in derived class');
  }

  /**
   * Handle backspace operation
   */
  handleBackspace(): CalculatorResult {
    throw new Error('handleBackspace must be implemented in derived class');
  }

  /**
   * Clear calculator state
   */
  handleClear(): CalculatorResult {
    this.input = '0';
    this.error = '';
    this.currentExpression = '';
    return {
      input: this.input,
      error: this.error,
    };
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
    ];

    if (excludedButtons.includes(btn)) {
      return false;
    }

    const newLength = this.input.length + btn.length;
    const maxLength = (this as any).MAX_INPUT_LENGTH;

    return newLength > maxLength;
  }
}
