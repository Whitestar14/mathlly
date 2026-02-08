import { Base64Constants } from '../constants/Base64Constants'
import { normalizeBase64 } from '../validators/base64Validator'

/**
 * Splits a string into chunks of specified length and joins them with newline characters.
 * @param str - The string to chunk
 * @param length - The length of each chunk (defaults to DEFAULT_LINE_LENGTH)
 * @returns The chunked string
 */
export function chunkString(str: string, length: number = Base64Constants.DEFAULT_LINE_LENGTH): string {
  const chunks = []
  for (let i = 0; i < str.length; i += length) {
    chunks.push(str.slice(i, i + length))
  }
  return chunks.join('\n')
}

/**
 * Applies formatting to a Base64 string based on the specified format.
 * @param base64 - The Base64 string to format
 * @param format - The output format ('standard', 'url-safe', or 'mime')
 * @param lineLength - The line length for MIME format (optional, defaults to DEFAULT_LINE_LENGTH)
 * @returns The formatted Base64 string
 */
export function applyFormat(base64: string, format: 'standard' | 'url-safe' | 'mime', lineLength?: number): string {
  if (format === 'url-safe') {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } else if (format === 'mime') {
    return chunkString(base64, lineLength || Base64Constants.DEFAULT_LINE_LENGTH)
  }
  return base64
}

/**
 * Removes formatting from a Base64 string, normalizing it for processing.
 * @param base64 - The Base64 string to clean
 * @returns The cleaned Base64 string ready for processing
 */
export function removeFormatting(base64: string): string {
  return normalizeBase64(base64)
}

/**
 * Formats a byte size into a human-readable string.
 * @param bytes - The size in bytes
 * @returns Human-readable size string (e.g., '1.5 KB', '2.3 MB')
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  const size = bytes / Math.pow(k, i)
  return `${size.toFixed(1)} ${units[i]}`
}