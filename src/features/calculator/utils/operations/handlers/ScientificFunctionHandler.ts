import { CalculatorResult } from '@features/calculator/services/factory/CalculatorFactory'
import { CalculatorUtils } from '../../constants/CalculatorUtils'
import { PowerOperationHandler } from './PowerOperationHandler'
import { RootOperationHandler } from './RootOperationHandler'
import { SpecialOperationHandler } from './SpecialOperationHandler'

/**
 * Handles scientific function operations (sin, cos, log, etc.)
 * Delegates specialized operations to dedicated handlers
 */
export class ScientificFunctionHandler {
  private calculator: any
  private powerHandler: PowerOperationHandler
  private rootHandler: RootOperationHandler
  private specialHandler: SpecialOperationHandler

  constructor(calculator: any) {
    this.calculator = calculator

    this.powerHandler = new PowerOperationHandler(calculator)
    this.rootHandler = new RootOperationHandler(calculator)
    this.specialHandler = new SpecialOperationHandler(calculator)
  }

  /**
   * Handle scientific function operations
   */
  handle(func: string): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      const funcName = CalculatorUtils.mapFunctionName(func)

      switch (funcName) {
        case 'x²':
          return this.handleSquareOperation()
        case 'x³':
          return this.powerHandler.handleCubeOperation()
        case 'x^y':
          return this.powerHandler.handlePowerOperation()
        case 'exp':
          return this.powerHandler.handleExponentialOperation()
        case '10^x':
          return this.powerHandler.handle10PowerOperation()
        case '2^x':
          return this.powerHandler.handle2PowerOperation()
        case 'e^x':
          return this.powerHandler.handleEPowerOperation()

        case '1/x':
          return this.rootHandler.handleReciprocalOperation()
        case '√':
          return this.rootHandler.handleSquareRootOperation()
        case '∛':
          return this.rootHandler.handleCubeRootOperation()
        case 'y√x':
          return this.rootHandler.handleNthRootOperation()

        case '|x|':
          return this.specialHandler.handleAbsoluteOperation()
        case 'n!':
          return this.specialHandler.handleFactorialOperation()
        case 'mod':
          return this.specialHandler.handleModuloOperation()
        case 'rand':
          return this.specialHandler.handleRandomOperation()
        case 'dms':
          return this.specialHandler.handleDMSOperation()
        case 'deg':
          return this.specialHandler.handleDegreeOperation()

        default:
          return this.handleStandardFunction(funcName, currentInput)
      }
    } catch(err: any) {
      return this.createResponse('Error', CalculatorUtils.formatError(err, 'Operation failed'))
    }
  }

  /**
   * Handle square operation (x²) - kept in main handler as it's frequently used
   */
  private handleSquareOperation(): CalculatorResult {
    try {
      const currentInput = this.calculator.input

      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = 'sqr('
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}sqr(`
        } else {
          const openParenCount = CalculatorUtils.getOpenParenthesesCount(currentInput)

          if (openParenCount > 0) {
            const lastOpenParen = currentInput.lastIndexOf('(')
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim()

            if (!contentAfterLastParen || CalculatorUtils.isOperator(contentAfterLastParen.slice(-1))) {
              this.calculator.input = `${currentInput}sqr(`
            } else {
              this.calculator.input = `${currentInput} × sqr(`
            }
          } else {
            this.calculator.input = `${currentInput} × sqr(`
          }
        }
      }

      return this.createResponse()
    } catch(err: any) {
      return this.createResponse('Error', err.message)
    }
  }

  /**
   * Handle standard functions that need parentheses (sin, cos, log, etc.)
   */
  private handleStandardFunction(funcName: string, currentInput: string): CalculatorResult {
    if (currentInput === '0' || currentInput === 'Error') {
      this.calculator.input = `${funcName}(`
    } else {
      const lastChar = currentInput.trim().slice(-1)
      const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '('

      if (isLastCharOperator) {
        this.calculator.input = `${currentInput}${funcName}(`
      } else {
        this.calculator.input = `${currentInput} × ${funcName}(`
      }
    }

    return this.createResponse()
  }

  private createResponse(input?: string, error: string = ''): CalculatorResult {
    return CalculatorUtils.createResponse({
      input: input || this.calculator.input,
      error: error
    })
  }
}
