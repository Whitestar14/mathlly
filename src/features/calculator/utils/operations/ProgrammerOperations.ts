import { ParenthesesTracker } from "../core/ParenthesesTracker.ts";
import { CalculatorConstants } from "../constants/CalculatorConstants.ts";
import { CalculatorUtils } from '../constants/CalculatorUtils';

/** 
 * Handles operations for the programmer calculator mode 
 */
export class ProgrammerOperations {
  calculator: any;
  parenthesesTracker: ParenthesesTracker;

  constructor(calculator: any) {
    this.calculator = calculator;
    this.parenthesesTracker = new ParenthesesTracker();
  }

  // --- Helper methods ---
  isLastCharOperator(): boolean {
    const input = this.calculator.states[this.calculator.activeBase].input.trim();
    return CalculatorUtils.endsWithOperator(input) ||
           (/-$/.test(input) && !/-\d+$/.test(input)) ||
           input.endsWith(" << ") ||
           input.endsWith(" >> ") ||
           input.endsWith(" % ");
  }

  isLastCharNumber(): boolean {
    return CalculatorConstants.REGEX.NUMBER.test(
      this.calculator.states[this.calculator.activeBase].input.slice(-1)
    );
  }

  isLastCharClosingParenthesis(): boolean {
    return this.calculator.states[this.calculator.activeBase].input.trim().endsWith(")");
  }

  createResponse(input: string, error?: string): Record<string, any> {
    return CalculatorUtils.createResponse({
      input: input,
      error: error,
      expression: this.calculator.currentExpression
    });
  }

  createErrorResponse(err: any): Record<string, any> {
    console.error('[ProgrammerOperations] Error:', err);
    return {
      input: this.calculator.states[this.calculator.activeBase].input,
      error: CalculatorUtils.formatError(err, "Operation error"),
      expression: this.calculator.currentExpression
    };
  }

