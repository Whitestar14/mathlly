import { ICalculator } from "@/utils/core/ICalculator.ts";
import { ProgrammerOperations } from "@/utils/operations/ProgrammerOperations.ts";
import { ProgrammerCalculations } from "@/utils/calculations/ProgrammerCalculations.ts";
import { CalculatorConstants, BaseType } from "@/utils/constants/CalculatorConstants.ts";
import { CalculatorUtils } from '@/utils/constants/CalculatorUtils';
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator,
} from "@/utils/core/BaseCalculator";

/**
 * Calculator implementation for programmer mode with multiple base support
 * 
 * @class ProgrammerCalculator
 * @extends ICalculator
 */
export class ProgrammerCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number;
  states: Record<BaseType, { input: string; display: string }>;
  calculators: Record<BaseType, any>;
  calculations: ProgrammerCalculations;
  operations: ProgrammerOperations;

  constructor() {
    super();
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.PROGRAMMER;
    this.states = {
      DEC: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
      HEX: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
    };
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
      HEX: new HexCalculator(),
      OCT: new OctCalculator(),
    };
    this.calculations = new ProgrammerCalculations(this);
    this.operations = new ProgrammerOperations(this);
  }

  get activeCalculator(): any {
    return this.calculators[this.activeBase as BaseType];
  }

  evaluateExpression(expr: string, base: BaseType = this.activeBase as BaseType): any {
    try {
      return this.calculations.evaluateExpression(expr, { base });
    } catch (err: any) {
      console.log('Error evaluating expression:', err.stack);
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  formatResult(result: any, base: BaseType = this.activeBase as BaseType): string {
    return this.calculations.formatResult(result, { base }) || "";
  }

  convertToBase(value: string | number, fromBase: BaseType, toBase: BaseType): string {
    return CalculatorUtils.convertToBase(value, fromBase, toBase) || "0";
  }

  handleButtonClick(btn: string): Record<string, any> {
    if (["backspace", "AC", "CE"].includes(btn)) {
      return this.normalizeResponse(this.processButton(btn));
    }
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error("Maximum input length reached"),
        this.states[this.activeBase as BaseType].input
      );
    }
    try {
      return this.normalizeResponse(this.processButton(btn));
    } catch (err: any) {
      return this.createErrorResponse(err, this.states[this.activeBase as BaseType].input);
    }
  }

  processButton(btn: string): Record<string, any> {
    try {
      this.error = "";
      const isFunctionKey = [
        ...CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS,
        "(", ")", "backspace", "AC", "CE", "±", "%"
      ].includes(btn);
      switch (btn) {
        case "=":
          return this.handleEquals();
        case "AC":
          this.handleClear();
          break;
        case "CE":
          this.handleClearEntry();
          break;
        case "backspace":
          return this.operations.handleBackspace();
        case "±":
          return this.operations.handleToggleSign();
        case "%":
          return this.operations.handleModuloSign();
        case "(":
        case ")":
          return this.operations.handleParenthesis(btn);
        case "<<":
        case ">>":
        case "+":
        case "-":
        case "×":
        case "÷":
          return this.operations.handleOperator(btn);
        default:
          return this.operations.handleNumber(btn);
      }
      if (isFunctionKey) {
        this.updateDisplayValues();
      }
      return {
        input: this.states[this.activeBase as BaseType].input,
        error: this.error,
        expression: this.currentExpression
      };
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleEquals(): Record<string, any> {
    try {
      const expression = this.states[this.activeBase as BaseType].input;
      const openCount = this.operations.getParenthesesCount();
      const finalExpr = openCount > 0 ? expression + " )".repeat(openCount) : expression;
      this.currentExpression = finalExpr;
      const result = this.evaluateExpression(finalExpr);
      if (!result && result !== 0) throw new Error("Invalid expression");
      const formattedResult = this.formatResult(result);
      this.updateAllStates(formattedResult);
      this.operations.resetParentheses();
      return {
        input: this.states[this.activeBase as BaseType].input,
        expression: this.currentExpression,
        result: formattedResult,
        displayValues: { ...this.states }
      };
    } catch (err: any) {
      return this.createErrorResponse(err, this.states[this.activeBase as BaseType].input);
    }
  }

  updateDisplayValues(): Record<BaseType, { input: string; display: string }> {
    try {
      const currentValue = this.evaluateExpression(
        this.states[this.activeBase as BaseType].input,
        this.activeBase as BaseType
      );
      if (currentValue || currentValue === 0) {
        // Use type assertion with proper validation
        (Object.keys(this.states) as BaseType[]).forEach(base => {
          this.states[base].display = this.formatResult(currentValue, base);
        });
      }
      return this.states;
    } catch (err: any) {
      return this.createErrorResponse(err, this.states[this.activeBase as BaseType].input);
    }
  }

  handleBaseChange(newBase: string): Record<string, any> {
    try {
      // Validate that newBase is a valid BaseType
      if (!this.isValidBaseType(newBase)) {
        throw new Error(`Invalid base type: ${newBase}`);
      }

      const currentInput = this.states[this.activeBase as BaseType].input.trim();
      const cleanedInput = CalculatorUtils.sanitizeExpression(currentInput);
      if (cleanedInput !== currentInput) {
        this.states[this.activeBase as BaseType].input = cleanedInput;
      }
      const currentValue = this.evaluateExpression(
        cleanedInput,
        this.activeBase as BaseType
      );
      if (currentValue || currentValue === 0) {
        this.updateAllStates(this.formatResult(currentValue));
      }
      this.activeBase = newBase;
      return {
        input: this.states[newBase as BaseType].input,
        error: this.error,
        displayValues: this.states
      };
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Type guard to check if a string is a valid BaseType
   */
  private isValidBaseType(base: string): base is BaseType {
    return ['DEC', 'BIN', 'HEX', 'OCT'].includes(base);
  }

  updateAllStates(value: string | number): void {
    try {
      (Object.keys(this.states) as BaseType[]).forEach(base => {
        const converted = this.convertToBase(value, this.activeBase as BaseType, base);
        this.states[base] = {
          input: converted,
          display: converted
        };
      });
    } catch (err) {
      console.error('Error updating states:', err);
      throw err;
    }
  }

  handleClear(): Record<string, any> {
    super.handleClear();
    (Object.keys(this.states) as BaseType[]).forEach(base => {
      this.states[base] = { input: "0", display: "0" };
    });
    this.operations.resetParentheses();
    return {
      input: "0",
      error: "",
      displayValues: this.states
    };
  }

  handleClearEntry(): Record<string, any> {
    const input = this.states[this.activeBase as BaseType].input;
    if (input !== "0" && input !== "Error") {
      const parts = input.split(" ");
      this.states[this.activeBase as BaseType].input = parts.length > 1 ? 
        parts.slice(0, -1).join(" ") : "0";
    } else {
      this.handleClear();
    }
    return {
      input: this.states[this.activeBase as BaseType].input,
      error: "",
      displayValues: this.states
    };
  }

  isInputTooLong(btn: string): boolean {
    const excludedButtons = [
      "=", "AC", "backspace", 
      ...CalculatorConstants.BUTTON_TYPES.MEMORY,
      ...CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS,
      "CE", "±", "%"
    ];
    return this.states[this.activeBase as BaseType].input.length >= this.MAX_INPUT_LENGTH &&
      !excludedButtons.includes(btn);
  }
}
