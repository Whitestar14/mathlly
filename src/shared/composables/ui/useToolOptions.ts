import { computed, type Ref, type UnwrapRef, ref, watch, toRaw } from 'vue'
import { appStorage } from '@services/storage'
import { useToolSettingsStore } from '@stores/toolSettings'
import type { ToolConfig, ToolOption } from '@stores/toolSettings'

export function createToolOptions<T extends Record<string, any>>(
  toolId: string,
  toolName: string,
  defaultOptions: T,
  optionsConfig: (options: Ref<T> | Ref<UnwrapRef<T>>) => ToolOption[]
) {
  const storedAll = appStorage.get('router', 'toolOptions', null) as Record<string, any> | null
  const storedForTool = storedAll ? (storedAll[toolId] as Partial<T> | undefined) : undefined
  const initialOptions = { ...defaultOptions, ...(storedForTool || {}) } as T

  const options = ref<T>(initialOptions)

  watch(
    options,
    (newVal) => {
      const current = appStorage.get('router', 'toolOptions', {}) as Record<string, any>
      current[toolId] = toRaw(newVal) as any
      appStorage.set('router', 'toolOptions', current)
    },
    { deep: true }
  )

  const toolStore = useToolSettingsStore()
  
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
