<template>
  <div class="space-y-4">
    <!-- Store Overview -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Store Overview</span>
        <div class="flex items-center gap-2">
          <BaseBadge
            :variant="Object.keys(stores).length > 0 ? 'success' : 'info'"
            :text="`${Object.keys(stores).length} stores`"
          />
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-5 w-5"
            :disabled="isLoading"
            @click="refreshStores"
          >
            <RefreshCwIcon 
              class="h-3 w-3"
              :class="{ 'animate-spin': isLoading }"
            />
          </BaseButton>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Active Stores</span>
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ Object.keys(stores).length }}</span>
        </div>
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Total Properties</span>
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ getTotalProperties() }}</span>
        </div>
      </div>
    </div>

    <!-- Store List -->
    <div class="space-y-2">
      <div
        v-for="(store, name) in stores"
        :key="name"
        class="bg-background dark:bg-background border border-border dark:border-border rounded-lg overflow-hidden"
      >
        <!-- Store Header -->
        <div class="p-3 border-b border-border dark:border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h4 class="text-sm font-medium text-foreground dark:text-foreground font-mono">
                {{ name }}
              </h4>
              <BaseBadge
                variant="info"
                :text="`${getStorePropertyCount(store)} props`"
              />
            </div>
            
            <div class="flex items-center gap-1">
              <!-- Copy store data -->
              <BaseButton
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                @click="copyStoreData(name, store)"
              >
                <CopyIcon class="h-3 w-3" />
              </BaseButton>
              
              <!-- Watch store -->
              <BaseButton
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                :class="{ 'text-blue-600 dark:text-blue-400': watchedStores.has(name) }"
                @click="toggleWatch(name)"
              >
                <EyeIcon class="h-3 w-3" />
              </BaseButton>
              
              <!-- Expand/Collapse -->
              <BaseButton
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                @click="toggleStore(name)"
              >
                <ChevronDownIcon 
                  class="h-3 w-3 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedStores[name] }"
                />
              </BaseButton>
            </div>
          </div>
        </div>
        
        <!-- Store Content -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-96 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div
            v-if="expandedStores[name]"
            class="overflow-hidden"
          >
            <div class="p-3 bg-muted dark:bg-background/50">
              <!-- Store properties -->
              <div
                v-if="!store.error"
                class="space-y-2"
              >
                <div
                  v-for="(value, key) in store"
                  :key="String(key)"
                  class="flex items-start justify-between p-2 bg-background dark:bg-background rounded border border-border dark:border-border hover:bg-muted dark:hover:bg-background transition-colors group"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium text-primary dark:text-primary font-mono">{{ String(key) }}</span>
                      <BaseBadge
                        variant="info"
                        :text="getValueType(value)"
                      />
                    </div>
                    <div class="text-xs text-muted-foreground dark:text-muted-foreground font-mono break-all">
                      {{ formatValue(value) }}
                    </div>
                  </div>
                  
                  <BaseButton
                    variant="ghost"
                    size="icon"
                    class="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="copyProperty(String(key), value)"
                  >
                    <CopyIcon class="h-2.5 w-2.5" />
                  </BaseButton>
                </div>
              </div>
              
              <!-- Error state -->
              <div
                v-else
                class="flex items-center gap-2 p-2 bg-destructive/5 dark:bg-destructive/5 rounded border border-destructive/20 dark:border-destructive/20"
              >
                <AlertCircleIcon class="h-4 w-4 text-destructive dark:text-destructive" />
                <span class="text-xs text-destructive dark:text-destructive">{{ store.error }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- Empty state -->
      <div
        v-if="Object.keys(stores).length === 0"
        class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-8"
      >
        <div class="flex flex-col items-center justify-center text-muted-foreground dark:text-muted-foreground">
          <DatabaseIcon class="h-8 w-8 mb-3 opacity-40" />
          <p class="text-sm font-medium mb-1">
            No Pinia stores detected
          </p>
          <p class="text-xs text-center">
            Stores will appear here when they're initialized
          </p>
        </div>
      </div>
    </div>

    <!-- Watch Panel -->
    <div
      v-if="watchedStores.size > 0"
      class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Watched Changes</span>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-5 w-5"
            @click="clearWatchHistory"
          >
            <TrashIcon class="h-3 w-3" />
          </BaseButton>
        </div>
      </div>
      
      <div class="max-h-32 overflow-y-auto space-y-1">
        <div
          v-for="(change, index) in watchHistory"
          :key="index"
          class="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-blue-600 dark:text-blue-400">{{ change.store }}.{{ change.property }}</span>
            <span class="text-muted-foreground dark:text-muted-foreground">{{ formatTime(change.timestamp) }}</span>
          </div>
          <div class="mt-1 text-muted-foreground dark:text-muted-foreground">
            {{ change.oldValue }} → {{ change.newValue }}
          </div>
        </div>
        
        <div
          v-if="watchHistory.length === 0"
          class="text-xs text-muted-foreground dark:text-muted-foreground italic text-center py-2"
        >
          No changes detected yet
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-2">
      <div class="flex gap-2">
        <BaseButton
          variant="outline"
          size="sm"
          class="flex-1 text-xs"
          :disabled="isLoading"
          @click="refreshStores"
        >
          <RefreshCwIcon class="h-3 w-3 mr-1.5" />
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </BaseButton>
        
        <BaseButton
          variant="outline"
          size="sm"
          class="flex-1 text-xs"
          @click="expandAll"
        >
          <ExpandIcon class="h-3 w-3 mr-1.5" />
          Expand All
        </BaseButton>
      </div>
      
      <BaseButton
        variant="destructive"
        size="sm"
        class="w-full text-xs"
        @click="collapseAll"
      >
        <ShrinkIcon class="h-3 w-3 mr-1.5" />
        Collapse All
      </BaseButton>
    </div>

    <!-- Export Actions -->
    <div class="pt-3 border-t border-border dark:border-border">
      <div class="flex gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="exportAllStores"
        >
          <DownloadIcon class="h-3 w-3 mr-1.5" />
          Export All
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="logAllStores"
        >
          <TerminalIcon class="h-3 w-3 mr-1.5" />
          Log to Console
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { getActivePinia, type Pinia } from 'pinia'
import {
  RefreshCwIcon,
  ChevronDownIcon,
  CopyIcon,
  EyeIcon,
  AlertCircleIcon,
  DatabaseIcon,
  TrashIcon,
  ExpandIcon,
  ShrinkIcon,
  DownloadIcon,
  TerminalIcon
} from 'lucide-vue-next'
import { BaseBadge, BaseButton } from '@components/ui';

interface StoreData {
  [key: string]: any
  error?: string
}

interface WatchChange {
  store: string
  property: string
  oldValue: string
  newValue: string
  timestamp: string
}

// Define proper function type for watchers
type WatcherFunction = () => void

// Type assertion for accessing internal Pinia properties
interface PiniaInternal extends Pinia {
  _s: Map<string, any>
}

const stores = ref<Record<string, StoreData>>({})
const expandedStores = reactive<Record<string, boolean>>({})
const watchedStores = ref(new Set<string>())
const watchHistory = ref<WatchChange[]>([])
const isLoading = ref(false)
const watchers = new Map<string, WatcherFunction>()

const refreshStores = async (): Promise<void> => {
  isLoading.value = true
  
  try {
    const pinia = getActivePinia()
    if (!pinia) {
      stores.value = {}
      return
    }
    
    const storeData: Record<string, StoreData> = {}
    
    // Get all registered stores with proper typing
    const piniaInternal = pinia as PiniaInternal
    piniaInternal._s.forEach((store: any, id: string) => {
      try {
        // Extract reactive state
        const state = store.$state
        storeData[id] = { ...state }
      } catch {
        storeData[id] = { error: 'Failed to serialize store state' }
      }
    })
    
    stores.value = storeData
    console.log('[State] Stores refreshed:', Object.keys(storeData))
  } catch (error) {
    console.error('[State] Failed to refresh stores:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleStore = (storeName: string): void => {
  expandedStores[storeName] = !expandedStores[storeName]
}

const toggleWatch = (storeName: string): void => {
  if (watchedStores.value.has(storeName)) {
    watchedStores.value.delete(storeName)
    // Remove watcher
    const watcher = watchers.get(storeName)
    if (watcher) {
      watcher()
      watchers.delete(storeName)
    }
    console.log('[State] Stopped watching:', storeName)
  } else {
    watchedStores.value.add(storeName)
    setupStoreWatcher(storeName)
    console.log('[State] Started watching:', storeName)
  }
}

const setupStoreWatcher = (storeName: string): void => {
  const pinia = getActivePinia()
    if (!pinia) return
  
  const piniaInternal = pinia as PiniaInternal
  const store = piniaInternal._s.get(storeName)
  if (!store) return
  
  // Watch for changes in store state
  const unwatch = watch(
    () => store.$state,
    (newState: any, oldState: any) => {
      if (!oldState) return
      
      // Compare states and log changes
      Object.keys(newState).forEach((key: string) => {
        const newValue = newState[key]
        const oldValue = oldState[key]
        
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          watchHistory.value.unshift({
            store: storeName,
            property: key,
            oldValue: formatValue(oldValue),
            newValue: formatValue(newValue),
            timestamp: new Date().toISOString()
          })
          
          // Keep only last 50 changes
          if (watchHistory.value.length > 50) {
            watchHistory.value = watchHistory.value.slice(0, 50)
          }
        }
      })
    },
    { deep: true }
  )
  
  watchers.set(storeName, unwatch)
}

const expandAll = (): void => {
  Object.keys(stores.value).forEach(storeName => {
    expandedStores[storeName] = true
  })
}

const collapseAll = (): void => {
  Object.keys(stores.value).forEach(storeName => {
    expandedStores[storeName] = false
  })
}

const clearWatchHistory = (): void => {
  watchHistory.value = []
  console.log('[State] Watch history cleared')
}

const getTotalProperties = (): number => {
  return Object.values(stores.value).reduce((total, store) => {
    if (store.error) return total
    return total + Object.keys(store).length
  }, 0)
}

const getStorePropertyCount = (store: StoreData): number => {
  if (store.error) return 0
  return Object.keys(store).length
}

const getValueType = (value: any): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (value instanceof Date) return 'date'
  if (typeof value === 'object') return 'object'
  return typeof value
}

const formatValue = (value: any): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number') return value.toString()
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.length <= 3) return `[${value.map(formatValue).join(', ')}]`
    return `[${value.slice(0, 3).map(formatValue).join(', ')}, ...${value.length - 3} more]`
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'
    if (keys.length <= 2) {
      return `{${keys.map(k => `${k}: ${formatValue(value[k])}`).join(', ')}}`
    }
    return `{${keys.slice(0, 2).map(k => `${k}: ${formatValue(value[k])}`).join(', ')}, ...${keys.length - 2} more}`
  }
  return String(value)
}

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

