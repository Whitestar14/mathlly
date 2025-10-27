import { defineStore } from 'pinia'
import { computed, ref, markRaw, type Ref } from 'vue'
import { useRoute } from 'vue-router'

// Tool option configuration types
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

export interface ToolConfig {
  toolId: string
  toolName: string
  defaultSettings: Record<string, any>
  options: ToolOption[]
}

export const useToolSettingsStore = defineStore('toolSettings', () => {
  // Current tool context from route
  const route = useRoute()
  const currentToolId = computed(() => {
    const path = route.path
    
    if (path === '/calculator' || path.startsWith('/calculator/')) {
      return 'calculator'
    }
    if (path.startsWith('/tools/')) {
      const toolName = path.split('/tools/')[1]?.split('/')[0]
      return toolName || null
    }
    
    return null
  })

  // Registry management
  const toolRegistry = ref(new Map<string, ToolConfig>())
  const isLoading = ref(false)
  
  const registerTool = (config: ToolConfig) => {
    toolRegistry.value.set(config.toolId, markRaw(config))
  }

  const getToolConfig = (toolId: string): ToolConfig | null => {
    return toolRegistry.value.get(toolId) || null
  }

  // Current tool configuration
  const currentToolConfig = computed(() => {
    const toolId = currentToolId.value
    return toolId ? getToolConfig(toolId) : null
  })

  return {
    // Registry
    registerTool,
    getToolConfig,
    
    // Current tool
    currentToolId,
    currentToolConfig,
    isLoading,
    
    // Computed helpers
    hasCurrentTool: computed(() => !!currentToolId.value),
    hasCurrentToolOptions: computed(() => !!currentToolConfig.value?.options.length)
  }
})
