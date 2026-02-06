import { computed } from 'vue'
import { useToolOptions } from '@composables/ui/useToolOptions'
import type { Base64Options } from '../types/base64'

const DEFAULT_BASE64_OPTIONS: Base64Options = {
  autoProcess: true,
  preserveWhitespace: false,
  preserveMode: true,
  outputFormat: 'standard',
  lineLength: 76,
  handleBinaryFiles: true,
  validateInput: true,
  showCharacterCount: true
}

export function useBase64Options() {
  const { options, isLoading } = useToolOptions<Base64Options>(
    'base64',
    'Base64 Encoder/Decoder',
    DEFAULT_BASE64_OPTIONS,
    options => [
      {
        id: 'preserveMode',
        label: 'Preserve Mode Inputs',
        description: 'Keep separate input buffers for Encode and Decode',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
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
        id: 'lineLength',
        label: 'Line Length (MIME)',
        description: 'Maximum characters per line for MIME format',
        type: 'range',
        value: options,
        min: 40,
        max: 120,
        step: 4,
        section: 'Format'
      }
    ]
  )

  return {
    options,
    autoProcess: computed(() => options.value.autoProcess),
    preserveWhitespace: computed(() => options.value.preserveWhitespace),
    preserveMode: computed(() => options.value.preserveMode),
    outputFormat: computed(() => options.value.outputFormat),
    lineLength: computed(() => options.value.lineLength),
    handleBinaryFiles: computed(() => options.value.handleBinaryFiles),
    validateInput: computed(() => options.value.validateInput),
    showCharacterCount: computed(() => options.value.showCharacterCount),
    isLoading
  }
}