import { StandardCalculator } from '@calculator/services/logic/StandardCalculator.ts'
import { ProgrammerCalculator } from '@calculator/services/logic/ProgrammerCalculator.ts'
import { ScientificCalculator } from '@calculator/services/logic/ScientificCalculator.ts'
import type { CalculatorMode } from '@calculator/composables/useCalculatorState'
import type { BaseType } from '@calculator/utils/constants/CalculatorConstants'
import type { ExpressionEvaluator } from '@calculator/utils/core/ExpressionEvaluator'
import { useCalculatorOptions } from '@calculator/composables/useCalculatorOptions'

interface CalculatorResult {
 input: string
 error?: string
 result?: string
 expression?: string
 displayValues?: Record<string, any>
}

interface ICalculatorCore {
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

type IStandardCalculator = ICalculatorCore;

interface IScientificCalculator extends ICalculatorCore {
 angleMode?: string
 notationMode?: string
 hyperbolicMode?: boolean
}

interface IProgrammerCalculator extends ICalculatorCore {
 states: Record<BaseType, { input: string; display: string }>
 calculators: Record<BaseType, any>
 handleBaseChange(newBase: string): CalculatorResult
 updateDisplayValues(input: string): Record<BaseType, { input: string; display: string }>
 updateAllStates(value: string | number): void
 convertToBase(value: string | number, fromBase: BaseType, toBase: BaseType): string
 handleClearEntry(): CalculatorResult
}

export type Calculator = IStandardCalculator | IProgrammerCalculator | IScientificCalculator

export function isProgrammerCalculator(calc: Calculator): calc is IProgrammerCalculator {
 return (calc as IProgrammerCalculator).states !== undefined;
}

export function isScientificCalculator(calculator: Calculator): calculator is IScientificCalculator {
 return 'angleMode' in calculator
}

export function isStandardCalculator(calculator: Calculator): calculator is IStandardCalculator {
 return !isProgrammerCalculator(calculator) && !isScientificCalculator(calculator)
}

export class CalculatorFactory {
  static create(mode: CalculatorMode): Calculator {
    switch (mode) {
      case 'Standard':   return new StandardCalculator()
      case 'Scientific': return new ScientificCalculator()
      case 'Programmer': return new ProgrammerCalculator()
      default: throw new Error(`Unsupported calculator mode: ${mode}`)
    }
  }
}


export type {
 ICalculatorCore,
 CalculatorResult,
 IStandardCalculator,
 IProgrammerCalculator,
 IScientificCalculator
}
export type { BaseType }