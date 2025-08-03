import { CalculatorUtils } from '../../constants/CalculatorUtils'
import { ParenthesesTracker } from '../../core/ParenthesesTracker'
import { PowerOperationHandler } from './PowerOperationHandler'
import { RootOperationHandler } from './RootOperationHandler'
import { SpecialOperationHandler } from './SpecialOperationHandler'

/**
 * Handles scientific function operations (sin, cos, log, etc.)
 * Delegates specialized operations to dedicated handlers
 */
export class ScientificFunctionHandler {
  private calculator: any
  private parenthesesTracker: ParenthesesTracker
  private powerHandler: PowerOperationHandler
  private rootHandler: RootOperationHandler
  private specialHandler: SpecialOperationHandler

  constructor(calculator: any, parenthesesTracker: ParenthesesTracker) {
    this.calculator = calculator
    this.parenthesesTracker = parenthesesTracker
    
    // Initialize specialized handlers
    this.powerHandler = new PowerOperationHandler(calculator, parenthesesTracker)
    this.rootHandler = new RootOperationHandler(calculator, parenthesesTracker)
    this.specialHandler = new SpecialOperationHandler(calculator, parenthesesTracker)
  }

  /**
   * Handle scientific function operations
   */
  handle(func: string): Record<string, any> {
    try {
      const currentInput = this.calculator.input;
      
      // Map display symbols to function names
      const funcName = CalculatorUtils.mapFunctionName(func);
         
      // Delegate to specialized handlers
      switch (funcName) {
        // Power operations
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
        
        // Root operations
        case '1/x':
          return this.rootHandler.handleReciprocalOperation()
        case '√':
          return this.rootHandler.handleSquareRootOperation()
        case '∛':
          return this.rootHandler.handleCubeRootOperation()
        case 'y√x':
          return this.rootHandler.handleNthRootOperation()
        
        // Special operations
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
        
        // Standard functions (sin, cos, log, etc.)
        default:
          return this.handleStandardFunction(funcName, currentInput)
      }
    } catch (err: any) {
      return this.createResponse("Error", CalculatorUtils.formatError(err, "Operation failed"));
    }
  }

  /**
   * Handle square operation (x²) - kept in main handler as it's frequently used
   */
  private handleSquareOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input;
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "sqr(";
        this.parenthesesTracker.open(4);
      } else {
        const lastChar = currentInput.trim().slice(-1);
        const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '(';
        
        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}sqr(`;
          this.parenthesesTracker.open(currentInput.length + 4);
        } else {
          const openParenCount = ParenthesesTracker.getOpenParenthesesCount(currentInput);
          
          if (openParenCount > 0) {
            const lastOpenParen = currentInput.lastIndexOf('(');
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim();
            
            if (!contentAfterLastParen || CalculatorUtils.isOperator(contentAfterLastParen.slice(-1))) {
              this.calculator.input = `${currentInput}sqr(`;
              this.parenthesesTracker.open(currentInput.length + 4);
            } else {
              this.calculator.input = `${currentInput} × sqr(`;
              this.parenthesesTracker.open(currentInput.length + 6);
            }
          } else {
            this.calculator.input = `${currentInput} × sqr(`;
            this.parenthesesTracker.open(currentInput.length + 6);
          }
        }
      }
      
      return this.createResponse();
    } catch (err: any) {
      return this.createResponse("Error", err.message);
    }
  }

    /**
   * Handle standard functions that need parentheses (sin, cos, log, etc.)
   */
  private handleStandardFunction(funcName: string, currentInput: string): Record<string, any> {
    if (currentInput === '0' || currentInput === 'Error') {
      this.calculator.input = `${funcName}(`;
      this.parenthesesTracker.open(funcName.length);
    } else {
      // Check if the last character is an operator or opening parenthesis
      const lastChar = currentInput.trim().slice(-1);
      const isLastCharOperator = CalculatorUtils.isOperator(lastChar) || lastChar === '(';
      
      if (isLastCharOperator) {
        this.calculator.input = `${currentInput}${funcName}(`;
        this.parenthesesTracker.open(currentInput.length + funcName.length);
      } else {
        this.calculator.input = `${currentInput} × ${funcName}(`;
        this.parenthesesTracker.open(currentInput.length + funcName.length + 3);
      }
    }
    
    return this.createResponse();
  }

  private createResponse(input?: string, error: string = ""): Record<string, any> {
    return CalculatorUtils.createResponse({
      input: input || this.calculator.input,
      error: error
    });
  }
}
