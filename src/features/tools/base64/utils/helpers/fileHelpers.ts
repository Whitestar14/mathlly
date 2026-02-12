import { FILE_SIZE_LIMITS, ERROR_MESSAGES } from '../constants/Base64Constants'
import { getDefaultMimeType } from '../detectors/mimeDetector'

/**
 * Validates file size against limits.
 * @param size - File size in bytes
 * @returns Validation result with optional error and warning flags
 */
export function validateFileSize(size: number): { valid: boolean; error?: string; warning?: boolean } {
  if (size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE }
  }
  const warning = size > FILE_SIZE_LIMITS.WARNING_THRESHOLD
  return { valid: true, warning }
}

/**
 * Checks if file size exceeds warning threshold but not max limit.
 * @param size - File size in bytes
 * @returns True if size is in warning range
 */
export function isFileSizeWarning(size: number): boolean {
  return size > FILE_SIZE_LIMITS.WARNING_THRESHOLD && size <= FILE_SIZE_LIMITS.MAX_FILE_SIZE
}

/**
 * Generates a download filename based on operation type.
 * @param tab - Operation type ('encode' or 'decode')
 * @param extension - Optional file extension for decode
 * @returns Generated filename
 */
export function generateDownloadFilename(tab: 'encode' | 'decode', extension?: string): string {
  const timestamp = Date.now()
  if (tab === 'encode') {
    return `encoded_${timestamp}.txt`
  } else {
    return `decoded_${timestamp}.${extension || 'txt'}`
  }
}

/**
 * Creates a Blob from binary data.
 * @param binary - Binary data as Uint8Array
 * @param mimeType - Optional MIME type
 * @returns Blob object
 */
export function createBlobFromBinary(binary: Uint8Array, mimeType?: string): Blob {
  return new Blob([binary], { type: mimeType || getDefaultMimeType() })
}

/**
 * Creates a Blob from text data.
 * @param text - Text content
 * @returns Blob object
 */
export function createBlobFromText(text: string): Blob {
  return new Blob([text], { type: 'text/plain' })
}

/**
 * Downloads a Blob as a file.
 * @param blob - Blob to download
 * @param filename - Download filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}