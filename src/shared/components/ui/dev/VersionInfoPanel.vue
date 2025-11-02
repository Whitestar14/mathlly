<template>
  <div class="space-y-4">
    <!-- Version Cards -->
    <div class="space-y-3">
      <!-- App Version -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">App Version</span>
          <BaseBadge
            type="custom"
            :text="versionStore.versionInfo.full"
            :show-notch="true"
            class="font-mono"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-foreground dark:text-foreground font-mono">{{ versionStore.versionInfo.full }}</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            @click="copyToClipboard(versionStore.versionInfo.full)"
          >
            <CopyIcon class="h-3 w-3" />
          </BaseButton>
        </div>
      </div>

      <!-- Build Info -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Build Date</span>
            <span class="text-sm text-foreground dark:text-foreground font-mono">{{ buildDate }}</span>
          </div>
          <div>
            <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Environment</span>
            <BaseBadge
              :variant="isDev ? 'warning' : 'success'"
              :text="isDev ? 'Development' : 'Production'"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Framework Info -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-4">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-2">Framework</span>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
              <span class="text-foreground text-xs font-bold">V</span>
            </div>
            <span class="text-sm text-foreground dark:text-foreground">Vue.js</span>
          </div>
          <span class="text-sm text-muted-foreground dark:text-muted-foreground font-mono">{{ vueVersion }}</span>
        </div>
      </div>

      <!-- System Info -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-4">
        <div class="space-y-3">
          <div>
            <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Browser</span>
            <div class="flex items-center justify-between">
              <span class="text-sm text-foreground dark:text-foreground">{{ browserInfo.name }}</span>
              <span class="text-xs text-muted-foreground dark:text-muted-foreground font-mono">{{ browserInfo.version }}</span>
            </div>
          </div>
          
          <div>
            <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Platform</span>
            <span class="text-sm text-foreground dark:text-foreground">{{ platformInfo }}</span>
          </div>
          
          <div>
            <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Screen</span>
            <span class="text-sm text-foreground dark:text-foreground font-mono">{{ screenInfo }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Info -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-4">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-2">Performance</span>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-muted-foreground dark:text-muted-foreground block">Memory</span>
            <span class="text-foreground dark:text-foreground font-mono">{{ memoryInfo }}</span>
          </div>
          <div>
            <span class="text-muted-foreground dark:text-muted-foreground block">Connection</span>
            <span class="text-foreground dark:text-foreground">{{ connectionInfo }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="pt-3 border-t border-border dark:border-border">
      <div class="flex gap-2">
        <BaseButton
          variant="outline"
          size="sm"
          class="text-xs flex-1"
          @click="copyAllInfo"
        >
          <CopyIcon class="h-3 w-3 mr-1.5" />
          Copy All
        </BaseButton>
        
        <BaseButton
          variant="outline"
          size="sm"
          class="text-xs flex-1"
          @click="refreshInfo"
        >
          <RefreshCwIcon class="h-3 w-3 mr-1.5" />
          Refresh
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { CopyIcon, RefreshCwIcon } from 'lucide-vue-next'
import { version as vueVersion } from 'vue'
import { useVersionStore } from '@stores/version'
import { BaseButton, BaseBadge } from '@components/ui'

const versionStore = useVersionStore()
const isDev = import.meta.env.DEV

// Reactive data
const screenInfo = ref('')
const memoryInfo = ref('')
const connectionInfo = ref('')

const buildDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const browserInfo = computed(() => {
  const ua = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'
  
  if (ua.includes('Chrome')) {
    name = 'Chrome'
    const match = ua.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (ua.includes('Firefox')) {
    name = 'Firefox'
    const match = ua.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (ua.includes('Safari')) {
    name = 'Safari'
    const match = ua.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (ua.includes('Edge')) {
    name = 'Edge'
    const match = ua.match(/Edg\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  
  return { name, version }
})

const platformInfo = computed(() => {
  const platform = navigator.platform
  const ua = navigator.userAgent
  
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  
  return platform || 'Unknown'
})

const updateDynamicInfo = () => {
  // Screen info
  screenInfo.value = `${window.screen.width}×${window.screen.height}`
  
  // Memory info (if available)
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
    memoryInfo.value = `${used}/${total} MB`
  } else {
    memoryInfo.value = 'Not available'
  }
  
  // Connection info (if available)
  if ('connection' in navigator) {
    const conn = (navigator as any).connection
    connectionInfo.value = conn.effectiveType || 'Unknown'
  } else {
    connectionInfo.value = 'Not available'
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Copied to clipboard:', text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const copyAllInfo = async () => {
  const info = [
    `App Version: ${versionStore.versionInfo.full}`,
    `Build Date: ${buildDate.value}`,
    `Environment: ${isDev ? 'Development' : 'Production'}`,
    `Vue Version: ${vueVersion}`,
    `Browser: ${browserInfo.value.name} ${browserInfo.value.version}`,
    `Platform: ${platformInfo.value}`,
    `Screen: ${screenInfo.value}`,
    `Memory: ${memoryInfo.value}`,
    `Connection: ${connectionInfo.value}`,
    `User Agent: ${navigator.userAgent}`
  ].join('\n')
  
  await copyToClipboard(info)
}

const refreshInfo = () => {
  updateDynamicInfo()
  console.log('Version info refreshed')
}

onMounted(() => {
  updateDynamicInfo()
})
</script>
