import { ref, computed, shallowRef, type Ref } from 'vue'
import type { Base64Options, TextStats, Base64ProcessingResult, IBase64Encoder, IBase64Decoder, Base64EncodingOptions, Base64DecodingOptions } from '../types/base64'
import { Base64ServiceFactory } from '../services/factory/Base64ServiceFactory'
import { applyFormat } from '../utils/formatters/base64Formatter'
import { Base64Constants } from '../utils/constants/Base64Constants'

export function useBase64Operations(input: Ref<string>, options: Ref<Base64Options>) {
  const output = shallowRef('')
  const isProcessing = ref(false)
  const validationError = ref('')
  const processState = shallowRef<Base64ProcessingResult>({ success: true })
  const error = ref<unknown>(null)
  
  // Cache for the raw base64 string of an uploaded file (Standard encoding)
  // This allows us to re-format (e.g. to URL-safe) without reading the file again
  const rawFileBase64 = ref<string>('')

  const encoder = Base64ServiceFactory.createEncoder()
  const decoder = Base64ServiceFactory.createDecoder()

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

  const encodeToBase64 = async(text: string): Promise<string> => {
    // If input is the placeholder for binary file, use cached raw base64 and apply current formatting options
    if (text.startsWith('[Binary File Loaded:') && rawFileBase64.value) {
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
        if (!decoder.validate(input.value)) {
          output.value = ''
          processState.value = { success: false, error: Base64Constants.ERROR_MESSAGES.INVALID_BASE64 }
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