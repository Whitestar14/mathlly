import { ICalculator } from "@/utils/core/ICalculator.ts";
import { StandardOperations } from "@/utils/operations/StandardOperations.ts";
import { StandardCalculations } from "@/utils/calculations/StandardCalculations.ts";
import { CalculatorConstants } from "@/utils/constants/CalculatorConstants.ts";

/**
 * Calculator implementation for standard mode
 * 
 * @class StandardCalculator
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
    // Use composition for calculations and operations - pass this calculator instance
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
  handleEquals(): Record<string, any> {
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
   * Handle operator input (delegates to operations)
   * @param {string} op - Operator symbol
   * @returns {Object} Updated state
   */
  handleOperator(op: string): Record<string, any> {
    return this.normalizeResponse(this.operations.handleOperator(op));
  }

  /**
   * Handle number input (delegates to operations)
   * @param {string} num - Number or digit
   * @returns {Object} Updated state
   */
  handleNumber(num: string): Record<string, any> {
    return this.normalizeResponse(this.operations.handleNumber(num));
  }

  /**
   * Handle backspace operation (delegates to operations)
   * @returns {Object} Updated state
   */
  handleBackspace(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleBackspace());
  }

  /**
   * Handle square operation (delegates to operations)
   * @returns {Object} Updated state
   */
  handleSquare(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleSquare());
  }

  /**
   * Handle square root operation (delegates to operations)
   * @returns {Object} Updated state
   */
  handleSquareRoot(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleSquareRoot());
  }

  /**
   * Handle reciprocal operation (delegates to operations)
   * @returns {Object} Updated state
   */
  handleReciprocal(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleReciprocal());
  }

  /**
   * Handle percentage operation (delegates to operations)
   * @returns {Object} Updated state
   */
  handlePercentage(): Record<string, any> {
    return this.normalizeResponse(this.operations.handlePercentage());
  }

  /**
   * Handle sign toggle operation (delegates to operations)
   * @returns {Object} Updated state
   */
  handleToggleSign(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleToggleSign());
  }
}
