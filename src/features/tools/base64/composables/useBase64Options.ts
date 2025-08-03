import { computed } from 'vue'
import { createToolOptions } from '@composables/ui/useToolOptions'

// Base64-specific option types
export interface Base64Options {
  autoProcess: boolean
  preserveWhitespace: boolean
  outputFormat: 'standard' | 'url-safe' | 'mime'
  lineLength: number
  handleBinaryFiles: boolean
  validateInput: boolean
  showCharacterCount: boolean
  compressionLevel: 'none' | 'low' | 'medium' | 'high'
}

// Default Base64 options
const DEFAULT_BASE64_OPTIONS: Base64Options = {
  autoProcess: true,
  preserveWhitespace: false,
  outputFormat: 'standard',
  lineLength: 76,
  handleBinaryFiles: true,
  validateInput: true,
  showCharacterCount: true,
  compressionLevel: 'none'
}

export function useBase64Options() {
  const { options, isLoading } = createToolOptions<Base64Options>(
    'base64',
    'Base64 Encoder/Decoder',
    DEFAULT_BASE64_OPTIONS,
    (options) => [
      {
        id: 'autoProcess',
        label: 'Auto Process',
        description: 'Automatically encode/decode as you type',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'preserveWhitespace',
        label: 'Preserve Whitespace',
        description: 'Keep leading and trailing whitespace in input',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'handleBinaryFiles',
        label: 'Handle Binary Files',
        description: 'Enable file upload and binary data processing',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'validateInput',
        label: 'Validate Input',
        description: 'Show validation errors for invalid Base64',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'showCharacterCount',
        label: 'Show Character Count',
        description: 'Display character and byte counts',
        type: 'toggle',
        value: options,
        section: 'Display'
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        description: 'Choose the Base64 output format',
        type: 'select',
        value: options,
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'url-safe', label: 'URL Safe' },
          { value: 'mime', label: 'MIME' }
        ],
        section: 'Format'
      },
      {
        id: 'lineLength',
        label: 'Line Length (MIME)',
        description: 'Maximum characters per line for MIME format',
        type: 'range',
        value: options,
        min: 40,
        max: 120,
        step: 4,
        section: 'Format'
      },
      {
        id: 'compressionLevel',
        label: 'Compression Level',
        description: 'Apply compression before encoding (experimental)',
        type: 'select',
        value: options,
        options: [
          { value: 'none', label: 'None' },
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ],
        section: 'Advanced'
      }
    ]
  )

  return {
    // The entire options object
    options,
    
    // Individual options (for convenience)
    autoProcess: computed(() => options.value.autoProcess),
    preserveWhitespace: computed(() => options.value.preserveWhitespace),
    outputFormat: computed(() => options.value.outputFormat),
    lineLength: computed(() => options.value.lineLength),
    handleBinaryFiles: computed(() => options.value.handleBinaryFiles),
    validateInput: computed(() => options.value.validateInput),
    showCharacterCount: computed(() => options.value.showCharacterCount),
    compressionLevel: computed(() => options.value.compressionLevel),
    
    // Store state
    isLoading
  }
}
