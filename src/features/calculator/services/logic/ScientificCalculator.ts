import { ICalculator } from '@calculator/utils/core/ICalculator'
import { ScientificOperations } from '@calculator/utils/operations/ScientificOperations.ts'
import { ScientificCalculations } from '@calculator/utils/calculations/ScientificCalculations'
import { CalculatorConstants } from '@calculator/utils/constants/CalculatorConstants.ts'
import { CalculatorUtils } from '@calculator/utils/constants/CalculatorUtils'
import type { CalculatorResult } from '@calculator/services/factory/CalculatorFactory'

export class ScientificCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number
  calculations: ScientificCalculations
  operations: ScientificOperations

  constructor() {
    super()
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.SCIENTIFIC
    this.calculations = new ScientificCalculations()
    this.operations = new ScientificOperations(this)
  }

  formatResult(result: any): string {
    return this.calculations.formatResult(result)
  }

  evaluateExpression(expr: string): any {
    try {
      return this.calculations.evaluateExpression(expr)
    } catch(err: any) {
      throw new Error(
        CalculatorUtils.formatError(err, CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION)
      )
    }
  }

  handleEquals(): CalculatorResult {
    try {
      const openCount = this.operations.getParenthesesCount()
      const finalExpr = openCount > 0 ? this.input + ')'.repeat(openCount) : this.input

      this.currentExpression = finalExpr
      const result = this.evaluateExpression(finalExpr)
      const formattedResult = this.formatResult(result)

      this.input = formattedResult
      this.operations.resetParentheses()

      return this.normalizeResponse({
        input: this.input,
        expression: this.currentExpression,
        result: formattedResult,
        error: this.error
      })
    } catch(err: any) {
      return this.createErrorResponse(err, this.input)
    }
  }

  processButton(btn: string): CalculatorResult {
    try {
      this.error = ''

      if (CalculatorConstants.REGEX.PARENTHESIS.test(btn)) {
        return this.operations.handleParenthesis(btn)
      }
      if (CalculatorConstants.REGEX.CONSTANT.test(btn)) {
        return this.operations.handleConstant(btn)
      }
      if (btn === '=') {
        return this.handleEquals()
      }
      if (btn === 'backspace') {
        return this.operations.handleBackspace()
      }
      if (
        CalculatorConstants.BUTTON_TYPES.SCIENTIFIC_FUNCTIONS.includes(btn as any) ||
        Object.keys(CalculatorConstants.FUNCTION_MAPPINGS).includes(btn)
      ) {
        return this.operations.handleScientificFunction(btn)
      }
      if (CalculatorConstants.BUTTON_TYPES.OPERATORS.includes(btn as any)) {
        return this.operations.handleOperator(btn)
      }
      if (btn === '%') {
        return this.operations.handlePercentage()
      }
      if (btn === '±') {
        return this.operations.handleToggleSign()
      }
      if (btn === ',') {
        return this.operations.handleComma()
      }
      if (CalculatorConstants.REGEX.NUMBER.test(btn)) {
        return this.operations.handleNumber(btn)
      }

      console.warn(`Unexpected button input in ScientificCalculator: "${btn}"`)
      return { input: this.input, error: this.error }
    } catch(err) {
      return this.createErrorResponse(err as Error, this.input)
    }
  }

  handleButtonClick(btn: string): CalculatorResult {
    if (CalculatorConstants.BUTTON_TYPES.MEMORY.includes(btn as any)) {
      return super.handleButtonClick(btn)
    }

    if (['AC', 'C'].includes(btn)) {
      return this.handleClear()
    }

    if (btn === 'CE') {
      return this.operations.handleClearEntry()
    }

    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error(CalculatorConstants.ERROR_MESSAGES.MAX_INPUT_LENGTH),
        this.input
      )
    }

    return this.normalizeResponse(this.processButton(btn))
  }

  handleClear(): CalculatorResult {
    super.handleClear()
    this.operations.resetParentheses()
    return {
      input: this.input,
      error: this.error
    }
  }
}
