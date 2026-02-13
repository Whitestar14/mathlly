import { OperatorType, BUTTON_TYPES, BaseType, ERROR_MESSAGES, REGEX, BASES, ScientificFunctionType, FUNCTION_MAPPINGS } from './CalculatorConstants'

/**
 * Utility functions for calculator operations
 */

export const CalculatorUtils = {
  /**
   * Check if a character is an operator
   * @param char - Character to check
   * @returns True if character is an operator
   */
  isOperator(char: string): char is OperatorType {
    return BUTTON_TYPES.OPERATORS.includes(char as OperatorType)
  },

  /**
   * Check if a value is valid for a specific base
   * @param value - Value to check
   * @param base - Base to check against
   * @returns True if value is valid for base
   */
  isValidForBase(value: string, base: BaseType): boolean {
    if (!value || typeof value !== 'string') return false

    const patterns: Record<BaseType, RegExp> = {
      BIN: /^-?[01]+$/,
      OCT: /^-?[0-7]+$/,
      DEC: /^-?[0-9]+$/,
      HEX: /^-?[0-9A-Fa-f]+$/
    }

    const pattern = patterns[base]
    if (!pattern) return false

    const testValue = value.startsWith('-') ? value.slice(1) : value
    return pattern.test(testValue)
  },

  /**
   * Trim unnecessary zeros from a formatted number
   * @param formattedNumber - Number to trim
   * @returns Trimmed number
   */
  trimUnnecessaryZeros(formattedNumber: string): string {
    if (formattedNumber.includes('e')) return formattedNumber

    const [whole, decimal] = formattedNumber.split('.')
    if (!decimal) return whole
    const trimmedDecimal = decimal.replace(/0+$/, '')

    return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole
  },

  /**
   * Sanitize an expression for evaluation.
   * Maps UI representation to mathjs compatible syntax.
   * @param expr - Expression to sanitize
   * @returns Sanitized expression
   */
  sanitizeExpression(expr: string): string {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/sqr\(/g, 'square(')
      .replace(/cube\(/g, 'cube(')
      .replace(/∛/g, 'cbrt')
      .replace(/\s+/g, ' ')
      .replace(/[+\-*/]\s*$/, '')
      .trim()
  },

  /**
   * Create a standardized response object
   * @param data - Response data
   * @returns Standardized response
   */
  createResponse<T = any>(data: {
    input?: string;
    error?: string;
    expression?: string;
    result?: T;
    displayValues?: Record<string, any>;
  }): {
    input: string;
    error: string;
    expression: string;
    result?: T;
    displayValues?: Record<string, any>;
    success: boolean;
  } {
    return {
      input: data.input || '0',
      error: data.error || '',
      expression: data.expression || '',
      result: data.result,
      displayValues: data.displayValues,
      success: !data.error
    }
  },

  /**
   * Handle common error cases
   * @param error - Error object
   * @param defaultMessage - Default error message
   * @returns Formatted error message
   */
  formatError(error: Error | string | null | undefined, defaultMessage: string = 'Operation failed'): string {
    if (!error) return defaultMessage

    const errorMessage = typeof error === 'string' ? error : error.message

    if (errorMessage.includes('division by zero')) {
      return ERROR_MESSAGES.DIVISION_BY_ZERO
    }

    if (errorMessage.includes('overflow')) {
      return ERROR_MESSAGES.OVERFLOW
    }

    if (errorMessage.includes('square root of negative')) {
      return ERROR_MESSAGES.NEGATIVE_SQUARE_ROOT
    }

    return errorMessage || defaultMessage
  },

  /**
   * Check if input contains a valid number
   * @param input - Input to check
   * @returns True if input contains a valid number
   */
  containsValidNumber(input: string): boolean {
    return /\d/.test(input)
  },

  /**
   * Split expression into parts preserving operators
   * @param expr - Expression to split
   * @returns Array of expression parts
   */
  splitExpression(expr: string): string[] {
    return expr.split(/([+\-×÷%]|\s+<<\s+|\s+>>\s+)/)
  },

  /**
   * Check if expression ends with an operator
   * @param expr - Expression to check
   * @returns True if expression ends with an operator
   */
  endsWithOperator(expr: string): boolean {
    return REGEX.LAST_OPERATOR.test(expr.trim())
  },

  /**
   * Remove last operator from expression
   * @param expr - Expression to modify
   * @returns Expression without last operator
   */
  removeLastOperator(expr: string): string {
    return expr.replace(REGEX.LAST_OPERATOR, '')
  },

  /**
   * Check if a string represents a valid number in any base
   * @param str - String to check
   * @param base - Base to check against
   * @returns True if string is a valid number
   */
  isValidNumber(str: string, base: BaseType = 'DEC'): boolean {
    if (!str || typeof str !== 'string') return false

    switch (base) {
      case 'BIN': return /^-?[01]+$/.test(str)
      case 'OCT': return /^-?[0-7]+$/.test(str)
      case 'DEC': return /^-?[0-9]+(\.[0-9]*)?$/.test(str)
      case 'HEX': return /^-?[0-9A-Fa-f]+$/.test(str)
      default: return false
    }
  },

  /**
   * Format number for display according to base
   * @param num - Number to format
   * @param base - Base for formatting
   * @returns Formatted number
   */
  formatForBase(num: number | string, base: BaseType): string {
    if (num === undefined || num === null) return '0'

    try {
      const numValue = typeof num === 'string' ? parseFloat(num) : num

      if (isNaN(numValue)) return '0'

      const isNegative = numValue < 0
      const absValue = Math.floor(Math.abs(numValue))

      let result: string
      switch (base) {
        case 'BIN': result = Math.floor(absValue).toString(2); break
        case 'OCT': result = Math.floor(absValue).toString(8); break
        case 'HEX': result = Math.floor(absValue).toString(16).toUpperCase(); break
        case 'DEC':
        default:
          result = absValue.toString()
      }

      return isNegative ? '-' + result : result
    } catch(err) {
      console.error('Error formatting number:', err)
      return '0'
    }
  },

  /**
   * Check if expression has balanced parentheses
   * @param expr - Expression to check
   * @returns True if parentheses are balanced
   */
  hasBalancedParentheses(expr: string): boolean {
    let count = 0
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') count++
      else if (expr[i] === ')') {
        count--
        if (count < 0) return false
      }
    }
    return count === 0
  },

  /**
   * Count unclosed opening parentheses in an expression
   * @param expr - The expression to analyze
   * @returns Number of unclosed opening parentheses
   */
  getOpenParenthesesCount(expr: string): number {
    let count = 0
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') {
        count++
      } else if (expr[i] === ')') {
        count--
      }
    }
    return Math.max(0, count)
  },

  /**
   * Check if expression ends with a shift operator
   * @param expr - Expression to check
   * @returns True if expression ends with a shift operator
   */
  endsWithShiftOperator(expr: string): boolean {
    return REGEX.SHIFT_OPERATOR.test(expr.trim())
  },

  /**
   * Remove shift operator from expression
   * @param expr - Expression to modify
   * @returns Expression without shift operator
   */
  removeShiftOperator(expr: string): string {
    return expr.replace(REGEX.SHIFT_OPERATOR, '')
  },

  /**
   * Convert between bases with error handling
   * @param value - Value to convert
   * @param fromBase - Source base
   * @param toBase - Target base
   * @returns Converted value or error message
   */
  convertToBase(value: string | number, fromBase: BaseType, toBase: BaseType): string {
    try {
      if (!value || value === 'Overflow') return '0'

      const isNegative = typeof value === 'string' && value.startsWith('-')
      const absValue = isNegative ? value.substring(1) : value

      let decimalValue: number

      if (fromBase === 'DEC') {
        decimalValue = typeof absValue === 'string' ? parseFloat(absValue) : absValue
      } else {
        decimalValue = parseInt(absValue.toString(), BASES[fromBase])
      }

      if (isNaN(decimalValue)) return '0'

      let result: string
      if (toBase === 'DEC') {
        result = Math.floor(decimalValue).toString()
      } else {
        result = Math.floor(decimalValue).toString(BASES[toBase])
        if (toBase === 'HEX') result = result.toUpperCase()
      }

      return isNegative ? '-' + result : result
    } catch(err) {
      console.error('Base conversion error:', err)
      return '0'
    }
  },

  /**
   * Get last part of an expression
   * @param expr - Expression to analyze
   * @returns Last part of expression
   */
  getLastExpressionPart(expr: string): string {
    const parts = this.splitExpression(expr)
    return parts[parts.length - 1].trim()
  },

  /**
   * Get the last complete expression part (number or parenthesized expression).
   * Smartly handles nested parentheses and scientific functions.
   * @param expr - Expression to analyze
   * @returns The last expression part or null if none found
   */
  getLastComplexSegment(expr: string): string | null {
    let parenCount = 0

    for (let i = expr.length - 1; i >= 0; i--) {
      const char = expr[i]

      if (char === ')') {
        parenCount++
      } else if (char === '(') {
        parenCount--
        if (parenCount === 0) {
          // Found start of parenthesized group, now look back for function name
          let funcStart = i
          // Look backwards for function names (letters, symbols like √)
          while (funcStart > 0 && /[a-zA-Z√∛πe]/.test(expr[funcStart - 1])) {
            funcStart--
          }
          return expr.substring(funcStart)
        }
      } else if (parenCount === 0 && /[+\-×÷]/.test(char)) {
        break
      }
    }

    const lastNumberMatch = expr.match(/(\d+(?:\.\d+)?)(?!.*\d)/)
    if (lastNumberMatch) {
      return lastNumberMatch[0]
    }

    return null
  },

  /**
   * Check if expression needs parentheses for proper evaluation (has top level operators)
   * @param expr - Expression to check
   * @returns True if expression needs parentheses
   */
  needsParentheses(expr: string): boolean {
    const hasTopLevelOperator = /[+\-×÷]/.test(expr)
    return hasTopLevelOperator
  },

  /**
   * Check if a string is a scientific function
   * @param str - String to check
   * @returns True if string is a scientific function
   */
  isScientificFunction(str: string): str is ScientificFunctionType {
    return BUTTON_TYPES.SCIENTIFIC_FUNCTIONS.includes(str as ScientificFunctionType)
  },

  /**
   * Check if a string is a trigonometric function
   * @param str - String to check
   * @returns True if string is a trigonometric function
   */
  isTrigFunction(str: string): boolean {
    return REGEX.TRIG_FUNCTION.test(str)
  },

  /**
   * Check if a string is a hyperbolic function
   * @param str - String to check
   * @returns True if string is a hyperbolic function
   */
  isHyperbolicFunction(str: string): boolean {
    return REGEX.HYPERBOLIC_FUNCTION.test(str)
  },

  /**
   * Check if a string is a logarithmic function
   * @param str - String to check
   * @returns True if string is a logarithmic function
   */
  isLogFunction(str: string): boolean {
    return REGEX.LOG_FUNCTION.test(str)
  },

  /**
   * Map display function name to internal function name
   * @param displayName - Display name of function
   * @returns Internal function name
   */
  mapFunctionName(displayName: string): string {
    return FUNCTION_MAPPINGS[displayName as keyof typeof FUNCTION_MAPPINGS] || displayName
  },

  /**
   * Validate angle value for trigonometric functions
   * @param value - Angle value to validate
   * @param mode - Angle mode (RAD, DEG, GRAD)
   * @returns True if angle is valid
   */
  isValidAngle(value: number, mode: 'RAD' | 'DEG' | 'GRAD'): boolean {
    if (!isFinite(value)) return false

    switch (mode) {
      case 'RAD':
        return Math.abs(value) <= 2 * Math.PI * 1000 // Allow reasonable range
      case 'DEG':
        return Math.abs(value) <= 360 * 1000 // Allow reasonable range
      case 'GRAD':
        return Math.abs(value) <= 400 * 1000 // Allow reasonable range
      default:
        return true
    }
  },

  /**
   * Convert angle between different modes
   * @param value - Angle value
   * @param fromMode - Source angle mode
   * @param toMode - Target angle mode
   * @returns Converted angle value
   */
  convertAngle(value: number, fromMode: 'RAD' | 'DEG' | 'GRAD', toMode: 'RAD' | 'DEG' | 'GRAD'): number {
    if (fromMode === toMode) return value

    let radians: number
    switch (fromMode) {
      case 'DEG':
        radians = value * Math.PI / 180
        break
      case 'GRAD':
        radians = value * Math.PI / 200
        break
      case 'RAD':
      default:
        radians = value
        break
    }

    switch (toMode) {
      case 'DEG':
        return radians * 180 / Math.PI
      case 'GRAD':
        return radians * 200 / Math.PI
      case 'RAD':
      default:
        return radians
    }
  },

  /**
   * Check if a value is within domain for logarithmic functions
   * @param value - Value to check
   * @returns True if value is valid for logarithm
   */
  isValidForLogarithm(value: number): boolean {
    return isFinite(value) && value > 0
  },

  /**
   * Check if a value is within domain for square root
   * @param value - Value to check
   * @returns True if value is valid for square root
   */
  isValidForSquareRoot(value: number): boolean {
    return isFinite(value) && value >= 0
  },

  /**
   * Check if a value is valid for factorial
   * @param value - Value to check
   * @returns True if value is valid for factorial
   */
  isValidForFactorial(value: number): boolean {
    return isFinite(value) && value >= 0 && Number.isInteger(value) && value <= 170
  },

  /**
   * Check if a multiplication symbol should be added before a number.
   * This handles cases like `π4` or `(5)3`
   * @param currentInput - The current calculator input string.
   * @returns True if a multiplication symbol is needed.
   */
  needsMultiplication(currentInput: string): boolean {
    const trimmedInput = currentInput.trim()
    if (!trimmedInput) return false

    const lastChar = trimmedInput.slice(-1)
    return /[πe)!]/.test(lastChar)
  },

  /**
   * Handle special backspace cases for functions and operators
   * @param currentInput - Current input string
   * @returns Object with handled flag and updated input
   */
  handleSpecialBackspace(currentInput: string): { handled: boolean; input: string } {
    const functionPatterns = [

      /sin\($/, /cos\($/, /tan\($/, /asin\($/, /acos\($/, /atan\($/,
      /csc\($/, /sec\($/, /cot\($/, /acsc\($/, /asec\($/, /acot\($/,

      /sinh\($/, /cosh\($/, /tanh\($/, /asinh\($/, /acosh\($/, /atanh\($/,
      /csch\($/, /sech\($/, /coth\($/, /acsch\($/, /asech\($/, /acoth\($/,

      /log\($/, /ln\($/, /log2\($/, /exp\($/,

      /√\($/, /∛\($/, /nthroot\($/,

      /sqr\($/, /cube\($/, /1\/\($/,

      /abs\($/, /ceil\($/, /floor\($/, /round\($/, /dms\($/, /deg\($/, /gcd\($/, /lcm\($/, /mod$/,

      /10\^\($/, /2\^\($/, /e\^\($/
    ]

    for (const pattern of functionPatterns) {
      if (pattern.test(currentInput)) {
        const match = currentInput.match(pattern)
        if (match) {
          const newInput = currentInput.slice(0, -match[0].length)
          return { handled: true, input: newInput || '0' }
        }
      }
    }

    if (/ [+\-×÷] $/.test(currentInput)) {
      return { handled: true, input: currentInput.slice(0, -3) }
    }

    if (/ mod $/.test(currentInput)) {
      return { handled: true, input: currentInput.slice(0, -5) }
    }

    return { handled: false, input: currentInput }
  }
} as const