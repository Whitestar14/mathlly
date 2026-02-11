import { computed } from 'vue'
import { useToolOptions } from '@composables/ui/useToolOptions'
import type { Base64Options } from '../types/base64'

const DEFAULT_BASE64_OPTIONS: Base64Options = {
  autoProcess: true,
  preserveWhitespace: false,
  preserveMode: true,
  outputFormat: 'standard',
  lineLength: 76,
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
        id: 'autoProcess',
        label: 'Auto Process',
        description: 'Process immediately as you type',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'preserveMode',
        label: 'Preserve Inputs',
        description: 'Keep separate inputs for Encode and Decode tabs',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'preserveWhitespace',
        label: 'Preserve Whitespace',
        description: 'Do not trim input (useful for testing formatting)',
        type: 'toggle',
        value: options,
        section: 'Processing'
      },
      {
        id: 'showCharacterCount',
        label: 'Show Stats',
        description: 'Display character and byte counts in footer',
        type: 'toggle',
        value: options,
        section: 'Display'
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        description: 'Choose between Standard, URL-Safe, or MIME',
        type: 'select',
        options: [
            { label: 'Standard', value: 'standard' },
            { label: 'URL Safe', value: 'url-safe' },
            { label: 'MIME', value: 'mime' }
        ],
        value: options,
        section: 'Format'
      },
      {
        id: 'lineLength',
        label: 'MIME Line Length',
        description: 'Max chars per line (only affects MIME format)',
        type: 'range',
        value: options,
        min: 40,
        max: 120,
        step: 4,
        section: 'Format',
        disabled: () => options.value.outputFormat !== 'mime'
      }
    ]
  )

  return {
    options,
    autoProcess: computed(() => options.value.autoProcess),
    showCharacterCount: computed(() => options.value.showCharacterCount),
    isLoading
  }
}