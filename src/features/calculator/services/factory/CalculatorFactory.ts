import { StandardCalculator } from '@calculator/services/logic/StandardCalculator.ts'
import { ProgrammerCalculator } from '@calculator/services/logic/ProgrammerCalculator.ts'
import { ScientificCalculator } from '@calculator/services/logic/ScientificCalculator.ts'
import type { CalculatorMode } from '@calculator/composables/useCalculatorState'

// Define calculator result interface
interface CalculatorResult {
  input: string
  error?: string
  result?: string
  expression?: string
  displayValues?: Record<string, any>
}

// Define base calculator interface
interface BaseCalculator {
  input: string
  currentExpression: string
  MAX_INPUT_LENGTH: number
  handleButtonClick: (button: string) => CalculatorResult
  evaluateExpression: (expression: string, base?: string) => any
  formatResult: (result: any, base?: string) => string
  convertToBase?: (value: string, fromBase: string, toBase: string) => string
}

// Define standard calculator interface
interface StandardCalculatorInterface extends BaseCalculator {
  convertToBase: (value: string, fromBase: string, toBase: string) => string
}

// Define programmer calculator interface
interface ProgrammerCalculatorInterface extends BaseCalculator {
  handleBaseChange: (newBase: string) => CalculatorResult
  updateDisplayValues: (input: string) => Record<string, any>
  states: Record<string, { input: string; display: string }>
  convertToBase: (value: string, fromBase: string, toBase: string) => string
}

// Define scientific calculator interface
interface ScientificCalculatorInterface extends BaseCalculator {
  angleMode: any // ComputedRef from Vue
  notationMode: any // ComputedRef from Vue
  hyperbolicMode: any // ComputedRef from Vue
  convertToBase: (value: string, fromBase: string, toBase: string) => string
}

// Union type for all calculator types
export type Calculator = StandardCalculatorInterface | ProgrammerCalculatorInterface | ScientificCalculatorInterface

// Type guards
export function isProgrammerCalculator(calculator: Calculator): calculator is ProgrammerCalculatorInterface {
  return 'handleBaseChange' in calculator && 'updateDisplayValues' in calculator && 'states' in calculator
}

export function isScientificCalculator(calculator: Calculator): calculator is ScientificCalculatorInterface {
  return 'angleMode' in calculator && 'notationMode' in calculator && 'hyperbolicMode' in calculator
}

/**
 * Wrapper class for StandardCalculator to add missing methods
 */
class StandardCalculatorWrapper implements StandardCalculatorInterface {
  private calculator: StandardCalculator

  constructor(calculator: StandardCalculator) {
    this.calculator = calculator
  }

  get input(): string { return this.calculator.input }
  set input(value: string) { this.calculator.input = value }
  get currentExpression(): string { return this.calculator.currentExpression }
  set currentExpression(value: string) { this.calculator.currentExpression = value }
  get MAX_INPUT_LENGTH(): number { return this.calculator.MAX_INPUT_LENGTH }

  handleButtonClick(button: string): CalculatorResult {
    const result = this.calculator.handleButtonClick(button)
    return { input: this.input, ...result }
  }

  evaluateExpression(expression: string, base?: string): any {
    return this.calculator.evaluateExpression(expression, base)
  }

  formatResult(result: any): string {
    return this.calculator.formatResult(result)
  }

  convertToBase(value: string, fromBase: string, toBase: string): string {
    try {
      let decimalValue: number

      switch (fromBase.toUpperCase()) {
        case 'DEC': decimalValue = parseFloat(value); break
        case 'HEX': decimalValue = parseInt(value, 16); break
        case 'OCT': decimalValue = parseInt(value, 8); break
        case 'BIN': decimalValue = parseInt(value, 2); break
        default: decimalValue = parseFloat(value)
      }

      switch (toBase.toUpperCase()) {
        case 'DEC': return decimalValue.toString()
        case 'HEX': return decimalValue.toString(16).toUpperCase()
        case 'OCT': return decimalValue.toString(8)
        case 'BIN': return decimalValue.toString(2)
        default: return decimalValue.toString()
      }
    } catch (error) {
      console.error('Error converting base:', error)
      return '0'
    }
  }
}

/**
 * Wrapper class for ScientificCalculator to add missing methods
 */
class ScientificCalculatorWrapper implements ScientificCalculatorInterface {
  private calculator: ScientificCalculator

  constructor(calculator: ScientificCalculator) {
    this.calculator = calculator
  }

  get input(): string { return this.calculator.input }
  set input(value: string) { this.calculator.input = value }
  get currentExpression(): string { return this.calculator.currentExpression }
  set currentExpression(value: string) { this.calculator.currentExpression = value }
  get MAX_INPUT_LENGTH(): number { return this.calculator.MAX_INPUT_LENGTH }
  get angleMode(): any { return this.calculator.angleMode }
  get notationMode(): any { return this.calculator.notationMode }
  get hyperbolicMode(): any { return this.calculator.hyperbolicMode }

  handleButtonClick(button: string): CalculatorResult {
    const result = this.calculator.handleButtonClick(button)
    return { input: this.input, ...result }
  }

  evaluateExpression(expression: string): any {
    return this.calculator.evaluateExpression(expression)
  }

  formatResult(result: any): string {
    return this.calculator.formatResult(result)
  }

  convertToBase(value: string, fromBase: string, toBase: string): string {
    try {
      let decimalValue: number

      switch (fromBase.toUpperCase()) {
        case 'DEC': decimalValue = parseFloat(value); break
        case 'HEX': decimalValue = parseInt(value, 16); break
        case 'OCT': decimalValue = parseInt(value, 8); break
        case 'BIN': decimalValue = parseInt(value, 2); break
        default: decimalValue = parseFloat(value)
      }

      switch (toBase.toUpperCase()) {
        case 'DEC': return decimalValue.toString()
        case 'HEX': return decimalValue.toString(16).toUpperCase()
        case 'OCT': return decimalValue.toString(8)
        case 'BIN': return decimalValue.toString(2)
        default: return decimalValue.toString()
      }
    } catch (error) {
      console.error('Error converting base:', error)
      return '0'
    }
  }
}

/**
 * Simplified Calculator Factory
 */
export class CalculatorFactory {
  /**
   * Create a calculator instance based on mode
   * @param mode - Calculator mode
   * @returns Calculator instance
   */
  static create(mode: CalculatorMode): Calculator {
    if (!mode) {
      throw new Error('Calculator mode is required')
    }

    try {
      switch (mode) {
        case 'Standard': {
          const standardCalc = new StandardCalculator()
          return new StandardCalculatorWrapper(standardCalc)
        }
        
        case 'Programmer': {
          return new ProgrammerCalculator() as unknown as ProgrammerCalculatorInterface
        }
        
        case 'Scientific': {
          const scientificCalc = new ScientificCalculator()
          return new ScientificCalculatorWrapper(scientificCalc)
        }
        
        default: {
          throw new Error(`Unsupported calculator mode: ${mode}`)
        }
      }
    } catch (error) {
      throw new Error(`Failed to create calculator for mode '${mode}': ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export types for external use
export type {
  BaseCalculator,
  CalculatorResult,
  StandardCalculatorInterface,
  ProgrammerCalculatorInterface,
  ScientificCalculatorInterface
}
