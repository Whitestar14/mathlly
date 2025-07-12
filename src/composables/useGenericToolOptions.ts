import { ref, watch, type Ref } from 'vue'
import { getToolSettings, updateToolSetting } from '@/data/toolSettingsDb'
import { useToolOptions, type ToolOptionsConfig, type ToolOption } from './useToolOptions'

export interface ToolOptionDefinition<T = any> {
  key: string
  defaultValue: T
  config: Omit<ToolOption, 'id' | 'value'>
}

export function useGenericToolOptions<T extends Record<string, any>>(
  toolId: string,
  toolName: string,
  optionDefinitions: ToolOptionDefinition[]
) {
  // ...existing code...
  
  const { registerToolOptions } = useToolOptions()
  
  // Create individual reactive refs for each option
  const optionRefs: Record<string, Ref<any>> = {}
  const isLoading = ref(true)
  const error = ref<Error | null>(null)

  // Initialize all option refs with default values
  optionDefinitions.forEach(({ key, defaultValue }) => {
    optionRefs[key] = ref(defaultValue)
  })

  // Load settings function
  const loadSettings = async () => {
    try {
      isLoading.value = true
      const result = await getToolSettings(toolId)
      // Update each ref with loaded value or keep default
      optionDefinitions.forEach(({ key, defaultValue }) => {
        const loadedValue = result[key] ?? defaultValue
        optionRefs[key].value = loadedValue
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load settings')
    } finally {
      isLoading.value = false
    }
  }

  // Watch each option ref for changes and save to database
  optionDefinitions.forEach(({ key }) => {
    watch(optionRefs[key], async (newValue) => {
      try {
        await updateToolSetting(toolId, key, newValue)
      } catch (err) {
        // Optionally handle error
      }
    })
  })

  // Create tool options configuration
  const toolOptions: ToolOption[] = optionDefinitions.map(({ key, config }) => {
    const toolOption: ToolOption = {
      ...config,
      id: key,
      value: optionRefs[key] // Use the actual ref
    }
    return toolOption
  })

  // Load settings from database
  loadSettings()

  // Register tool options
  const registerOptions = () => {
    const toolOptionsConfig: ToolOptionsConfig = {
      toolId,
      toolName,
      options: toolOptions
    }
    registerToolOptions(toolOptionsConfig)
  }

  // Register immediately since we have defaults
  registerOptions()

  // Build the return object with all option refs
  const result: Record<string, any> = {}
  
  // Add individual option refs
  optionDefinitions.forEach(({ key }) => {
    result[key] = optionRefs[key]
  })
  
  // Add utility properties
  result.isLoading = isLoading
  result.error = error
  result.loadSettings = loadSettings
  
  // Add computed options getter
  Object.defineProperty(result, 'options', {
    get() {
      const options: Record<string, any> = {}
      optionDefinitions.forEach(({ key }) => {
        options[key] = optionRefs[key].value
      })
      return options as T
    }
  })
  return result
}