  handleNumber(num: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      
      if (currentInput === "0" || currentInput === "Error") {
        state.input = num;
      } else if (this.isLastCharClosingParenthesis()) {
        state.input += ` × ${num}`;
      } else {
        state.input += num;
      }
      
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Parse the current operator state of the input
   * @param {string} input - Current input to parse
   * @returns {Object} Parsed state information
   */
  private parseOperatorState(input: string): {
    baseExpression: string;
    lastOperator: string | null;
    hasNegative: boolean;
    canAddNegative: boolean;
    hasShiftOperator: boolean;
  } {
    // Match patterns like "8 + ", "8 × - ", "8 << ", "8 >> ", etc.
    const operatorPattern = /^(.*?)\s*([+\-×÷%]|<<|>>|&|\||\^|~)\s*(-\s*)?$/;
    const match = input.match(operatorPattern);
    
    if (!match) {
      // No operators at the end
      return {
        baseExpression: input,
        lastOperator: null,
        hasNegative: false,
        canAddNegative: false,
        hasShiftOperator: false
      };
    }
    
    const [, baseExpression, lastOperator, negativeSign] = match;
    const hasNegative = !!negativeSign;
    const isShiftOperator = ['<<', '>>', '&', '|', '^', '~'].includes(lastOperator);
    const canAddNegative = !hasNegative && !isShiftOperator && ['×', '÷', '+', '%'].includes(lastOperator);
    
    return {
      baseExpression,
      lastOperator,
      hasNegative,
      canAddNegative,
      hasShiftOperator: isShiftOperator
    };
  }

  /**
   * Type guard to check if a string is a programmer operator
   */
    private isProgrammerOperator(op: string): op is typeof CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS[number] {
    return (CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS as readonly string[]).includes(op);
  }


handleOperator(op: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      
      // Don't allow operators on empty input
      if (currentInput === "" && op !== "-") {
        return this.createResponse(state.input);
      }
      
      // Parse the current state
      const operatorState = this.parseOperatorState(currentInput);
      
      // Handle programmer-specific operators
      if (this.isProgrammerOperator(op)) {
        return this.handleShiftOperator(op, operatorState);
      }
      
      return this.handleBasicOperator(op, operatorState);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleShiftOperator(op: string, state?: any): Record<string, any> {
    try {
      const calculatorState = this.calculator.states[this.calculator.activeBase];
      const currentInput = calculatorState.input.trim();
      
      if (!currentInput || currentInput === "Error") {
        return this.createErrorResponse(new Error(CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION));
      }
      
      if (currentInput.endsWith("(")) {
        return this.createResponse(calculatorState.input);
      }
      
      // Use the parsed state if provided, otherwise parse it
      const operatorState = state || this.parseOperatorState(currentInput);
      
      // Don't allow shift operators after negative signs or other shift operators
      if (operatorState.hasNegative || operatorState.hasShiftOperator) {
        return this.createResponse(calculatorState.input);
      }
      
      // Replace any existing operator with the shift operator
      calculatorState.input = `${operatorState.baseExpression} ${op} `;
      
      return this.createResponse(calculatorState.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleBasicOperator(op: string, state?: any): Record<string, any> {
    try {
      const calculatorState = this.calculator.states[this.calculator.activeBase];
      const currentInput = calculatorState.input.trim();
      
      // Use the parsed state if provided, otherwise parse it
      const operatorState = state || this.parseOperatorState(currentInput);
      
      // Special case: allow minus after certain operators for negative numbers
      if (op === "-" && operatorState.canAddNegative) {
        calculatorState.input = `${operatorState.baseExpression} ${operatorState.lastOperator} ${op} `;
      } else {
        // Replace any existing operator sequence with the new operator
        calculatorState.input = `${operatorState.baseExpression} ${op} `;
      }
      
      return this.createResponse(calculatorState.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleParenthesis(parenthesis: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      const position = currentInput.length;
      
      if (parenthesis === "(") {
        this.handleOpenParenthesis(currentInput, position);
      } else if (parenthesis === ")" && this.canCloseParenthesis(currentInput)) {
        this.handleCloseParenthesis(currentInput, position);
      }
      
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  canCloseParenthesis(expr: string): boolean {
    if (this.parenthesesTracker.getOpenCount() <= 0) return false;
    if (!expr.trim()) return false;
    
    const lastOpenIndex = expr.lastIndexOf("(");
    if (lastOpenIndex === -1) return false;
    
    const contentAfterOpen = expr.slice(lastOpenIndex + 1).trim();
    if (!contentAfterOpen) return false;
    
    const lastContent = contentAfterOpen.trim();
    if (lastContent.endsWith('<<') || lastContent.endsWith('>>')) return false;
    
    const lastChar = expr.trim().slice(-1);
    return /[0-9A-Fa-f)]/.test(lastChar);
  }

  handleOpenParenthesis(currentInput: string, position: number): void {
    const state = this.calculator.states[this.calculator.activeBase];
    
    if (currentInput === "0" || currentInput === "Error") {
      state.input = "(";
      this.parenthesesTracker.open(position);
    } else {
      const lastChar = currentInput.slice(-1);
      const needsMultiplication = /[0-9A-Fa-f)]/.test(lastChar);
      const newInput = `${currentInput}${needsMultiplication ? " × " : " "}(`;
      state.input = newInput;
      this.parenthesesTracker.open(position + (needsMultiplication ? 3 : 1));
    }
  }

  handleCloseParenthesis(currentInput: string, position: number): void {
    this.calculator.states[this.calculator.activeBase].input = `${currentInput})`;
    this.parenthesesTracker.close(position);
  }

  handleBackspace(): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      
      if (currentInput === "0" || currentInput === "Error") {
        return this.createResponse(state.input);
      }
      
      const beforeBackspace = currentInput;
      
      if (this.handleSpecialBackspace(currentInput)) {
        return this.createResponse(state.input);
      }
      
      this.handleDefaultBackspace(currentInput);
      
      if (state.input === beforeBackspace) {
        console.debug('[ProgrammerOperations] Backspace had no effect');
      }
      
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleSpecialBackspace(currentInput: string): boolean {
    const state = this.calculator.states[this.calculator.activeBase];
    
    // Handle shift operators
    if (currentInput.match(/\s*[<>]{2}\s*$/)) {
      state.input = currentInput.replace(/\s*[<>]{2}\s*$/, '');
      return true;
    }
    
    // Handle regular operators
    if (CalculatorUtils.endsWithOperator(currentInput)) {
      state.input = CalculatorUtils.removeLastOperator(currentInput);
      return true;
    }
    
    return false;
  }

  handleDefaultBackspace(currentInput: string): void {
    const state = this.calculator.states[this.calculator.activeBase];
    
    if (currentInput.length === 1) {
      state.input = "0";
    } else {
      state.input = currentInput.trimEnd().slice(0, -1);
    }
  }

  handleToggleSign(): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      
      if (currentInput !== "0" && currentInput !== "Error") {
        const parts = CalculatorUtils.splitExpression(currentInput);
        const lastPart = parts[parts.length - 1].trim();
        
        if (lastPart) {
          if (lastPart.startsWith("-")) {
            parts[parts.length - 1] = lastPart.slice(1);
          } else {
            parts[parts.length - 1] = "-" + lastPart;
          }
          state.input = parts.join(" ").trim();
        }
      }
      
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleModuloSign(): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      
      if (!currentInput || currentInput === "0" || currentInput === "Error") {
        return this.createResponse(state.input);
      }
      
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }
      
      // Parse the current state to handle operator replacement properly
      const operatorState = this.parseOperatorState(currentInput);
      
      if (this.isLastCharClosingParenthesis() || this.isLastCharNumber()) {
        state.input = `${operatorState.baseExpression} % `;
      } else {
        // Replace any existing operator with modulo
        state.input = `${operatorState.baseExpression} % `;
      }
      
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  getParenthesesCount(): number {
    return this.parenthesesTracker.getOpenCount();
  }

  resetParentheses(): void {
    this.parenthesesTracker = new ParenthesesTracker();
  }
}
