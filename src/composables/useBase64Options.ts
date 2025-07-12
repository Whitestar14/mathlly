import { ref, watch, computed, nextTick } from 'vue'
import { useToolSettingsStore } from '@/stores/toolSettings'
import type { ToolConfig } from '@/stores/toolSettings'

// Base64-specific option types
export interface Base64Options {
  autoProcess: boolean
  preserveWhitespace: boolean
  outputFormat: 'standard' | 'url-safe' | 'mime'
  lineLength: number
}

// Default Base64 options
const DEFAULT_BASE64_OPTIONS: Base64Options = {
  autoProcess: true,
  preserveWhitespace: false,
  outputFormat: 'standard',
  lineLength: 76
}

export function useBase64Options() {
  const toolStore = useToolSettingsStore()
  
  // Create reactive refs for each option
  const autoProcess = ref<boolean>(DEFAULT_BASE64_OPTIONS.autoProcess)
  const preserveWhitespace = ref<boolean>(DEFAULT_BASE64_OPTIONS.preserveWhitespace)
  const outputFormat = ref<'standard' | 'url-safe' | 'mime'>(DEFAULT_BASE64_OPTIONS.outputFormat)
  const lineLength = ref<number>(DEFAULT_BASE64_OPTIONS.lineLength)

  const isInitializing = ref(true)

  // Watch for settings changes and update refs
  watch(() => toolStore.currentToolSettings, (newSettings) => {
    if (toolStore.currentToolId !== 'base64') return
    
    isInitializing.value = true
    
    autoProcess.value = newSettings.autoProcess ?? DEFAULT_BASE64_OPTIONS.autoProcess
    preserveWhitespace.value = newSettings.preserveWhitespace ?? DEFAULT_BASE64_OPTIONS.preserveWhitespace
    outputFormat.value = newSettings.outputFormat ?? DEFAULT_BASE64_OPTIONS.outputFormat
    lineLength.value = newSettings.lineLength ?? DEFAULT_BASE64_OPTIONS.lineLength
    
    nextTick(() => {
      isInitializing.value = false
    })
  }, { immediate: true, deep: true })

  // Create watchers for all options
  const createWatcher = (ref: any, key: string) => {
    watch(ref, async (value) => {
      if (!isInitializing.value && toolStore.currentToolId === 'base64') {
        await toolStore.updateCurrentToolSetting(key, value)
      }
    })
  }

  createWatcher(autoProcess, 'autoProcess')
  createWatcher(preserveWhitespace, 'preserveWhitespace')
  createWatcher(outputFormat, 'outputFormat')
  createWatcher(lineLength, 'lineLength')

  // Register base64 configuration
  const base64Config: ToolConfig = {
    toolId: 'base64',
    toolName: 'Base64 Encoder/Decoder',
    defaultSettings: DEFAULT_BASE64_OPTIONS,
    options: [
      {
        id: 'autoProcess',
        label: 'Auto Process',
        description: 'Automatically encode/decode as you type',
        type: 'toggle',
        value: autoProcess,
        section: 'Processing'
      },
      {
        id: 'preserveWhitespace',
        label: 'Preserve Whitespace',
        description: 'Keep leading and trailing whitespace in input',
        type: 'toggle',
        value: preserveWhitespace,
        section: 'Processing'
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        description: 'Choose the Base64 output format',
        type: 'select',
        value: outputFormat,
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
        value: lineLength,
        min: 40,
        max: 120,
        step: 4,
        section: 'Format'
      }
    ]
  }

  // Register with the store
  toolStore.registerTool(base64Config)

  return {
    autoProcess,
    preserveWhitespace,
    outputFormat,
    lineLength,
    isLoading: toolStore.isLoading,
    
    // Computed getter for all options
    options: computed(() => ({
      autoProcess: autoProcess.value,
      preserveWhitespace: preserveWhitespace.value,
      outputFormat: outputFormat.value,
      lineLength: lineLength.value
    }))
  }
}
