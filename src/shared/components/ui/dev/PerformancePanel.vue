<template>
  <div class="space-y-4">
    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Memory Usage -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Memory</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-5 w-5"
            @click="copyMetric('memory', `${memoryUsage}MB`)"
          >
            <CopyIcon class="h-2.5 w-2.5" />
          </BaseButton>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ memoryUsage }}</span>
          <span class="text-xs text-muted-foreground dark:text-muted-foreground">MB</span>
        </div>
        <div class="mt-1 h-1 bg-muted dark:bg-muted rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            :style="{ width: `${Math.min((memoryUsage / 100) * 100, 100)}%` }"
          />
        </div>
      </div>

      <!-- FPS -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">FPS</span>
          <div class="flex items-center gap-1">
            <div 
              class="w-2 h-2 rounded-full"
              :class="getFPSIndicatorColor(fps)"
            />
            <BaseButton
              variant="ghost"
              size="icon"
              class="h-5 w-5"
              @click="copyMetric('fps', fps.toString())"
            >
              <CopyIcon class="h-2.5 w-2.5" />
            </BaseButton>
          </div>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ fps }}</span>
          <span class="text-xs text-muted-foreground dark:text-muted-foreground">fps</span>
        </div>
        <div class="mt-1 h-1 bg-muted dark:bg-muted rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-500"
            :class="getFPSBarColor(fps)"
            :style="{ width: `${Math.min((fps / 60) * 100, 100)}%` }"
          />
        </div>
      </div>

      <!-- Load Time -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Load Time</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-5 w-5"
            @click="copyMetric('loadTime', `${loadTime}ms`)"
          >
            <CopyIcon class="h-2.5 w-2.5" />
          </BaseButton>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ loadTime }}</span>
          <span class="text-xs text-muted-foreground dark:text-muted-foreground">ms</span>
        </div>
        <div class="mt-1">
          <BaseBadge
            :variant="getLoadTimeVariant(loadTime)"
            :text="getLoadTimeLabel(loadTime)"
            size="sm"
          />
        </div>
      </div>

      <!-- DOM Nodes -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">DOM Nodes</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-5 w-5"
            @click="copyMetric('domNodes', domNodes.toString())"
          >
            <CopyIcon class="h-2.5 w-2.5" />
          </BaseButton>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-mono font-semibold text-foreground dark:text-foreground">{{ domNodes.toLocaleString() }}</span>
          <span class="text-xs text-muted-foreground dark:text-muted-foreground">nodes</span>
        </div>
        <div class="mt-1">
          <BaseBadge
            :variant="getDOMNodesVariant(domNodes)"
            :text="getDOMNodesLabel(domNodes)"
            size="sm"
          />
        </div>
      </div>
    </div>
    
    <!-- Performance Chart -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">FPS History</span>
        <div class="flex items-center gap-1">
          <div
            v-if="isMonitoring"
            class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
          />
          <span class="text-xs text-muted-foreground dark:text-muted-foreground">{{ fpsHistory.length }}/{{ maxHistoryPoints }}</span>
        </div>
      </div>
      
      <div class="h-16 bg-muted dark:bg-background rounded-md flex items-end justify-between p-2 gap-0.5">
        <div
          v-for="(point, index) in fpsHistory"
          :key="index"
          class="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-sm transition-all duration-300"
          :style="{ height: `${Math.max((point / 60) * 100, 2)}%` }"
          :title="`${point} FPS`"
        />
        
        <!-- Empty state -->
        <div
          v-if="fpsHistory.length === 0"
          class="flex flex-col items-center justify-center w-full h-full text-muted-foreground dark:text-muted-foreground"
        >
          <ActivityIcon class="h-6 w-6 mb-1 opacity-50" />
          <span class="text-xs">No data yet</span>
        </div>
      </div>
    </div>

    <!-- Additional Metrics -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-2">System Info</span>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Viewport</span>
          <span class="text-foreground dark:text-foreground font-mono">{{ viewportSize }}</span>
        </div>
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Device Pixel Ratio</span>
          <span class="text-foreground dark:text-foreground font-mono">{{ devicePixelRatio }}</span>
        </div>
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Connection</span>
          <span class="text-foreground dark:text-foreground">{{ connectionType }}</span>
        </div>
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Hardware Concurrency</span>
          <span class="text-foreground dark:text-foreground font-mono">{{ hardwareConcurrency }}</span>
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
          @click="measurePerformance"
        >
          <ActivityIcon class="h-3 w-3 mr-1.5" />
          {{ isLoading ? 'Measuring...' : 'Measure' }}
        </BaseButton>
        
        <BaseButton
          variant="outline"
          size="sm"
          class="flex-1 text-xs"
          @click="toggleMonitoring"
        >
          <div class="flex items-center">
            <div 
              v-if="isMonitoring"
              class="w-2 h-2 bg-destructive rounded-full mr-1.5 animate-pulse"
            />
            <PlayIcon
              v-else
              class="h-3 w-3 mr-1.5"
            />
            {{ isMonitoring ? 'Stop' : 'Monitor' }}
          </div>
        </BaseButton>
      </div>
      
      <BaseButton
        variant="destructive"
        size="sm"
        class="w-full text-xs"
        @click="clearMetrics"
      >
        <TrashIcon class="h-3 w-3 mr-1.5" />
        Clear All Data
      </BaseButton>
    </div>

    <!-- Export Actions -->
    <div class="pt-3 border-t border-border dark:border-border">
      <div class="flex gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="copyAllMetrics"
        >
          <CopyIcon class="h-3 w-3 mr-1.5" />
          Copy All
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="logPerformanceData"
        >
          <TerminalIcon class="h-3 w-3 mr-1.5" />
          Log Data
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRafFn } from '@vueuse/core'
import { CopyIcon, ActivityIcon, PlayIcon, TrashIcon, TerminalIcon } from 'lucide-vue-next'
import { BaseButton, BaseBadge } from '@components/ui'
import type { BadgeVariant } from '@composables/ui/useBadge';

