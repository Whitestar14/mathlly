import { ICalculator } from "@/utils/core/ICalculator.ts";
import { ScientificOperations } from "@/utils/operations/ScientificOperations.ts";
import { ScientificCalculations } from '@/utils/calculations/ScientificCalculations';
import { CalculatorConstants } from "@/utils/constants/CalculatorConstants.ts";
import { CalculatorUtils } from '@/utils/constants/CalculatorUtils';
import { computed, type ComputedRef } from 'vue';

/**
 * Calculator implementation for scientific mode
 * 
 * @class ScientificCalculator
 * @extends ICalculator
 */
export class ScientificCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number;
  calculations: ScientificCalculations;
  operations: ScientificOperations;
  
  // Reactive computed properties for modes
  angleMode: ComputedRef<'RAD' | 'DEG' | 'GRAD'>;
  notationMode: ComputedRef<'F-E' | 'SCI'>;
  hyperbolicMode: ComputedRef<boolean>;

  /**
   * Create a new scientific calculator
   * No settings parameter needed - uses tool settings store directly
   */
  constructor() {
    super(); // No settings parameter needed
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.SCIENTIFIC;
    
    // Create reactive computed properties that map tool settings to calculator modes
    this.angleMode = computed(() => {
      const angleUnit = this.getToolSetting('angleUnit', 'degrees') as 'degrees' | 'radians' | 'gradians';
      const mapping: Record<'degrees' | 'radians' | 'gradians', 'DEG' | 'RAD' | 'GRAD'> = {
        'degrees': 'DEG',
        'radians': 'RAD',
        'gradians': 'GRAD'
      };
      return mapping[angleUnit] ?? 'DEG';
    });

    this.notationMode = computed(() => {
      try {
        const notationMode = this.getToolSetting('notationMode', 'standard') as 'standard' | 'scientific' | 'engineering';
        
        const mapping: Record<'standard' | 'scientific' | 'engineering', 'F-E' | 'SCI'> = {
          'standard': 'F-E',
          'scientific': 'SCI',
          'engineering': 'SCI' // Map engineering to SCI for now
        };
        
        return mapping[notationMode] ?? 'F-E';
      } catch (err) {
        console.error('Error in notationMode computed:', err);
        return 'F-E';
      }
    });

    this.hyperbolicMode = computed(() => {
      return this.getToolSetting('hyperbolicMode', false);
    });
    
    // Use composition for calculations and operations - pass this calculator instance
    this.calculations = new ScientificCalculations(this);
    this.operations = new ScientificOperations(this);
  }

  /**
   * Format a result for display
   * 
   * @param {*} result - Result to format
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
      return this.calculations.evaluateExpression(expr);
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION));
    }
  }

  /**
   * Handle equals operation
   * 
   * @returns {Object} Calculation result
   */
  handleEquals(): Record<string, any> {
    try {
      // Get parentheses count from operations
      const openCount = this.operations.getParenthesesCount();
      // Add missing closing parentheses if needed
      const finalExpr = openCount > 0 ? this.input + ")".repeat(openCount) : this.input;
      
      this.currentExpression = finalExpr;
      const result = this.evaluateExpression(finalExpr);
      this.input = this.formatResult(result);
      
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

      // Handle clear operations using BUTTON_TYPES
      if (btn === 'AC' || btn === 'C') {
        this.handleClear();
        this.operations.resetParentheses();
        return { input: this.input, error: this.error };
      }

      if (btn === 'CE') {
        return this.operations.handleClearEntry();
      }

      // Handle backspace
      if (btn === 'backspace') {
        return this.operations.handleBackspace();
      }

      // Handle scientific functions using BUTTON_TYPES and FUNCTION_MAPPINGS
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
      return this.operations.handleNumber(btn);
    } catch (err) {
      return this.createErrorResponse(err as Error);
    }
  }

  /**
   * Handle button click - main entry point
   */
  handleButtonClick(btn: string): Record<string, any> {
    // Handle memory operations using BUTTON_TYPES
    if (CalculatorConstants.BUTTON_TYPES.MEMORY.includes(btn as any)) {
      return super.handleButtonClick(btn);
    }
    
    // Handle control buttons
    if (['backspace', 'AC', 'CE', 'C'].includes(btn)) {
      return this.normalizeResponse(this.processButton(btn));
    }
    
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error(CalculatorConstants.ERROR_MESSAGES.MAX_INPUT_LENGTH),
        this.input
      );
    }
    
    try {
      return this.normalizeResponse(this.processButton(btn));
    } catch (err: any) {
      return this.createErrorResponse(err, this.input);
    }
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