const copyStoreData = async (storeName: string, store: StoreData): Promise<void> => {
  try {
    const data = JSON.stringify(store, null, 2)
    await navigator.clipboard.writeText(data)
    console.log(`[State] Copied ${storeName} store data`)
  } catch (err) {
    console.error('[State] Failed to copy store data:', err)
  }
}

const copyProperty = async (key: string, value: any): Promise<void> => {
  try {
    const data = JSON.stringify(value, null, 2)
    await navigator.clipboard.writeText(data)
    console.log(`[State] Copied property ${key}:`, value)
  } catch (err) {
    console.error('[State] Failed to copy property:', err)
  }
}

const exportAllStores = async (): Promise<void> => {
  try {
    const exportData = {
      stores: stores.value,
      watchHistory: watchHistory.value,
      timestamp: new Date().toISOString(),
      totalStores: Object.keys(stores.value).length,
      totalProperties: getTotalProperties()
    }
    
    const data = JSON.stringify(exportData, null, 2)
    await navigator.clipboard.writeText(data)
    console.log('[State] All store data exported to clipboard')
  } catch (err) {
    console.error('[State] Failed to export stores:', err)
  }
}

const logAllStores = (): void => {
  console.group('[State] All Store Data')
  Object.entries(stores.value).forEach(([name, store]) => {
    console.group(`Store: ${name}`)
    if (store.error) {
      console.error('Error:', store.error)
    } else {
      Object.entries(store).forEach(([key, value]) => {
        console.log(`${key}:`, value)
      })
    }
    console.groupEnd()
  })
  
  if (watchHistory.value.length > 0) {
    console.group('Watch History')
    watchHistory.value.forEach((change, index) => {
      console.log(`${index + 1}. ${change.store}.${change.property}: ${change.oldValue} → ${change.newValue} (${formatTime(change.timestamp)})`)
    })
    console.groupEnd()
  }
  
  console.groupEnd()
}

onMounted(() => {
  refreshStores()
  
  // Auto-refresh every 5 seconds if stores are being watched
  const interval = setInterval(() => {
    if (watchedStores.value.size > 0) {
      refreshStores()
    }
  }, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
    // Clean up all watchers
    watchers.forEach(unwatch => unwatch())
    watchers.clear()
  })
})
</script>

