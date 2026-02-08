import { isValidBase64, validateBase64Input, normalizeBase64 } from './validators/base64Validator'
import { detectMimeType } from './detectors/mimeDetector'
import { isBinaryData, isBinaryContent } from './detectors/binaryDetector'
import { isBinaryExtension } from './detectors/fileExtensionDetector'
import { applyFormat, chunkString, formatFileSize } from './formatters/base64Formatter'
import { validateFileSize, generateDownloadFilename, downloadBlob } from './helpers/fileHelpers'

/**
 * Standardized result type for Base64 processing operations
 */
export interface Base64ProcessingResult {
  success: boolean
  output?: string
  error?: string
  [key: string]: any
}

/**
 * Utility functions for Base64 operations
 */
export const Base64Utils = {
  // Re-exported validator functions
  isValidBase64,
  validateBase64Input,
  normalizeBase64,

  // Re-exported detector functions
  detectMimeType,
  isBinaryData,
  isBinaryContent,
  isBinaryExtension,

  // Re-exported formatter functions
  applyFormat,
  chunkString,
  formatFileSize,

  // Re-exported helper functions
  validateFileSize,
  generateDownloadFilename,
  downloadBlob,

  /**
   * Create a standardized response object for Base64 operations
   * @param data - Response data
   * @returns Standardized response
   */
  createResponse<T = any>(data: { success: boolean; output?: string; error?: string; [key: string]: any }): Base64ProcessingResult {
    return {
      success: data.success,
      output: data.output || '',
      error: data.error || '',
      ...data
    }
  },

  /**
   * Format error messages consistently
   * @param error - Error object or string
   * @param defaultMessage - Default message if no error
   * @returns Formatted error message
   */
  formatError(error: Error | string | null | undefined, defaultMessage: string = 'Processing failed'): string {
    if (!error) return defaultMessage

    const errorMessage = typeof error === 'string' ? error : error.message
    return errorMessage || defaultMessage
  }
} as const