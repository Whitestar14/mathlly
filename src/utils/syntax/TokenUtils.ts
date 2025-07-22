import { CalculatorConstants } from '@/utils/constants/CalculatorConstants'

export interface Token {
  type: string
  content: string
  parentLevel?: number
}

export type TokenType = 
  | 'number'
  | 'operator'
  | 'function'
  | 'parenthesis'
  | 'constant'
  | 'decimal'
  | 'space'
  | 'text'
  | 'open'
  | 'close'
  | 'ghost'

/**
 * Utility class for token type classification and validation
 */
export class TokenUtils {
  private static readonly REGEX = CalculatorConstants.REGEX
  private static readonly BUTTON_TYPES = CalculatorConstants.BUTTON_TYPES

  /**
   * Check if character is a number (including hex digits)
   */
  static isNumber(char: string): boolean {
    return this.REGEX.NUMBER.test(char)
  }

  /**
   * Check if character is a decimal point
   */
  static isDecimal(char: string): boolean {
    return char === '.'
  }

  /**
   * Check if character is a standard operator
   */
  static isStandardOperator(char: string): boolean {
    return this.BUTTON_TYPES.OPERATORS.includes(char as any)
  }

  /**
   * Check if character is a programmer operator
   */
  static isProgrammerOperator(char: string): boolean {
    return this.BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(char as any)
  }

  /**
   * Check if character sequence is a shift operator
   */
  static isShiftOperator(char: string, nextChar?: string): boolean {
    return (char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')
  }

  /**
   * Check if character is a parenthesis or absolute value bar
   */
  static isParenthesis(char: string): boolean {
    return '()|'.includes(char)
  }

  /**
   * Check if character is a scientific constant
   */
  static isScientificConstant(char: string): boolean {
    return char === 'π' || char === 'e'
  }

  /**
   * Check if character is a scientific symbol
   */
  static isScientificSymbol(char: string): boolean {
    return '√∛'.includes(char)
  }

  /**
   * Check if character is a scientific operator
   */
  static isScientificOperator(char: string): boolean {
    return '^!'.includes(char)
  }

  /**
   * Check if character is whitespace
   */
  static isWhitespace(char: string): boolean {
    return char === ' '
  }

  /**
   * Create a token with proper type classification
   */
  static createToken(content: string, type: TokenType, parentLevel?: number): Token {
    return {
      type,
      content,
      ...(parentLevel !== undefined && { parentLevel })
    }
  }
}
