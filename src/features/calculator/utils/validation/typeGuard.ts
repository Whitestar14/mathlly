import type { CalculatorMode, Base } from '@calculator/composables/useCalculatorState'

/**
 * Type guard to check if a string is a valid CalculatorMode
 */
export function isValidCalculatorMode(mode: string): mode is CalculatorMode {
  return ['Standard', 'Scientific', 'Programmer'].includes(mode)
}

/**
 * Type guard to check if a string is a valid Base
 */
export function isValidBase(base: string): base is Base {
  return ['DEC', 'BIN', 'HEX', 'OCT'].includes(base)
}

/**
 * Safely convert a string to CalculatorMode with fallback
 */
export function toCalculatorMode(mode: string, fallback: CalculatorMode = 'Standard'): CalculatorMode {
  return isValidCalculatorMode(mode) ? mode : fallback
}

/**
 * Safely convert a string to Base with fallback
 */
export function toBase(base: string, fallback: Base = 'DEC'): Base {
  return isValidBase(base) ? base : fallback
}

/**
 * Type guard to check if an object has calculator-like properties
 */
export function hasCalculatorInterface(obj: any): obj is { input: string; currentExpression: string } {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.input === 'string' &&
         typeof obj.currentExpression === 'string'
}

/**
 * Type guard to check if a calculator has programmer-specific methods
 */
export function isProgrammerCalculatorLike(obj: any): boolean {
  return obj &&
         typeof obj === 'object' &&
         'handleBaseChange' in obj &&
         'updateDisplayValues' in obj &&
         'states' in obj
}

/**
 * Validate and sanitize calculator mode from unknown source
 */
export function validateCalculatorMode(input: unknown): CalculatorMode {
  if (typeof input === 'string' && isValidCalculatorMode(input)) {
    return input
  }
  console.warn(`Invalid calculator mode: ${input}. Using default 'Standard'.`)
  return 'Standard'
}

/**
 * Validate and sanitize base from unknown source
 */
export function validateBase(input: unknown): Base {
  if (typeof input === 'string' && isValidBase(input)) {
    return input
  }
  console.warn(`Invalid base: ${input}. Using default 'DEC'.`)
  return 'DEC'
}
