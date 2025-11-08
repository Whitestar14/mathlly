import { defineStore } from 'pinia'
import { computed, ref, markRaw, UnwrapRef, type Ref } from 'vue'
import { useRoute } from 'vue-router'

export interface ToolOption {
  id: string
  label: string
  description?: string
  type: 'select' | 'toggle' | 'radio' | 'range' | 'color' | 'number'
  value: Ref<any>
  options?: Array<{ value: any; label: string }>
  min?: number
  max?: number
  step?: number
  section?: string
}

export interface ToolConfig<T extends Record<string, any> = Record<string, any>> {
  toolId: string
  toolName: string
  defaultSettings: UnwrapRef<T>
  options: ToolOption[]
}

export const useToolSettingsStore = defineStore('toolSettings', () => {
  const route = useRoute()
  const currentToolId = computed(() => {
    const path = route.path

    if (path === '/calculator' || path.startsWith('/calculator/')) {
      return 'calculator'
    }
    if (path === '/converter' || path.startsWith('/converter/')) {
      return 'converter'
    }
    if (path.startsWith('/tools/')) {
      const toolName = path.split('/tools/')[1]?.split('/')[0]
      return toolName || null
    }

    return null
  })

  const toolRegistry = ref(new Map<string, ToolConfig>())
  const isLoading = ref(false)

  const registerTool = (config: ToolConfig) => {
    toolRegistry.value.set(config.toolId, markRaw(config))
  }

  const getToolConfig = (toolId: string): ToolConfig | null => {
    return toolRegistry.value.get(toolId) || null
  }

  const currentToolConfig = computed(() => {
    const toolId = currentToolId.value
    return toolId ? getToolConfig(toolId) : null
  })

  return {

    registerTool,
    getToolConfig,

    currentToolId,
    currentToolConfig,
    isLoading,

    hasCurrentTool: computed(() => !!currentToolId.value),
    hasCurrentToolOptions: computed(() => !!currentToolConfig.value?.options.length)
  }
})
