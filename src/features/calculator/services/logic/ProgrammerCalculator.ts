import { ICalculator } from '@calculator/utils/core/ICalculator'
import { ProgrammerOperations } from '@calculator/utils/operations/ProgrammerOperations.ts'
import { ProgrammerCalculations } from '@calculator/utils/calculations/ProgrammerCalculations.ts'
import { CalculatorConstants, BaseType } from '@calculator/utils/constants/CalculatorConstants.ts'
import { CalculatorUtils } from '@calculator/utils/constants/CalculatorUtils'
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator
} from '@calculator/utils/core/BaseCalculator'
import type { CalculatorResult } from '@calculator/services/factory/CalculatorFactory'

/**
 * Calculator implementation for programmer mode with multiple base support
 */
export class ProgrammerCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number
  states: Record<BaseType, { input: string; display: string }>
  calculators: Record<BaseType, any>
  calculations: ProgrammerCalculations
  operations: ProgrammerOperations

  constructor() {
    super()
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.PROGRAMMER
    this.states = {
      DEC: { input: '0', display: '0' },
      BIN: { input: '0', display: '0' },
      HEX: { input: '0', display: '0' },
      OCT: { input: '0', display: '0' }
    }
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
      HEX: new HexCalculator(),
      OCT: new OctCalculator()
    }
    this.calculations = new ProgrammerCalculations(this.activeBase as BaseType)
    this.operations = new ProgrammerOperations(this)
  }

  get activeCalculator(): any {
    return this.calculators[this.activeBase as BaseType]
  }

  evaluateExpression(expr: string, base: BaseType = this.activeBase as BaseType): any {
    try {
      return this.calculations.evaluateExpression(expr, { base })
    } catch(err: any) {
      console.log('Error evaluating expression:', err.stack)
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'))
    }
  }

  formatResult(result: any, base: BaseType = this.activeBase as BaseType): string {
    return this.calculations.formatResult(result, { base }) || ''
  }

  convertToBase(value: string | number, fromBase: BaseType, toBase: BaseType): string {
    return CalculatorUtils.convertToBase(value, fromBase, toBase) || '0'
  }

  handleButtonClick(btn: string): CalculatorResult {
    if (['backspace', 'AC', 'CE'].includes(btn)) {
      return this.normalizeResponse(this.processButton(btn))
    }
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error('Maximum input length reached'),
        this.states[this.activeBase as BaseType].input
      )
    }
    try {
      return this.normalizeResponse(this.processButton(btn))
    } catch(err: any) {
      return this.createErrorResponse(err, this.states[this.activeBase as BaseType].input)
    }
  }

  processButton(btn: string): CalculatorResult {
    const isFunctionKey = [
      ...CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS,
      '(', ')', 'backspace', 'AC', 'CE', '±', '%'
    ].includes(btn)

    let result: CalculatorResult

    try {
      this.error = ''
      switch (btn) {
        case '=': return this.handleEquals()
        case 'AC': return this.handleClear()
        case 'CE': return this.handleClearEntry()
        case 'backspace': result = this.operations.handleBackspace() as CalculatorResult; break
        case '±': result = this.operations.handleToggleSign() as CalculatorResult; break
        case '%': result = this.operations.handleModuloSign() as CalculatorResult; break
        case '(': case ')': result = this.operations.handleParenthesis(btn) as CalculatorResult; break
        case '<<': case '>>': case '+': case '-': case '×': case '÷':
          result = this.operations.handleOperator(btn) as CalculatorResult; break
        default:
          result = this.operations.handleNumber(btn) as CalculatorResult
      }
    } catch(err: any) {
      result = this.createErrorResponse(err, this.states[this.activeBase as BaseType].input)
    }

    if (isFunctionKey) {
      const updated = this.updateDisplayValues()
      return {
        input: this.states[this.activeBase as BaseType].input,
        error: this.error,
        expression: this.currentExpression,
        displayValues: updated
      }
    }

    return result
  }

  handleEquals(): CalculatorResult {
    try {
      const expression = this.states[this.activeBase as BaseType].input
      const openCount = this.operations.getParenthesesCount()
      const finalExpr = openCount > 0 ? expression + ' )'.repeat(openCount) : expression

      this.currentExpression = finalExpr

      const result = this.evaluateExpression(finalExpr)
      if (!result && result !== 0) throw new Error('Invalid expression')

      const formattedResult = this.formatResult(result)

      this.updateAllStates(formattedResult)
      this.operations.resetParentheses()

      return {
        input: this.states[this.activeBase as BaseType].input,
        expression: this.currentExpression,
        result: formattedResult,
        displayValues: { ...this.states }
      }
    } catch(err: any) {
      return this.createErrorResponse(err, this.states[this.activeBase as BaseType].input)
    }
  }

  /**
   * Returns the up-to-date displays for all bases.
   * Note: This method is intentionally not CalculatorResult — it’s used internally and wrapped by callers.
   */
  updateDisplayValues(): Record<BaseType, { input: string; display: string }> {
    try {
      const currentValue = this.evaluateExpression(
        this.states[this.activeBase as BaseType].input,
        this.activeBase as BaseType
      )

      if (currentValue || currentValue === 0) {
        (Object.keys(this.states) as BaseType[]).forEach(base => {
          this.states[base].display = this.formatResult(currentValue, base)
        })
      }
      return this.states
    } catch(err: any) {
      console.warn('[ProgrammerCalculator]: UpdateDisplayValues threw an unexpected error, returning states', err)
      return this.states
    }
  }

  handleBaseChange(newBase: string): CalculatorResult {
    try {
      if (!this.isValidBaseType(newBase)) {
        throw new Error(`Invalid base type: ${newBase}`)
      }

      const currentInput = this.states[this.activeBase as BaseType].input.trim()
      const cleanedInput = CalculatorUtils.sanitizeExpression(currentInput)
      if (cleanedInput !== currentInput) {
        this.states[this.activeBase as BaseType].input = cleanedInput
      }

      const currentValue = this.evaluateExpression(
        cleanedInput,
        this.activeBase as BaseType
      )

      if (currentValue || currentValue === 0) {
        this.updateAllStates(this.formatResult(currentValue))
      }

      this.activeBase = newBase

      return {
        input: this.states[newBase as BaseType].input,
        error: this.error,
        displayValues: this.states
      }
    } catch(err: any) {
      return this.createErrorResponse(err, this.states[this.activeBase as BaseType].input)
    }
  }

  private isValidBaseType(base: string): base is BaseType {
    return ['DEC', 'BIN', 'HEX', 'OCT'].includes(base)
  }

  updateAllStates(value: string | number): void {
    try {
      (Object.keys(this.states) as BaseType[]).forEach(base => {
        const converted = this.convertToBase(value, this.activeBase as BaseType, base)
        this.states[base] = {
          input: converted,
          display: converted
        }
      })
    } catch(err) {
      console.error('Error updating states:', err)
      throw err
    }
  }

  handleClear(): CalculatorResult {
    super.handleClear()
    ; (Object.keys(this.states) as BaseType[]).forEach(base => {
      this.states[base] = { input: '0', display: '0' }
    })
    this.operations.resetParentheses()

    return {
      input: '0',
      error: '',
      displayValues: this.states
    }
  }

  handleClearEntry(): CalculatorResult {
    const input = this.states[this.activeBase as BaseType].input

    if (input === '0' || input === 'Error') {
      return this.handleClear()
    }

    const operatorRegex = /\s*[+\-×÷%]\s*$|\s*<<\s*$|\s*>>\s*$/

    if (operatorRegex.test(input)) {
      const newInput = input
        .replace(/\s*[+\-×÷%]\s*$/, '')
        .replace(/\s*<<\s*$/, '')
        .replace(/\s*>>\s*$/, '')
        .trim()
      this.states[this.activeBase as BaseType].input = newInput || '0'
    } else {
      const match = input.match(/(.*[+\-×÷%]|.*<<|.*>>)\s*(.*)$/)
      if (match) {
        this.states[this.activeBase as BaseType].input = match[1]
      } else {
        this.states[this.activeBase as BaseType].input = '0'
      }
    }

    if (!this.states[this.activeBase as BaseType].input.trim()) {
      this.states[this.activeBase as BaseType].input = '0'
    }

    return {
      input: this.states[this.activeBase as BaseType].input,
      error: '',
      displayValues: this.states
    }
  }

  isInputTooLong(btn: string): boolean {
    const excludedButtons = [
      '=', 'AC', 'backspace',
      ...CalculatorConstants.BUTTON_TYPES.MEMORY,
      ...CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS,
      'CE', '±', '%'
    ]

    if (excludedButtons.includes(btn)) {
      return false
    }

    const currentInput = this.states[this.activeBase as BaseType].input
    const newLength = currentInput.length + btn.length

    return newLength > this.MAX_INPUT_LENGTH
  }
}
