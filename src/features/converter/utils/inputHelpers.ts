/**
 * Utility functions for handling numpad input and value manipulation in the converter.
 */

/**
 * Appends a digit (0-9) to the current value.
 * Handles leading zeros by replacing '0' with the digit unless a decimal point exists.
 * @param currentValue The current input value as a string.
 * @param digit The digit to append (0-9).
 * @returns The new value string.
 */
export function appendDigit(currentValue: string, digit: string): string {
  if (currentValue === '0' && !hasDecimalPoint(currentValue)) {
    return digit
  }
  return currentValue + digit
}

/**
 * Adds a decimal point to the current value if not already present.
 * @param currentValue The current input value as a string.
 * @returns The value with a decimal point appended if not present.
 */
export function appendDecimal(currentValue: string): string {
  if (hasDecimalPoint(currentValue)) {
    return currentValue
  }
  return currentValue + '.'
}

/**
 * Removes the last character from the value.
 * Returns '0' if the value becomes empty.
 * @param currentValue The current input value as a string.
 * @returns The value with the last character removed.
 */
export function removeLastCharacter(currentValue: string): string {
  if (currentValue.length <= 1) {
    return '0'
  }
  return currentValue.slice(0, -1)
}

/**
 * Clears the entry and returns the default value.
 * @returns '0'.
 */
export function clearEntry(): string {
  return '0'
}

/**
 * Validates that the input is a valid number format.
 * Allows negative numbers, decimals, and scientific notation.
 * @param value The value to validate.
 * @returns True if valid, false otherwise.
 */
export function validateNumericInput(value: string): boolean {
  // Regex to match valid numbers: optional negative sign, digits, optional decimal, optional scientific notation
  const numberRegex = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/
  return numberRegex.test(value.trim())
}

/**
 * Formats the input value for display.
 * Truncates if exceeds max length, handles empty or invalid formats.
 * @param value The value to format.
 * @param maxLength Maximum allowed length (default 15).
 * @returns The formatted value.
 */
export function formatInputValue(value: string, maxLength: number = 15): string {
  if (!value || value.trim() === '') {
    return '0'
  }
  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength)
  }
  return trimmed
}

/**
 * Checks if the value contains a decimal point.
 * @param value The value to check.
 * @returns True if a decimal point is present.
 */
export function hasDecimalPoint(value: string): boolean {
  return value.includes('.')
}

/**
 * Checks if the value has reached the maximum length.
 * @param value The value to check.
 * @param maxLength Maximum allowed length (default 15).
 * @returns True if max length is reached.
 */
export function isMaxLengthReached(value: string, maxLength: number = 15): boolean {
  return value.length >= maxLength
}