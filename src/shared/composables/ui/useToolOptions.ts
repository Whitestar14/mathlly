import { ref, computed, watch, type Ref } from 'vue'
import { useAppStorageStore } from '@stores/appStorage'
import { useToolSettingsStore } from '@stores/toolSettings'
import type { ToolConfig, ToolOption } from '@stores/toolSettings'

export function useToolOptions<T extends Record<string, any>>(
  toolId: string,
  toolName: string,
  defaultOptions: T,
  optionsConfig: (options: Ref<T>) => ToolOption[]
) {
  const appStorage = useAppStorageStore()
  const toolStore = useToolSettingsStore()

  const storedOptions = appStorage.get('router', 'toolOptions', {}) as Record<string, T>
  const storedValue = storedOptions[toolId] as T | undefined
  const initialValue: T = storedValue ?
    { ...defaultOptions, ...storedValue } :
    defaultOptions

  const options = ref<T>(initialValue) as Ref<T>

  let isExternalUpdate = false

  watch(
    options,
    newValue => {
      if (isExternalUpdate) {
        isExternalUpdate = false
        return
      }

      const currentToolOptions = appStorage.get('router', 'toolOptions', {}) as Record<string, any>
      appStorage.set('router', 'toolOptions', {
        ...currentToolOptions,
        [toolId]: newValue
      })
    },
    { deep: true }
  )

  watch(
    () => appStorage.router.toolOptions,
    toolOptions => {
      if (!toolOptions) return

      const updatedValue = toolOptions[toolId] as T | undefined
      if (!updatedValue) return

      const currentJson = JSON.stringify(options.value)
      const updatedJson = JSON.stringify({ ...defaultOptions, ...updatedValue })

      if (currentJson !== updatedJson) {
        isExternalUpdate = true
        options.value = { ...defaultOptions, ...updatedValue } as T
      }
    },
    { deep: true }
  )

  const config: ToolConfig = {
    toolId,
    toolName,
    defaultSettings: defaultOptions,
    options: optionsConfig(options)
  }

  toolStore.registerTool(config)

  return {
    options,
    isLoading: computed(() => toolStore.isLoading)
  }
}
