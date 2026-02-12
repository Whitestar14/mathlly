import { Base64Constants } from '../constants/Base64Constants'

/**
 * Determines if binary data contains mostly non-printable characters.
 * @param bytes - The binary data to analyze
 * @returns true if data appears binary, false otherwise
 */
export function isBinaryData(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return false
  // Check for control characters (excluding whitespace)
  let nonPrintable = 0
  const checkLen = Math.min(bytes.length, Base64Constants.BINARY_DETECTION_THRESHOLDS.SAMPLE_SIZE)
  for (let i = 0; i < checkLen; i++) {
    const b = bytes[i]
    if ((b < 32 && b !== 9 && b !== 10 && b !== 13) || b === 127) {
      nonPrintable++
    }
  }
  return (nonPrintable / checkLen) > Base64Constants.BINARY_DETECTION_THRESHOLDS.NON_PRINTABLE_RATIO
}
/**
 * Checks if decoded text contains too many Unicode replacement characters (\uFFFD).
 * Used to determine if binary data was incorrectly decoded as text.
 * @param text - The decoded text to check
 * @returns true if excessive replacement characters are found, false otherwise
 */
export function hasExcessiveReplacementChars(text: string): boolean {
  if (text.length === 0) return false
  const count = (text.match(/\uFFFD/g) || []).length
  return count / text.length > Base64Constants.BINARY_DETECTION_THRESHOLDS.REPLACEMENT_CHAR_RATIO
}

/**
 * Combines multiple detection methods for comprehensive binary content detection.
 * @param bytes - The binary data to analyze
 * @param mimeType - Optional MIME type detected from the data
 * @returns true if content appears binary, false otherwise
 */
const TEXT_MIME_PREFIXES = ['text/', 'application/json', 'application/xml', 'application/javascript']

function isBinaryMimeType(mimeType: string): boolean {
  return !TEXT_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix))
}

export function isBinaryContent(bytes: Uint8Array, mimeType?: string | null): boolean {
  // Check if MIME type indicates binary content
  if (mimeType) return isBinaryMimeType(mimeType)
  // Return true if binary data detection returns true
  return isBinaryData(bytes)
}