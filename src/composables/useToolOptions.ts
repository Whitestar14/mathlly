import { computed, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useToolSettingsStore } from '@/stores/toolSettings'
import type { ToolConfig, ToolOption } from '@/stores/toolSettings'

export function createToolOptions<T extends Record<string, any>>(
  toolId: string,
  toolName: string,
  defaultOptions: T,
  optionsConfig: (options: Ref<T>) => ToolOption[]
) {
  // Create reactive storage with persistence
  const options = useStorage<T>(
    `tool-options-${toolId}`,
    defaultOptions,
    localStorage,
    { mergeDefaults: true }
  )
  
  // Get the tool store
  const toolStore = useToolSettingsStore()
  
  // Create the tool configuration
  const config: ToolConfig = {
    toolId,
    toolName,
    defaultSettings: defaultOptions,
    options: optionsConfig(options)
  }
  
  // Register with the store
  toolStore.registerTool(config)
  
  return {
    options,
    isLoading: computed(() => toolStore.isLoading)
  }
}
