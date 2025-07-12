import { defineStore } from 'pinia'
import { computed, ref, watch, markRaw, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncState, useDebounceFn } from '@vueuse/core'
import db from '@/data/db'
import { merge } from '@/utils/misc/objectUtils'

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

// Global registry for tool configurations
const toolRegistry = markRaw(new Map<string, ToolConfig>())

export const useToolSettingsStore = defineStore('toolSettings', () => {
  // Current tool context from route
  const route = useRoute()
  const currentToolId = computed(() => {
    const path = route.path
    
    if (path === '/calculator' || path.startsWith('/calculator/')) {
      return 'calculator'
    }
    if (path.startsWith('/tools/base64')) {
      return 'base64'
    }
    if (path.startsWith('/tools/')) {
      const toolName = path.split('/tools/')[1]?.split('/')[0]
      return toolName || null
    }
    
    return null
  })

  // Registry management
  const registryVersion = ref(0)
  
  const registerTool = (config: ToolConfig) => {
    toolRegistry.set(config.toolId, markRaw(config))
    registryVersion.value++
  }

  const getToolConfig = (toolId: string): ToolConfig | null => {
    registryVersion.value // Ensure reactivity
    return toolRegistry.get(toolId) || null
  }

  // Current tool configuration
  const currentToolConfig = computed(() => {
    const toolId = currentToolId.value
    return toolId ? getToolConfig(toolId) : null
  })

  // Settings management for current tool
  const {
    state: currentToolSettings,
    isLoading,
    execute: loadCurrentToolSettings
  } = useAsyncState(
    async () => {
      const toolId = currentToolId.value
      if (!toolId) return {}
      
      try {
        const settings = await db.toolSettings.where('toolId').equals(toolId).first()
        const config = getToolConfig(toolId)
        
        if (settings?.settings) {
          return merge({}, config?.defaultSettings || {}, settings.settings)
        }
        
        return config?.defaultSettings || {}
      } catch (error) {
        console.error(`Error loading settings for tool ${toolId}:`, error)
        return getToolConfig(toolId)?.defaultSettings || {}
      }
    },
    {},
    { 
      immediate: false,
      resetOnExecute: false
    }
  )

  // Watch for tool changes and reload settings
  watch(currentToolId, async (newToolId) => {
    if (newToolId) {
      await loadCurrentToolSettings()
    }
  }, { immediate: true })

  // Debounced save function
  const debouncedSave = useDebounceFn(async (toolId: string, settings: Record<string, any>) => {
    try {
      const existingSettings = await db.toolSettings.where('toolId').equals(toolId).first()
      
      if (existingSettings) {
        await db.toolSettings.update(existingSettings.id!, {
          settings,
          lastUpdated: Date.now()
        })
      } else {
        await db.toolSettings.add({
          toolId,
          settings,
          lastUpdated: Date.now()
        })
      }
    } catch (error) {
      console.error(`Error saving settings for tool ${toolId}:`, error)
      throw error
    }
  }, 300)

  // Update a single setting for current tool
  const updateCurrentToolSetting = async (key: string, value: any) => {
    const toolId = currentToolId.value
    if (!toolId) return

    // Optimistically update local state
    currentToolSettings.value = { ...currentToolSettings.value, [key]: value }
    
    // Debounce the actual save
    await debouncedSave(toolId, currentToolSettings.value)
  }

  // Save all settings for current tool
  const saveCurrentToolSettings = async (newSettings: Record<string, any>) => {
    const toolId = currentToolId.value
    if (!toolId) return

    currentToolSettings.value = { ...newSettings }
    await debouncedSave(toolId, newSettings)
  }

  return {
    // Registry
    registerTool,
    getToolConfig,
    
    // Current tool
    currentToolId,
    currentToolConfig,
    currentToolSettings: computed(() => currentToolSettings.value),
    isLoading: computed(() => isLoading.value),
    
    // Settings management
    updateCurrentToolSetting,
    saveCurrentToolSettings,
    loadCurrentToolSettings,
    
    // Computed helpers
    hasCurrentTool: computed(() => !!currentToolId.value),
    hasCurrentToolOptions: computed(() => !!currentToolConfig.value?.options.length)
  }
})
