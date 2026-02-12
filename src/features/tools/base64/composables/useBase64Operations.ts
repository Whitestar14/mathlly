import { ref, computed, shallowRef, type Ref } from 'vue'
import type { Base64Options, TextStats, Base64ProcessingResult, Base64EncodingOptions, Base64DecodingOptions, InputMode } from '../types/base64'
import { Base64ServiceFactory } from '../services/factory/Base64ServiceFactory'
import { applyFormat } from '../utils/formatters/base64Formatter'
import { Base64Constants } from '../utils/constants/Base64Constants'

// Helper for efficient byte counting
const getByteCount = (str: string): number => {
  if (str.length > 1_000_000) return str.length // Approximation for huge strings to avoid freezing
  return new TextEncoder().encode(str).length
}

export function useBase64Operations(
  input: Ref<string>, 
  inputMode: Ref<InputMode>,
  options: Ref<Base64Options>
) {
  const output = shallowRef('')
  const isProcessing = ref(false)
  const validationError = ref('')
  const processState = shallowRef<Base64ProcessingResult>({ success: true })
  const error = ref<unknown>(null)
  
  // Cache for the raw base64 string of an uploaded file (Standard encoding)
  const rawFileBase64 = ref<string>('')

  const encoder = Base64ServiceFactory.createEncoder()
  const decoder = Base64ServiceFactory.createDecoder()

  const inputStats = computed<TextStats>(() => {
    // If in file mode, we rely on file details passed elsewhere, or calculate based on raw buffer
    const content = inputMode.value === 'file' ? rawFileBase64.value : input.value
    return {
      characters: content.length,
      bytes: getByteCount(content),
      lines: content.split(/\r\n|\r|\n/).length
    }
  })

  const outputStats = computed<TextStats>(() => ({
    characters: output.value.length,
    bytes: getByteCount(output.value),
    lines: output.value.split(/\r\n|\r|\n/).length
  }))

  const encodeToBase64 = async(text: string): Promise<string> => {
    // Use cached raw base64 if in file mode to avoid re-reading or string manipulation on huge DOM strings
    if (inputMode.value === 'file' && rawFileBase64.value) {
      return applyFormat(rawFileBase64.value, options.value.outputFormat, options.value.lineLength)
    }

    const processed = options.value.preserveWhitespace ? text : text.trim()
    const encodingOptions: Base64EncodingOptions = {
      outputFormat: options.value.outputFormat,
      lineLength: options.value.lineLength,
      preserveWhitespace: options.value.preserveWhitespace
    }
    
    try {
      const result = await encoder.encode(processed, encodingOptions)
      return result.encoded
    } catch (e) {
      throw new Error('Encoding failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const decodeFromBase64 = async(base64: string): Promise<Partial<Base64ProcessingResult>> => {
    const decodingOptions: Base64DecodingOptions = {
      detectBinary: true,
      detectMimeType: true
    }
    try {
      const result = await decoder.decode(base64, decodingOptions)
      return {
        output: result.decoded,
        binary: result.binary,
        mime: result.mime,
        isBinary: result.isBinary
      }
    } catch (e) {
      throw new Error('Decoding failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const processInput = async(tab: 'encode' | 'decode'): Promise<Base64ProcessingResult> => {
    isProcessing.value = true
    validationError.value = ''
    error.value = null
    
    try {
      // Logic split based on input mode
      const contentToProcess = inputMode.value === 'file' ? rawFileBase64.value : input.value

      if (!contentToProcess && inputMode.value !== 'file') {
        // If file mode but empty rawFileBase64, it might be an issue, but standard text empty is fine
        output.value = ''
        processState.value = { success: true }
        return processState.value
      }

      if (tab === 'encode') {
        const result = await encodeToBase64(contentToProcess)
        output.value = result
        processState.value = { success: true, output: result }
      } else {
        if (inputMode.value !== 'file' && !decoder.validate(contentToProcess)) {
          output.value = ''
          processState.value = { success: false, error: Base64Constants.ERROR_MESSAGES.INVALID_BASE64 }
          return processState.value
        }
        
        const decoded = await decodeFromBase64(contentToProcess)
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
