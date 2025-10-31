import { ICalculator } from "@calculator/utils/core/ICalculator.ts";
import { StandardOperations } from "@calculator/utils/operations/StandardOperations.ts";
import { StandardCalculations } from "@calculator/utils/calculations/StandardCalculations.ts";
import { CalculatorConstants } from "@calculator/utils/constants/CalculatorConstants.ts";
import { CalculatorResult } from "../factory/CalculatorFactory";

/**
 * Calculator implementation for standard mode
 * * @class StandardCalculator
 * @extends ICalculator
 */
export class StandardCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number;
  calculations: StandardCalculations;
  operations: StandardOperations;

  /**
   * Create a new standard calculator
   */
  constructor() {
    super();
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.STANDARD;
    this.calculations = new StandardCalculations(this);
    this.operations = new StandardOperations(this);
  }

  /**
   * Evaluate a mathematical expression (delegates to calculations)
   * @param {string} expr - Expression to evaluate
   * @param {string} [base] - Number base (not used in standard mode)
   * @returns {number} Evaluated result
   */
  evaluateExpression(expr: string, base?: string): number {
    return this.calculations.evaluateExpression(expr, { base });
  }

  /**
   * Format a result for display (delegates to calculations)
   * @param {number} result - Result to format
   * @param {string} [base] - Number base (not used in standard mode)
   * @returns {string} Formatted result
   */
  formatResult(result: number, base?: string): string {
    void base;
    return this.calculations.formatResult(result);
  }

  /**
   * Handle equals operation
   * @returns {Object} Calculation result
   */
  handleEquals(): CalculatorResult {
    try {
      this.currentExpression = this.input;
      const result = this.evaluateExpression(this.currentExpression);
      this.input = this.formatResult(result);
      return this.normalizeResponse({
        expression: this.currentExpression,
        result: this.input,
        input: this.input
      });
    } catch (err: any) {
      return this.createErrorResponse(err, this.input);
    }
  }

  /**
   * Handle clear operation
   */
  handleClear(): CalculatorResult {
    super.handleClear();
    return {
      input: this.input,
      error: this.error
    };
  }

  /**
   * Process button input and route to appropriate handler.
   * This centralizes the handling logic, making the class more maintainable.
   * @param {string} btn - Button value
   * @returns {Object} Updated state
   */
  processButton(btn: string): CalculatorResult {
    try {
      this.error = '';

      // Handle equals
      if (btn === '=') {
        return this.handleEquals();
      }

      // Handle specific standard functions
      if (btn === 'backspace') {
        return this.operations.handleBackspace();
      }
      if (btn === '±') {
        return this.operations.handleToggleSign();
      }
      if (btn === '%') {
        return this.operations.handlePercentage();
      }
      if (btn === '1/x') {
        return this.operations.handleReciprocal();
      }
      if (btn === 'x²') {
        return this.operations.handleSquare();
      }
      if (btn === '√') {
        return this.operations.handleSquareRoot();
      }

      // Handle basic operators
      if (CalculatorConstants.BUTTON_TYPES.OPERATORS.includes(btn as any)) {
        return this.operations.handleOperator(btn);
      }

      // Handle number input
      if (CalculatorConstants.REGEX.NUMBER.test(btn)) {
        return this.operations.handleNumber(btn);
      }

      // Log unexpected inputs
      console.warn(`Unexpected button input in StandardCalculator: "${btn}"`);
      return { input: this.input, error: this.error };

    } catch (err) {
      return this.createErrorResponse(err as Error);
    }
  }

  /**
   * Main entry point for handling button clicks.
   * This method now delegates to other functions for specific logic.
   * @param {string} btn - Button value
   * @returns {Object} Updated state
   */
  handleButtonClick(btn: string): CalculatorResult {
    if (CalculatorConstants.BUTTON_TYPES.MEMORY.includes(btn as any)) {
      return super.handleButtonClick(btn);
    }

    if (['AC', 'C'].includes(btn)) {
      this.handleClear();
      return { input: this.input, error: this.error };
    }
    
    if (btn === 'CE') {
      return this.operations.handleClearEntry();
    }
    
    // Check for max input length before processing the button
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error(CalculatorConstants.ERROR_MESSAGES.MAX_INPUT_LENGTH),
        this.input
      );
    }
    
    // Process all other buttons
    return this.normalizeResponse(this.processButton(btn));
  }
}
