import { Base64Constants } from '../constants/Base64Constants'

/**
 * Checks if the filename has a binary file extension
 * @param filename - The filename to check
 * @returns true if the extension is in the binary extensions list, false otherwise
 */
export function isBinaryExtension(filename: string): boolean {
  const extension = getFileExtension(filename).toLowerCase()
  return Base64Constants.BINARY_FILE_EXTENSIONS.some(ext => ext.toLowerCase() === extension)
}

/**
 * Extracts the file extension from a filename
 * @param filename - The filename to extract extension from
 * @returns The extension with dot (e.g., '.png') or empty string if no extension
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return ''
  }
  return filename.substring(lastDotIndex)
}

/**
 * Checks if the filename has an image file extension
 * @param filename - The filename to check
 * @returns true if the extension is an image extension, false otherwise
 */
export function isImageExtension(filename: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff']
  const extension = getFileExtension(filename).toLowerCase()
  return imageExtensions.includes(extension)
}

/**
 * Checks if the filename has a media file extension (audio/video)
 * @param filename - The filename to check
 * @returns true if the extension is a media extension, false otherwise
 */
export function isMediaExtension(filename: string): boolean {
  const mediaExtensions = ['.mp3', '.mp4', '.wav', '.avi', '.mov']
  const extension = getFileExtension(filename).toLowerCase()
  return mediaExtensions.includes(extension)
}

/**
 * Checks if the filename has a document file extension
 * @param filename - The filename to check
 * @returns true if the extension is a document extension, false otherwise
 */
export function isDocumentExtension(filename: string): boolean {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
  const extension = getFileExtension(filename).toLowerCase()
  return documentExtensions.includes(extension)
}
