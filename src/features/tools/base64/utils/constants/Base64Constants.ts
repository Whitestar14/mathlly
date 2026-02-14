/**
 * File size limits for Base64 operations
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB in bytes
  WARNING_THRESHOLD: 10 * 1024 * 1024 // 10MB in bytes
} as const

/**
 * MIME type signatures for file detection
 */
export const MIME_SIGNATURES = {
  // Image types
  'image/png': '89504E47',
  'image/jpeg': 'FFD8FF',
  'image/gif': '47494638',
  'image/bmp': '424D',
  'image/webp': '52494646',
  // Document types
  'application/pdf': '25504446',
  'application/zip': '504B0304',
  'application/gzip': '1F8B08',
  // Media types
  'audio/mpeg': '494433',
  'video/mp4': '0000001866747970' // Also supports '0000002066747970'
} as const

/**
 * Binary file extensions
 */
export const BINARY_FILE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.mp3', '.mp4', '.wav', '.avi', '.mov', '.woff', '.woff2',
  '.ttf', '.eot', '.otf', '.bin', '.exe', '.dll', '.so', '.dat'
] as const

/**
 * Thresholds for binary data detection
 */
export const BINARY_DETECTION_THRESHOLDS = {
  NON_PRINTABLE_RATIO: 0.05,
  SAMPLE_SIZE: 1000,
  REPLACEMENT_CHAR_RATIO: 0.1
} as const

/**
 * Error messages for Base64 operations
 */
export const ERROR_MESSAGES = {
  INVALID_BASE64: 'Invalid Base64 format',
  FILE_TOO_LARGE: 'File size exceeds 25MB limit',
  FILE_READ_ERROR: 'Failed to read file',
  PROCESSING_FAILED: 'Processing failed',
  EMPTY_INPUT: 'No input to process',
  INVALID_FORMAT: 'Invalid format specified'
} as const

/**
 * Regular expressions for Base64 validation and processing
 */
export const REGEX = {
  BASE64_STANDARD: /^[A-Za-z0-9+/]*={0,2}$/,
  BASE64_URL_SAFE: /^[A-Za-z0-9_-]*$/,
  WHITESPACE: /\s/g
} as const

/**
 * Valid output formats for Base64 encoding
 */
export const OUTPUT_FORMATS = ['standard', 'url-safe', 'mime'] as const

/**
 * Default line length for MIME format (RFC 2045)
 */
export const DEFAULT_LINE_LENGTH = 76

/**
 * Shared constants for Base64 implementations
 */
export const Base64Constants = {
  /**
   * File size limits
   */
  FILE_SIZE_LIMITS,

  /**
   * MIME type signatures
   */
  MIME_SIGNATURES,

  /**
   * Binary file extensions
   */
  BINARY_FILE_EXTENSIONS,

  /**
   * Binary detection thresholds
   */
  BINARY_DETECTION_THRESHOLDS,

  /**
   * Error messages
   */
  ERROR_MESSAGES,

  /**
   * Regular expressions
   */
  REGEX,

  /**
   * Output formats
   */
  OUTPUT_FORMATS,

  /**
   * Default line length
   */
  DEFAULT_LINE_LENGTH
} as const

export type ErrorMessageType = keyof typeof ERROR_MESSAGES
export type OutputFormatType = typeof OUTPUT_FORMATS[number]
export type BinaryFileExtensionType = typeof BINARY_FILE_EXTENSIONS[number]
export type MimeSignatureType = keyof typeof MIME_SIGNATURES