const memoryUsage = ref(0)
const fps = ref(0)
const loadTime = ref(0)
const domNodes = ref(0)
const isLoading = ref(false)
const isMonitoring = ref(false)
const fpsHistory = ref<number[]>([])
const maxHistoryPoints = 30

let frameCount = 0
let lastTime = performance.now()

const { pause, resume } = useRafFn(() => {
  frameCount++
  const currentTime = performance.now()
  
  if (currentTime - lastTime >= 1000) {
    const currentFPS = Math.round((frameCount * 1000) / (currentTime - lastTime))
    fps.value = currentFPS
    
    // Add to history
    if (isMonitoring.value) {
      fpsHistory.value.push(currentFPS)
      if (fpsHistory.value.length > maxHistoryPoints) {
        fpsHistory.value.shift()
      }
    }
    
    frameCount = 0
    lastTime = currentTime
    
    updateMetrics()
  }
})

// Computed properties for additional metrics
const viewportSize = computed(() => `${window.innerWidth}×${window.innerHeight}`)
const devicePixelRatio = computed(() => window.devicePixelRatio || 1)
const hardwareConcurrency = computed(() => navigator.hardwareConcurrency || 'Unknown')
const connectionType = computed(() => {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection
    return conn.effectiveType || 'Unknown'
  }
  return 'Not available'
})

const updateMetrics = (): void => {
  // Memory usage (if available)
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
  }
  
  // DOM nodes count
  domNodes.value = document.querySelectorAll('*').length
  
  // Load time
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    loadTime.value = Math.round(navigation.loadEventEnd - navigation.fetchStart)
  }
}

const measurePerformance = async (): Promise<void> => {
  isLoading.value = true
  
  try {
    // Simulate measurement delay
    await new Promise(resolve => setTimeout(resolve, 500))
    updateMetrics()
    console.log('[Performance] Metrics updated')
  } catch (error) {
    console.error('[Performance] Measurement failed:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleMonitoring = (): void => {
  isMonitoring.value = !isMonitoring.value
  
  if (isMonitoring.value) {
    fpsHistory.value = []
    resume()
    console.log('[Performance] Monitoring started')
  } else {
    pause()
    console.log('[Performance] Monitoring stopped')
  }
}

const clearMetrics = (): void => {
  memoryUsage.value = 0
  fps.value = 0
  loadTime.value = 0
  domNodes.value = 0
  fpsHistory.value = []
  console.log('[Performance] All metrics cleared')
}

const getFPSIndicatorColor = (fps: number): string => {
  if (fps >= 50) return 'bg-green-500'
  if (fps >= 30) return 'bg-yellow-500'
  return 'bg-destructive'
}

const getFPSBarColor = (fps: number): string => {
  if (fps >= 50) return 'bg-gradient-to-r from-green-500 to-green-600'
  if (fps >= 30) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  return 'bg-gradient-to-r from-red-500 to-red-600'
}

// Fix return type to BadgeVariant
const getLoadTimeVariant = (time: number): BadgeVariant => {
  if (time <= 1000) return 'success'
  if (time <= 3000) return 'warning'
  return 'info'
}

const getLoadTimeLabel = (time: number): string => {
  if (time <= 1000) return 'Fast'
  if (time <= 3000) return 'Moderate'
  return 'Slow'
}

// Fix return type to BadgeVariant
const getDOMNodesVariant = (nodes: number): BadgeVariant => {
  if (nodes <= 1000) return 'success'
  if (nodes <= 5000) return 'warning'
  return 'info'
}

const getDOMNodesLabel = (nodes: number): string => {
  if (nodes <= 1000) return 'Optimal'
  if (nodes <= 5000) return 'Heavy'
  return 'Critical'
}

const copyMetric = async (name: string, value: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value)
    console.log(`[Performance] Copied ${name}: ${value}`)
  } catch (err) {
    console.error('[Performance] Failed to copy:', err)
  }
}

const copyAllMetrics = async (): Promise<void> => {
  const metrics = {
    memory: `${memoryUsage.value}MB`,
    fps: fps.value,
    loadTime: `${loadTime.value}ms`,
    domNodes: domNodes.value,
    viewport: viewportSize.value,
    devicePixelRatio: devicePixelRatio.value,
    connection: connectionType.value,
    hardwareConcurrency: hardwareConcurrency.value,
    fpsHistory: fpsHistory.value,
    timestamp: new Date().toISOString()
  }
  
  try {
    await navigator.clipboard.writeText(JSON.stringify(metrics, null, 2))
    console.log('[Performance] All metrics copied to clipboard')
  } catch (err) {
    console.error('[Performance] Failed to copy all metrics:', err)
  }
}

const logPerformanceData = (): void => {
  console.group('[Performance] Current Metrics')
  console.log('Memory Usage:', `${memoryUsage.value}MB`)
  console.log('FPS:', fps.value)
  console.log('Load Time:', `${loadTime.value}ms`)
  console.log('DOM Nodes:', domNodes.value)
  console.log('Viewport:', viewportSize.value)
  console.log('Device Pixel Ratio:', devicePixelRatio.value)
  console.log('Connection:', connectionType.value)
  console.log('Hardware Concurrency:', hardwareConcurrency.value)
  console.log('FPS History:', fpsHistory.value)
  console.groupEnd()
}

onMounted(() => {
  updateMetrics()
  resume()
})

onUnmounted(() => {
  pause()
})
</script>
