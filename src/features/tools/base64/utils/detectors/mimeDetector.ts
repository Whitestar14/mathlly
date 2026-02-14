import { MIME_SIGNATURES } from '../constants/Base64Constants'

/**
 * Detects MIME type from binary data signature.
 * @param bytes - The binary data to analyze
 * @returns Detected MIME type or null if unknown
 */
export function detectMimeType(bytes: Uint8Array): string | null {
  const signature = bytes.slice(0, 8).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0').toUpperCase(), '')

  // Check against known signatures
  for (const [mimeType, sig] of Object.entries(MIME_SIGNATURES)) {
    if (signature.startsWith(sig)) {
      // Special case for WEBP
      if (mimeType === 'image/webp') {
        const webpCheck = bytes.slice(8, 12).reduce((acc, b) => acc + String.fromCharCode(b), '')
        if (webpCheck !== 'WEBP') continue
      }
      // Special case for MP4 (supports two signatures)
      if (mimeType === 'video/mp4') {
        if (!signature.startsWith('0000001866747970') && !signature.startsWith('0000002066747970')) continue
      }
      return mimeType
    }
  }

  return null
}

/**
 * Extracts file extension from MIME type.
 * @param mimeType - The MIME type string
 * @returns File extension without dot, defaults to 'bin' for unknown types
 */
export function getMimeTypeExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/gzip': 'gz',
    'audio/mpeg': 'mp3',
    'video/mp4': 'mp4'
  }

  // Handle compound MIME types (e.g., 'image/svg+xml' -> 'svg')
  const baseType = mimeType.split('/')[1]?.split('+')[0] || ''
  return mimeToExt[mimeType] || baseType || 'bin'
}

/**
 * Checks if a MIME type is supported based on known signatures.
 * @param mimeType - The MIME type to check
 * @returns True if supported, false otherwise
 */
export function isSupportedMimeType(mimeType: string): boolean {
  return mimeType in MIME_SIGNATURES
}

/**
 * Returns the default MIME type for unknown binary data.
 * @returns Default MIME type string
 */
export function getDefaultMimeType(): string {
  return 'application/octet-stream'
}
