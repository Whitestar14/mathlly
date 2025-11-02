<template>
  <div class="space-y-4">
    <!-- Status Grid -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Current Version -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Current</span>
        <div class="flex items-center justify-between">
          <span class="text-sm text-foreground dark:text-foreground font-mono">{{ currentVersion || 'Unknown' }}</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            @click="copyToClipboard(currentVersion)"
          >
            <CopyIcon class="h-3 w-3" />
          </BaseButton>
        </div>
      </div>

      <!-- Latest Version -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Latest</span>
        <div class="flex items-center justify-between">
          <span class="text-sm text-foreground dark:text-foreground font-mono">{{ latestVersion || 'Unknown' }}</span>
          <BaseButton
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            @click="copyToClipboard(latestVersion)"
          >
            <CopyIcon class="h-3 w-3" />
          </BaseButton>
        </div>
      </div>

      <!-- Needs Refresh Status -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Needs Refresh</span>
        <div class="flex items-center gap-2">
          <BaseBadge
            :variant="needRefresh ? 'success' : 'info'"
            :text="needRefresh ? 'Yes' : 'No'"
            size="sm"
          />
          <div 
            v-if="needRefresh"
            class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
          />
        </div>
      </div>

      <!-- Should Show Update -->
      <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-1">Should Show</span>
        <div class="flex items-center gap-2">
          <BaseBadge
            :variant="shouldShowUpdate ? 'success' : 'info'"
            :text="shouldShowUpdate ? 'Yes' : 'No'"
            size="sm"
          />
          <div 
            v-if="shouldShowUpdate"
            class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
          />
        </div>
      </div>
    </div>

    <!-- Features Info -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Update Features</span>
        <span class="text-xs text-muted-foreground dark:text-muted-foreground">{{ updateFeatures.length }} items</span>
      </div>
      
      <div
        v-if="updateFeatures.length > 0"
        class="space-y-1 max-h-24 overflow-y-auto"
      >
        <div
          v-for="(feature, index) in updateFeatures"
          :key="index"
          class="text-xs text-muted-foreground dark:text-muted-foreground flex items-start gap-2"
        >
          <div class="w-1 h-1 bg-primary rounded-full mt-2 shrink-0" />
          <span class="leading-relaxed">{{ feature }}</span>
        </div>
      </div>
      
      <div
        v-else
        class="text-xs text-muted-foreground dark:text-muted-foreground italic"
      >
        No features available
      </div>
    </div>

    <!-- PWA State -->
    <div class="bg-background dark:bg-background border border-border dark:border-border rounded-lg p-3">
      <span class="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wide block mb-2">PWA State</span>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Offline Ready</span>
          <BaseBadge
            :variant="offlineReady ? 'success' : 'info'"
            :text="offlineReady ? 'Ready' : 'Not Ready'"
            size="sm"
          />
        </div>
        <div>
          <span class="text-muted-foreground dark:text-muted-foreground block">Updates Enabled</span>
          <BaseBadge
            :variant="updatesEnabled ? 'success' : 'warning'"
            :text="updatesEnabled ? 'Enabled' : 'Disabled'"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- Test Actions -->
    <div class="space-y-2">
      <BaseButton
        variant="outline"
        size="sm"
        class="w-full text-xs"
        :disabled="isLoading"
        @click="simulateUpdate"
      >
        <RefreshCwIcon class="h-3 w-3 mr-1.5" />
        Simulate Update Available
      </BaseButton>
      
      <BaseButton
        variant="outline"
        size="sm"
        class="w-full text-xs"
        :disabled="isLoading"
        @click="populateUpdateInfo"
      >
        <DownloadIcon class="h-3 w-3 mr-1.5" />
        Populate Update Info
      </BaseButton>
      
      <BaseButton
        variant="outline"
        size="sm"
        class="w-full text-xs"
        :disabled="isLoading"
        @click="checkForUpdates"
      >
        <SearchIcon class="h-3 w-3 mr-1.5" />
        Check for Updates
      </BaseButton>
      
      <BaseButton
        variant="destructive"
        size="sm"
        class="w-full text-xs"
        :disabled="isLoading"
        @click="clearUpdate"
      >
        <XIcon class="h-3 w-3 mr-1.5" />
        Clear Update State
      </BaseButton>
    </div>

    <!-- Debug Info -->
    <div class="pt-3 border-t border-border dark:border-border">
      <div class="flex gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="copyDebugInfo"
        >
          <CopyIcon class="h-3 w-3 mr-1.5" />
          Copy Debug Info
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-xs flex-1"
          @click="logCurrentState"
        >
          <TerminalIcon class="h-3 w-3 mr-1.5" />
          Log State
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  RefreshCwIcon, 
  DownloadIcon, 
  SearchIcon, 
  XIcon, 
  CopyIcon, 
  TerminalIcon 
} from 'lucide-vue-next'
import { usePWA } from '@composables/core/usePWA'
import { BaseButton, BaseBadge } from '@components/ui'

const {
  needRefresh,
  offlineReady,
  latestVersion,
  updateFeatures,
  shouldShowUpdate,
  currentVersion,
  updatesEnabled,
  populateUpdateInfo,
  checkForVersionUpdates
} = usePWA()

const isLoading = ref(false)

const simulateUpdate = async (): Promise<void> => {
  isLoading.value = true
  try {
    needRefresh.value = true
    await populateUpdateInfo()
    console.log('[PWA Test] Simulated update available')
  } catch (error) {
    console.error('[PWA Test] Failed to simulate update:', error)
  } finally {
    isLoading.value = false
  }
}

const checkForUpdates = async (): Promise<void> => {
  isLoading.value = true
  try {
    await checkForVersionUpdates()
    console.log('[PWA Test] Checked for updates')
  } catch (error) {
    console.error('[PWA Test] Failed to check for updates:', error)
  } finally {
    isLoading.value = false
  }
}

const clearUpdate = (): void => {
  needRefresh.value = false
  latestVersion.value = ''
  updateFeatures.value = []
  console.log('[PWA Test] Cleared update state')
}

const copyToClipboard = async (text: string): Promise<void> => {
  if (!text) return
  
  try {
    await navigator.clipboard.writeText(text)
    console.log('[PWA Test] Copied to clipboard:', text)
  } catch (err) {
    console.error('[PWA Test] Failed to copy:', err)
  }
}

const copyDebugInfo = async (): Promise<void> => {
  const debugInfo = {
    currentVersion: currentVersion.value,
    latestVersion: latestVersion.value,
    needRefresh: needRefresh.value,
    offlineReady: offlineReady.value,
    shouldShowUpdate: shouldShowUpdate.value,
    updatesEnabled: updatesEnabled.value,
    updateFeatures: updateFeatures.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }
  
  await copyToClipboard(JSON.stringify(debugInfo, null, 2))
}

const logCurrentState = (): void => {
  console.group('[PWA Test] Current State')
  console.log('Current Version:', currentVersion.value)
  console.log('Latest Version:', latestVersion.value)
  console.log('Needs Refresh:', needRefresh.value)
  console.log('Offline Ready:', offlineReady.value)
  console.log('Should Show Update:', shouldShowUpdate.value)
  console.log('Updates Enabled:', updatesEnabled.value)
  console.log('Update Features:', updateFeatures.value)
  console.groupEnd()
}
</script>
