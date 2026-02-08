import type { Base64ServiceType, IBase64Decoder, Base64DecodingOptions, Base64DecodingResult } from '../../types/base64'
import { isValidBase64, normalizeBase64 } from '../../utils/validators/base64Validator'
import { detectMimeType } from '../../utils/detectors/mimeDetector'
import { isBinaryData, hasExcessiveReplacementChars } from '../../utils/detectors/binaryDetector'

/**
 * Service class for decoding Base64 strings to text or binary data.
 * Handles validation, MIME type detection, and binary data identification.
 */
export class Base64Decoder implements IBase64Decoder {
  readonly serviceType: Base64ServiceType = 'decoder'

  /**
   * Validates if a string is valid Base64 format.
   * @param base64 - The Base64 string to validate
   * @returns true if valid or empty, false otherwise
   */
  validate(base64: string): boolean {
    return isValidBase64(base64)
  }

  /**
   * Decodes a Base64 string to text or binary data.
   * @param base64 - The Base64 string to decode
   * @param options - Decoding options for detection features
   * @returns Promise resolving to decoding result with text, binary data, and metadata
   */
  async decode(base64: string, options: Base64DecodingOptions): Promise<Base64DecodingResult> {
    const normalized = normalizeBase64(base64)
    
    const binString = atob(normalized)
    const len = binString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binString.charCodeAt(i)
    }

    const mime = options.detectMimeType ? detectMimeType(bytes) : null
    const binaryFlag = options.detectBinary ? isBinaryData(bytes) || !!mime : false

    let textOutput = ''
    try {
      // Decode as text for display if possible
      textOutput = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
      
      // If result looks binary (lots of replacement chars), don't show it in text area
      if (hasExcessiveReplacementChars(textOutput)) {
        textOutput = ''
      }
    } catch {
      textOutput = ''
    }

    return {
      success: true,
      decoded: textOutput,
      binary: bytes,
      mime,
      isBinary: binaryFlag,
      originalSize: base64.length,
      decodedSize: bytes.length
    }
  }

  /**
   * Processes input using the decode method for interface compliance.
   * @param input - The Base64 string to process
   * @param options - Decoding options
   * @returns Promise resolving to decoding result
   */
  async process(input: string, options: Base64DecodingOptions): Promise<Base64DecodingResult> {
    return this.decode(input, options)
  }
}