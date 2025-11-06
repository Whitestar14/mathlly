/**
 * Constants for the converter feature
 */
export const ConverterConstants = {
  /**
   * Maximum value allowed for conversions to prevent overflow
   */
  MAX_CONVERSION_VALUE: 1e15,

  /**
   * Minimum value allowed for conversions
   */
  MIN_CONVERSION_VALUE: -1e15,

  /**
   * Default decimal precision
   */
  DEFAULT_PRECISION: 4,

  /**
   * Maximum allowed precision
   */
  MAX_PRECISION: 10,

  /**
   * Minimum allowed precision
   */
  MIN_PRECISION: 0,

  /**
   * Size of the conversion cache
   */
  CACHE_SIZE: 200,

  /**
   * Default base font size for CSS units
   */
  DEFAULT_BASE_FONT_SIZE: 16,

  /**
   * Minimum allowed base font size in pixels
   */
  MIN_BASE_FONT_SIZE: 4,

  /**
   * Maximum allowed base font size in pixels
   */
  MAX_BASE_FONT_SIZE: 128,

  /**
   * Default viewport width for vh/vw conversions
   */
  DEFAULT_VIEWPORT_WIDTH: 1920,

  /**
   * Default viewport height for vh/vw conversions
   */
  DEFAULT_VIEWPORT_HEIGHT: 1080,

  /**
   * Standard CSS DPI for absolute unit conversions (pt, cm, mm, in)
   */
  CSS_DPI: 96,

  /**
   * Maximum number of characters allowed in input field
   */
  MAX_INPUT_LENGTH: 15,

  /**
   * Default value when input is cleared
   */
  DEFAULT_INPUT_VALUE: '0',

  /**
   * Decimal point character
   */
  DECIMAL_POINT: '.',

  /**
   * Error messages for converter operations
   */
  ERROR_MESSAGES: {
    INVALID_VALUE: 'Invalid input value',
    INVALID_UNIT: 'Invalid unit specified',
    INCOMPATIBLE_UNITS: 'Cannot convert between these units',
    OVERFLOW: 'Value too large for conversion',
    UNDERFLOW: 'Value too small for conversion',
    CONVERSION_FAILED: 'Conversion failed',
    UNIT_NOT_FOUND: 'Unit not found in converter configuration',
    CONVERTER_NOT_REGISTERED: 'Converter type is not registered',
    EMPTY_INPUT: 'Please enter a value to convert',
    INVALID_BASE_FONT_SIZE: 'Base font size must be between 4 and 128 pixels',
    INVALID_VIEWPORT_DIMENSIONS: 'Viewport dimensions must be positive numbers',
    MAX_LENGTH_EXCEEDED: 'Maximum input length exceeded',
    INVALID_INPUT_FORMAT: 'Invalid number format',
    DECIMAL_ALREADY_EXISTS: 'Decimal point already exists'
  } as const
} as const

export type ErrorMessageType = keyof typeof ConverterConstants.ERROR_MESSAGES
