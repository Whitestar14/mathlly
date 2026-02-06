import type { Base64ServiceType, IBase64Decoder, Base64DecodingOptions, Base64DecodingResult } from '../../types/base64'

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
    if (!base64.trim()) return true
    try {
      const s = base64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')
      if (s.length % 4 !== 0) return false
      atob(s)
      return true
    } catch {
      return false
    }
  }

  /**
   * Decodes a Base64 string to text or binary data.
   * @param base64 - The Base64 string to decode
   * @param options - Decoding options for detection features
   * @returns Promise resolving to decoding result with text, binary data, and metadata
   */
  async decode(base64: string, options: Base64DecodingOptions): Promise<Base64DecodingResult> {
    let s = base64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')
    while (s.length % 4 !== 0) s += '='
    
    const binString = atob(s)
    const len = binString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binString.charCodeAt(i)
    }

    const mime = options.detectMimeType ? this.detectMimeType(bytes) : null
    const binaryFlag = options.detectBinary ? this.isBinaryData(bytes) || !!mime : false

    let textOutput = ''
    try {
      // Decode as text for display if possible
      textOutput = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
      
      // If result looks binary (lots of replacement chars), don't show it in text area
      const replacementCount = (textOutput.match(/\uFFFD/g) || []).length
      if (replacementCount > textOutput.length * 0.1) {
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

  /**
   * Detects MIME type from binary data signature.
   * @private
   * @param bytes - The binary data to analyze
   * @returns Detected MIME type or null
   */
  private detectMimeType(bytes: Uint8Array): string | null {
    const signature = bytes.slice(0, 8).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0').toUpperCase(), '')
    
    // Common Signatures
    if (signature.startsWith('89504E47')) return 'image/png'
    if (signature.startsWith('FFD8FF')) return 'image/jpeg'
    if (signature.startsWith('47494638')) return 'image/gif'
    if (signature.startsWith('424D')) return 'image/bmp'
    if (signature.startsWith('52494646') && bytes.slice(8, 12).reduce((acc, b) => acc + String.fromCharCode(b), '') === 'WEBP') return 'image/webp'
    if (signature.startsWith('25504446')) return 'application/pdf'
    if (signature.startsWith('504B0304')) return 'application/zip'
    if (signature.startsWith('1F8B08')) return 'application/gzip'
    if (signature.startsWith('494433')) return 'audio/mp3'
    if (signature.startsWith('0000001866747970') || signature.startsWith('0000002066747970')) return 'video/mp4'

    return null
  }

  /**
   * Determines if binary data contains mostly non-printable characters.
   * @private
   * @param bytes - The binary data to analyze
   * @returns true if data appears binary, false otherwise
   */
  private isBinaryData(bytes: Uint8Array): boolean {
    // Check for control characters (excluding whitespace)
    let nonPrintable = 0
    const checkLen = Math.min(bytes.length, 1000)
    for (let i = 0; i < checkLen; i++) {
      const b = bytes[i]
      if ((b < 32 && b !== 9 && b !== 10 && b !== 13) || b === 127) {
        nonPrintable++
      }
    }
    return (nonPrintable / checkLen) > 0.05
  }
}