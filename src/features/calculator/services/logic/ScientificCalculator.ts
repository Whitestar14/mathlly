import { ICalculator } from "@calculator/utils/core/ICalculator.ts";
import { ScientificOperations } from "@calculator/utils/operations/ScientificOperations.ts";
import { ScientificCalculations } from '@calculator/utils/calculations/ScientificCalculations';
import { CalculatorConstants } from "@calculator/utils/constants/CalculatorConstants.ts";
import { CalculatorUtils } from '@calculator/utils/constants/CalculatorUtils';

/**
 * Calculator implementation for scientific mode
 * * @class ScientificCalculator
 * @extends ICalculator
 */
export class ScientificCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number;
  calculations: ScientificCalculations;
  operations: ScientificOperations;

  /**
   * Create a new scientific calculator
   */
  constructor() {
    super();
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.SCIENTIFIC;
    
    // Use composition for calculations and operations - pass this calculator instance
    this.calculations = new ScientificCalculations(this);
    this.operations = new ScientificOperations(this);
  }

  /**
   * Format a result for display
   * * @param {*} result - Result to format
   * @returns {string} Formatted result
   */
  formatResult(result: any): string {
    return this.calculations.formatResult(result);
  }

  /**
   * Evaluate expression with scientific functions
   */
  evaluateExpression(expr: string): any {
    try {
      const result = this.calculations.evaluateExpression(expr);
      return result;
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION));
    }
  }

  /**
   * Handle equals operation
   * Enhanced to properly handle factorial and complex expressions
   */
  handleEquals(): Record<string, any> {
    try {
      // Get parentheses count from operations
      const openCount = this.operations.getParenthesesCount();
      
      // Add missing closing parentheses if needed
      const finalExpr = openCount > 0 ? this.input + ")".repeat(openCount) : this.input;
      
      this.currentExpression = finalExpr;
      
      // Evaluate the expression - this should handle factorial natively
      const result = this.evaluateExpression(finalExpr);
      
      // Format the result for display
      const formattedResult = this.formatResult(result);
      
      this.input = formattedResult;
      
      // Reset parentheses tracker in operations
      this.operations.resetParentheses();
      
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
   * Process button input and route to appropriate handler
   */
  processButton(btn: string): Record<string, any> {
    try {
      this.error = '';

      // Handle parentheses using REGEX
      if (CalculatorConstants.REGEX.PARENTHESIS.test(btn)) {
        return this.operations.handleParenthesis(btn);
      }

      // Handle scientific constants using REGEX
      if (CalculatorConstants.REGEX.CONSTANT.test(btn)) {
        return this.operations.handleConstant(btn);
      }

      // Handle equals
      if (btn === '=') {
        return this.handleEquals();
      }

      // Handle backspace
      if (btn === 'backspace') {
        return this.operations.handleBackspace();
      }

      if (CalculatorConstants.BUTTON_TYPES.SCIENTIFIC_FUNCTIONS.includes(btn as any) || 
          Object.keys(CalculatorConstants.FUNCTION_MAPPINGS).includes(btn)) {
        return this.operations.handleScientificFunction(btn);
      }

      // Handle basic operators using BUTTON_TYPES
      if (CalculatorConstants.BUTTON_TYPES.OPERATORS.includes(btn as any)) {
        return this.operations.handleOperator(btn);
      }

      // Handle percentage
      if (btn === '%') {
        return this.operations.handlePercentage();
      }

      // Handle sign toggle
      if (btn === '±') {
        return this.operations.handleToggleSign();
      }

      // Handle comma for function arguments
      if (btn === ',') {
        return this.operations.handleComma();
      }

      // Default to number handling - validate using REGEX
      if (CalculatorConstants.REGEX.NUMBER.test(btn)) {
        return this.operations.handleNumber(btn);
      }

      // Log unexpected inputs
      console.warn(`Unexpected button input in ScientificCalculator: "${btn}"`);
      return { input: this.input, error: this.error };
    } catch (err) {
      return this.createErrorResponse(err as Error);
    }
  }

  /**
   * Handle button click - main entry point.
   * This method now delegates to other functions for specific logic.
   */
  handleButtonClick(btn: string): Record<string, any> {
    // Handle memory and clear operations directly
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

  /**
   * Handle clear operation
   */
  handleClear(): Record<string, any> {
    super.handleClear();
    this.operations.resetParentheses();
    return {
      input: this.input,
      error: this.error
    };
  }
}
