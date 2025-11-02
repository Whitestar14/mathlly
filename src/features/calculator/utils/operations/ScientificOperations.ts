import { StandardOperations } from "../operations/StandardOperations.ts"
import { ParenthesesTracker } from "../core/ParenthesesTracker.ts"
import { CalculatorUtils } from '../constants/CalculatorUtils'
import { ScientificFunctionHandler } from './handlers/ScientificFunctionHandler'
import { ScientificConstantHandler } from './handlers/ScientificConstantHandler'
import { ScientificParenthesesHandler } from './handlers/ScientificParenthesesHandler'
import { CalculatorResult } from "@features/calculator/services/factory/CalculatorFactory.ts"

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
    
    // Initialize specialized handlers for scientific operations
    this.functionHandler = new ScientificFunctionHandler(calculator, this.parenthesesTracker)
    this.constantHandler = new ScientificConstantHandler(calculator)
    this.parenthesesHandler = new ScientificParenthesesHandler(calculator, this.parenthesesTracker)
  }

  // ===== SCIENTIFIC-SPECIFIC OPERATIONS =====
  // These are the operations that make scientific mode different from standard mode

  /**
   * Handle scientific function operations (sin, cos, log, sqrt, etc.)
   * Delegates to specialized function handler
   */
  handleScientificFunction(func: string): CalculatorResult {
    try {
      return this.functionHandler.handle(func)
    } catch (err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, "Scientific function failed"));
    }
  }

  /**
   * Handle constant input (π, e)
   * Delegates to specialized constant handler
   */
  handleConstant(constant: string): CalculatorResult {
    try {
      return this.constantHandler.handle(constant)
    } catch (err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, "Constant input failed"));
    }
  }

  /**
   * Handle parenthesis operations with scientific expression tracking
   * Delegates to specialized parentheses handler
   */
  handleParenthesis(parenthesis: string): CalculatorResult {
    try {
      return this.parenthesesHandler.handle(parenthesis)
    } catch (err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, "Parentheses operation failed"));
    }
  }

  // ===== ENHANCED BASIC OPERATIONS =====
  // These extend StandardOperations with scientific-specific enhancements

  /**
   * Enhanced backspace handling for scientific expressions
   * Extends StandardOperations backspace with scientific-specific logic
   */
  handleBackspace(): CalculatorResult {
    try {
      const currentInput = this.calculator.input;
      
      // Handle basic error states with standard logic
      if (currentInput === "0" || currentInput === "Error") {
        return super.handleBackspace();
      }
      
      // Handle scientific-specific backspace (functions, parentheses tracking)
      const specialBackspace = CalculatorUtils.handleSpecialBackspace(currentInput);
      if (specialBackspace.handled) {
        this.calculator.input = specialBackspace.input;
        
        // Update parentheses tracker if a function was removed
        if (specialBackspace.input.length < currentInput.length - 1) {
          if (this.parenthesesTracker.getOpenCount() > 0) {
            this.parenthesesTracker.close(specialBackspace.input.length);
          }
        }
        
        return this.createResponse();
      }
      
      // Handle parentheses tracking for scientific expressions
      const lastChar = currentInput.slice(-1);
      if (lastChar === '(') {
        if (this.parenthesesTracker.getOpenCount() > 0) {
          this.parenthesesTracker.close(currentInput.length - 1);
        }
      } else if (lastChar === ')') {
        this.parenthesesTracker.open(currentInput.length - 1);
      }
      
      // Delegate to standard backspace for basic functionality
      return super.handleBackspace();
    } catch (err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, "Backspace failed"));
    }
  }

  /**
   * Enhanced clear entry for scientific mode
   * Handles clearing within parentheses and complex expressions
   */
  handleClearEntry(): CalculatorResult {
    try {
      const input = this.calculator.input
      
      if (input !== "0" && input !== "Error") {
        // Find the index of the last opening parenthesis
        const lastOpenIndex = input.lastIndexOf("(");
        // Find the index of the last closing parenthesis
        const lastCloseIndex = input.lastIndexOf(")");
        
        if (lastOpenIndex > lastCloseIndex) {
          // We're inside parentheses. Clear the content back to the opening parenthesis
          this.calculator.input = input.substring(0, lastOpenIndex + 1);
        } else {
          // No open parentheses at the end, so delegate to the standard clear entry logic
          return super.handleClearEntry();
        }
      } else {
        this.calculator.input = "0";
        this.resetParentheses();
      }
      
      return this.createResponse();
    } catch (err: any) {
      return this.createResponse(CalculatorUtils.formatError(err, "Clear entry failed"));
    }
  }

  // ===== BASIC OPERATIONS DELEGATION =====
  // These operations are handled entirely by StandardOperations
  // We don't override them unless we need scientific-specific behavior

  /**
   * Handle numeric input - delegates to StandardOperations
   * StandardOperations already handles numbers, decimals, and comma properly
   */
  handleNumber(num: string): CalculatorResult {
    return super.handleNumber(num);
  }

  /**
   * Handle arithmetic operators - delegates to StandardOperations
   * StandardOperations already handles +, -, ×, ÷ properly
   */
  handleOperator(op: string): CalculatorResult {
    return super.handleOperator(op);
  }

  /**
   * Handle percentage - delegates to StandardOperations
   */
  handlePercentage(): CalculatorResult {
    return super.handlePercentage();
  }

  /**
   * Handle sign toggle - delegates to StandardOperations
   */
  handleToggleSign(): CalculatorResult {
    return super.handleToggleSign();
  }

  /**
   * Handle comma for function arguments - delegates to StandardOperations
   */
  handleComma(): CalculatorResult {
    return super.handleComma();
  }

  // ===== SCIENTIFIC MODE UTILITIES =====
  // These are utilities specific to scientific mode

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
  createResponse(error: string = ""): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: this.calculator.input,
      error: error
    });
  }
}
