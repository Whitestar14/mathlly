import { Base64Constants } from '../constants/Base64Constants'

/**
 * Validates if a string is valid Base64 format based on the specified format.
 * @param input - The Base64 string to validate
 * @param format - The format to validate against ('standard' or 'url-safe')
 * @returns true if valid or empty, false otherwise
 */
export function isValidBase64(input: string, format: 'standard' | 'url-safe' = 'standard'): boolean {
  if (!input.trim()) return true

  try {
    const clean = input.replace(Base64Constants.REGEX.WHITESPACE, '')
    const normalized = clean.replace(/-/g, '+').replace(/_/g, '/')

    if (format === 'standard') {
      if (!Base64Constants.REGEX.BASE64_STANDARD.test(clean)) return false
      if (normalized.length % 4 !== 0) return false
    } else {
      if (!Base64Constants.REGEX.BASE64_URL_SAFE.test(clean)) return false
    }

    atob(normalized)
    return true
  } catch {
    return false
  }
}

/**
 * Higher-level validation that returns detailed error information.
 * @param input - The Base64 string to validate
 * @param options - Validation options
 * @returns Object with validation result and optional error message
 */
export function validateBase64Input(
  input: string,
  options: { allowEmpty?: boolean; format?: 'standard' | 'url-safe' } = {}
): { valid: boolean; error?: string } {
  const { allowEmpty = true, format = 'standard' } = options

  if (!allowEmpty && !input.trim()) {
    return { valid: false, error: Base64Constants.ERROR_MESSAGES.EMPTY_INPUT }
  }

  if (!isValidBase64(input, format)) {
    return { valid: false, error: Base64Constants.ERROR_MESSAGES.INVALID_BASE64 }
  }

  return { valid: true }
}

/**
 * Normalizes a Base64 string by removing whitespace, converting URL-safe characters to standard, and adding padding.
 * @param input - The Base64 string to normalize
 * @returns Normalized Base64 string ready for decoding
 */
export function normalizeBase64(input: string): string {
  let normalized = input.replace(Base64Constants.REGEX.WHITESPACE, '').replace(/-/g, '+').replace(/_/g, '/')
  while (normalized.length % 4 !== 0) {
    normalized += '='
  }
  return normalized
}