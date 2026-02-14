
import type { Base64ServiceType, IBase64Decoder, Base64DecodingOptions, Base64DecodingResult } from '../../types/base64'
import { isValidBase64, normalizeBase64 } from '../../utils/validators/base64Validator'
import { detectMimeType } from '../../utils/detectors/mimeDetector'
import { isBinaryData, hasExcessiveReplacementChars } from '../../utils/detectors/binaryDetector'

/**
 * Service class for decoding Base64 strings to text or binary data.
 */
export class Base64Decoder implements IBase64Decoder {
  readonly serviceType: Base64ServiceType = 'decoder'

  validate(base64: string): boolean {
    return isValidBase64(base64)
  }

  async decode(base64: string, options: Base64DecodingOptions): Promise<Base64DecodingResult> {
    const normalized = normalizeBase64(base64)

    let binString: string
    try {
      binString = atob(normalized)
    } catch {
      return {
        success: false,
        decoded: '',
        binary: new Uint8Array(0),
        mime: null,
        isBinary: false,
        originalSize: base64.length,
        decodedSize: 0
      }
    }
    const len = binString.length
    const bytes = new Uint8Array(len)

    // Unrolling for very small strings isn't necessary in JS engines, but avoiding charCodeAt in a massive loop
    // on the main thread is tricky. For 25MB limits, this basic loop is usually 'okay',
    // but mapping is cleaner.
    for (let i = 0; i < len; i++) {
      bytes[i] = binString.charCodeAt(i)
    }

    const mime = options.detectMimeType ? detectMimeType(bytes) : null

    // Determine binary flag:
    // 1. Explicit mime type detection (e.g. image headers)
    // 2. Statistical analysis of non-printable characters
    let isBinaryContent = !!mime || (options.detectBinary ? isBinaryData(bytes) : false)

    let textOutput = ''
    try {
      // Always attempt text decoding for the text view
      textOutput = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

      // Secondary check: if result has too many replacement chars, it's likely garbage binary displayed as text
      if (!isBinaryContent && hasExcessiveReplacementChars(textOutput)) {
        // We mark it as binary so the UI knows to warn the user
        // But we return the textOutput anyway so "Show Anyway" works
        isBinaryContent = true
      }
    } catch {
      textOutput = ''
    }

    return {
      success: true,
      decoded: textOutput,
      binary: bytes,
      mime,
      isBinary: isBinaryContent,
      originalSize: base64.length,
      decodedSize: bytes.length
    }
  }

  async process(input: string, options: Base64DecodingOptions): Promise<Base64DecodingResult> {
    return this.decode(input, options)
  }
}
