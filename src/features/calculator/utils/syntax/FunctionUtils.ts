import { CalculatorConstants } from '../constants/CalculatorConstants'

/**
 * Utility class for handling scientific functions and function detection
 */
export class FunctionUtils {
  /**
   * All scientific function names ordered by length (longest first for proper matching)
   */
  private static readonly SCIENTIFIC_FUNCTIONS = CalculatorConstants.BUTTON_TYPES.SCIENTIFIC_FUNCTIONS

  /**
   * Extract the modulo operator if present at current position
   */
  static extractModulo(text: string, index: number): string | null {
    const substr = text.substr(index, 3)
    return substr === 'mod' ? 'mod' : null
  }

  /**
   * Check if current position starts a scientific function
   */
  static isScientificFunction(text: string, index: number): boolean {
    return this.SCIENTIFIC_FUNCTIONS.some(func => {
      const substr = text.substr(index, func.length)
      const nextChar = text[index + func.length]
      // Make sure it's a complete function name (followed by '(' or end of string or space)
      return substr === func && this.isValidFunctionTerminator(nextChar)
    })
  }

  /**
   * Extract function name from current position
   */
  static extractFunction(text: string, index: number): string {
    // Check functions in order of length (longest first) to avoid partial matches
    for (const func of this.SCIENTIFIC_FUNCTIONS) {
      const substr = text.substr(index, func.length)
      const nextChar = text[index + func.length]
      
      if (substr === func && this.isValidFunctionTerminator(nextChar)) {
        return func
      }
    }
    
    // Fallback to single character if no function found
    return text[index]
  }

  /**
   * Check if a character is a valid function terminator
   */
  private static isValidFunctionTerminator(char: string | undefined): boolean {
    return char === '(' || char === undefined || char === ' '
  }

  /**
   * Get function display name from internal name using mappings
   */
  static getFunctionDisplayName(internalName: string): string {
    // Reverse lookup in function mappings
    const mappings = CalculatorConstants.FUNCTION_MAPPINGS
    for (const [display, internal] of Object.entries(mappings)) {
      if (internal === internalName) {
        return display
      }
    }
    return internalName
  }

  /**
   * Check if function is trigonometric
   */
  static isTrigFunction(funcName: string): boolean {
    return CalculatorConstants.REGEX.TRIG_FUNCTION.test(`${funcName}(`)
  }

  /**
   * Check if function is hyperbolic
   */
  static isHyperbolicFunction(funcName: string): boolean {
    return CalculatorConstants.REGEX.HYPERBOLIC_FUNCTION.test(`${funcName}(`)
  }

  /**
   * Check if function is logarithmic
   */
  static isLogFunction(funcName: string): boolean {
    return CalculatorConstants.REGEX.LOG_FUNCTION.test(`${funcName}(`)
  }
}
