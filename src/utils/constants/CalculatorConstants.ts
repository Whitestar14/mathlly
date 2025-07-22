import { bignumber } from 'mathjs'

/**
 * Numeric bases enumeration
 */
export const BASES = {
  BIN: 2,
  OCT: 8,
  DEC: 10,
  HEX: 16
} as const

/**
 * Button categories for calculator operations
 */
export const BUTTON_TYPES = {
  OPERATORS: ['+', '-', '×', '÷', '%'] as const,
  FUNCTIONS: ['AC', 'CE', 'backspace', '=', '±'] as const,
  MEMORY: ['MC', 'MR', 'M+', 'M-', 'MS'] as const,
  PROGRAMMER_OPERATORS: ['<<', '>>', '&', '|', '^', '~'] as const,
  SCIENTIFIC_FUNCTIONS: [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'csc', 'sec', 'cot', 'acsc', 'asec', 'acot',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'csch', 'sech', 'coth', 'acsch', 'asech', 'acoth',
    'log', 'ln', 'log2', 'log10', 'exp',
    '10^x', '2^x', 'e^x', 'x^y', 'x²', 'x³',
    '√', '∛', 'y√x', 'nthroot', 'sqrt', 'cbrt', 'cube',
    'abs', 'ceil', 'floor', 'round', 'factorial', '1/x',
    'rand', 'gcd', 'lcm', 'mod', 'dms', 'deg',
    'n!', '|x|'
  ] as const
} as const

/**
 * Regular expressions for input validation and parsing
 */
export const REGEX = {
  OPERATOR: /[+\-×÷%]/,
  NUMBER: /[0-9A-Fa-f.]/,
  VALID_EXPRESSION: /^[0-9A-Fa-f\s+\-*/%()<<>>]*$/,
  LAST_OPERATOR: /\s*[+\-×÷%<<>>]\s*$/,
  DECIMAL_POINT: /\./,
  SHIFT_OPERATOR: /\s*[<>]{2}\s*$/,
  PARENTHESIS: /[()]/,
  SCIENTIFIC_FUNCTION: /^(sin|cos|tan|asin|acos|atan|csc|sec|cot|acsc|asec|acot|sinh|cosh|tanh|asinh|acosh|atanh|csch|sech|coth|acsch|asech|acoth|log|ln|log2|log10|exp|sqrt|cbrt|cube|nthroot|abs|ceil|floor|round|factorial|gcd|lcm)\(/,
  TRIG_FUNCTION: /^(sin|cos|tan|asin|acos|atan|csc|sec|cot|acsc|asec|acot)\(/,
  HYPERBOLIC_FUNCTION: /^(sinh|cosh|tanh|asinh|acosh|atanh|csch|sech|coth|acsch|asech|acoth)\(/,
  LOG_FUNCTION: /^(log|ln|log2|log10|exp)\(/,
  POWER_FUNCTION: /\^/,
  FACTORIAL: /\d+!/,
  CONSTANT: /^[πe]$/,
  ABSOLUTE_VALUE: /\|.*\|/
} as const

/**
 * Error messages for calculator operations
 */
export const ERROR_MESSAGES = {
  OVERFLOW: "Overflow: Evaluated result exceeding max limit",
  DIVISION_BY_ZERO: "Division by zero is not allowed",
  INVALID_EXPRESSION: "Invalid expression format",
  MAX_INPUT_LENGTH: "Maximum input length reached",
  NEGATIVE_SQUARE_ROOT: "Cannot calculate square root of negative number",
  OPERATION_ERROR: "Operation error",
  INVALID_BASE: "Invalid base for conversion",
  DOMAIN_ERROR: "Domain error: Invalid input for function",
  INVALID_ANGLE: "Invalid angle value",
  INVALID_LOGARITHM: "Cannot calculate logarithm of non-positive number"
} as const

/**
 * Function name mappings for display to internal representation
 */
export const FUNCTION_MAPPINGS = {
  'sin⁻¹': 'asin',
  'cos⁻¹': 'acos',
  'tan⁻¹': 'atan',
  'csc⁻¹': 'acsc',
  'sec⁻¹': 'asec',
  'cot⁻¹': 'acot',
  'sinh⁻¹': 'asinh',
  'cosh⁻¹': 'acosh',
  'tanh⁻¹': 'atanh',
  'csch⁻¹': 'acsch',
  'sech⁻¹': 'asech',
  'coth⁻¹': 'acoth',  
  'log₂': 'log2',
  'exp': 'exp',
  '10ˣ': '10^x',
  '2ˣ': '2^x',
  'eˣ': 'e^x',
  'ln': 'ln',    
  '²√x': '√',
  '³√x': '∛',
  'ʸ√x': 'y√x',
  'y√x': 'y√x',
  '¹⁄ₓ': '1/x',
  'xʸ': 'x^y',
  '⌈x⌉': 'ceil',
  '⌊x⌋': 'floor',
  '→DMS': 'dms',
  '→DEG': 'deg',
  'n!': 'n!',
  '|x|': 'abs'
} as const

/**
 * Shared constants for calculator implementations
 */
export const CalculatorConstants = {
  /**
   * Maximum value (63-bit signed integer limit)
   */
  MAX_VALUE: bignumber("9223372036854775807"),
  
  /**
   * Minimum value (63-bit signed integer limit)
   */
  MIN_VALUE: bignumber("-9223372036854775808"),
  
  /**
   * Numeric bases
   */
  BASES,
  
  /**
   * Input length limits
   */
  MAX_INPUT_LENGTH: {
    STANDARD: 100,
    SCIENTIFIC: 120,
    PROGRAMMER: 69
  } as const,
  
  /**
   * Button categories
   */
  BUTTON_TYPES,
  
  /**
   * Regular expressions
   */
  REGEX,
  
  /**
   * Error messages
   */
  ERROR_MESSAGES,

  /**
   * Function mappings
   */
  FUNCTION_MAPPINGS
} as const

// Type definitions
export type BaseType = keyof typeof BASES
export type OperatorType = typeof BUTTON_TYPES.OPERATORS[number]
export type FunctionType = typeof BUTTON_TYPES.FUNCTIONS[number]
export type MemoryType = typeof BUTTON_TYPES.MEMORY[number]
export type ProgrammerOperatorType = typeof BUTTON_TYPES.PROGRAMMER_OPERATORS[number]
export type ScientificFunctionType = typeof BUTTON_TYPES.SCIENTIFIC_FUNCTIONS[number]
export type ErrorMessageType = keyof typeof ERROR_MESSAGES
