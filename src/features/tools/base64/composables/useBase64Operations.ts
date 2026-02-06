import { ref, computed, shallowRef, type Ref } from 'vue'
import type { Base64Options, TextStats, Base64ProcessingResult } from '../types/base64'

export function useBase64Operations(input: Ref<string>, options: Ref<Base64Options>) {
  const output = shallowRef('')
  const isProcessing = ref(false)
  const validationError = ref('')
  const processState = shallowRef<Base64ProcessingResult>({ success: true })
  const error = ref<unknown>(null)
  
  // Cache for the raw base64 string of an uploaded file (Standard encoding)
  // This allows us to re-format (e.g. to URL-safe) without reading the file again
  const rawFileBase64 = ref<string>('')

  const inputStats = computed<TextStats>(() => ({
    characters: input.value.length,
    bytes: new Blob([input.value]).size,
    lines: input.value.split('\n').length
  }))

  const outputStats = computed<TextStats>(() => ({
    characters: output.value.length,
    bytes: new Blob([output.value]).size,
    lines: output.value.split('\n').length
  }))

  const isValidBase64 = (raw: string): boolean => {
    if (!raw.trim()) return true
    try {
      const s = raw.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')
      if (options.value.outputFormat !== 'url-safe' && s.length % 4 !== 0) return false
      atob(s)
      return true
    } catch {
      return false
    }
  }

  const detectMimeType = (bytes: Uint8Array): string | null => {
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

  const isBinaryData = (bytes: Uint8Array): boolean => {
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

  const chunkString = (str: string, length: number): string => {
    const chunks = []
    for (let i = 0; i < str.length; i += length) {
      chunks.push(str.slice(i, i + length))
    }
    return chunks.join('\n')
  }
  
  const applyFormat = (base64: string): string => {
     if (options.value.outputFormat === 'url-safe') {
       return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
     } else if (options.value.outputFormat === 'mime') {
       return chunkString(base64, options.value.lineLength)
     }
     return base64
  }

  const encodeToBase64 = async(text: string): Promise<string> => {
    // If input is the placeholder for binary file, use cached raw base64 and apply current formatting options
    if (text.startsWith('[Binary File Loaded:') && rawFileBase64.value) {
      return applyFormat(rawFileBase64.value)
    }

    const processed = options.value.preserveWhitespace ? text : text.trim()
    
    // Handle larger strings via Blob/FileReader to avoid stack issues
    const blob = new Blob([processed], { type: 'text/plain' })
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const base64 = dataUrl.split(',')[1]
        resolve(applyFormat(base64))
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const decodeFromBase64 = async(base64: string): Promise<Partial<Base64ProcessingResult>> => {
    let s = base64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')
    while (s.length % 4 !== 0) s += '='
    
    const binString = atob(s)
    const len = binString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binString.charCodeAt(i)
    }

    const mime = detectMimeType(bytes)
    const binaryFlag = isBinaryData(bytes) || !!mime

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
      output: textOutput,
      binary: bytes,
      mime,
      isBinary: binaryFlag
    }
  }

  const processInput = async(tab: 'encode' | 'decode'): Promise<Base64ProcessingResult> => {
    isProcessing.value = true
    validationError.value = ''
    error.value = null
    
    try {
      if (!input.value.trim()) {
        output.value = ''
        processState.value = { success: true }
        return processState.value
      }

      if (tab === 'encode') {
        const result = await encodeToBase64(input.value)
        output.value = result
        processState.value = { success: true, output: result }
      } else {
        if (!isValidBase64(input.value)) {
          output.value = ''
          processState.value = { success: false, error: 'Invalid Base64 format' }
          return processState.value
        }
        
        const decoded = await decodeFromBase64(input.value)
        output.value = decoded.output || ''
        
        processState.value = { 
          success: true, 
          output: decoded.output,
          binary: decoded.binary,
          mime: decoded.mime,
          isBinary: decoded.isBinary
        }
      }
      
      return processState.value
    } catch(e) {
      output.value = ''
      error.value = e
      processState.value = { success: false, error: e instanceof Error ? e.message : 'Processing failed' }
      return processState.value
    } finally {
      isProcessing.value = false
    }
  }

  return {
    output,
    isProcessing,
    validationError,
    inputStats,
    outputStats,
    processInput,
    processState,
    error,
    rawFileBase64
  }
}