<script setup lang="ts">
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { 
  RefreshCwIcon, 
  XIcon, 
  CheckIcon, 
  ChevronDownIcon, 
  ArrowRightIcon,
  SparklesIcon,
  DownloadIcon,
  BookOpenIcon,
  ExternalLinkIcon
} from 'lucide-vue-next'
import { usePWA } from '@/composables/usePWA'
import { useWindowSize } from '@vueuse/core'
import BaseButton from '@/components/base/BaseButton.vue'

// Use the PWA composable
const {
  needRefresh,
  latestVersion,
  updateFeatures,
  shouldShowUpdate,
  updateApp,
  dismissUpdate,
  currentVersion
} = usePWA()

// Responsive utilities
const { width } = useWindowSize()

// Local state
const showDetails: Ref<boolean> = ref(false)
const isUpdating: Ref<boolean> = ref(false)

// Computed properties
const hasReleaseNotes: ComputedRef<boolean> = computed(() => {
  return Boolean(
    latestVersion.value && 
    latestVersion.value !== 'Service Worker Update' && 
    updateFeatures.value.length > 0
  )
})

const isMobile: ComputedRef<boolean> = computed(() => width.value < 640)

/**
 * Check if this is a service worker update
 */
const isServiceWorkerUpdate: ComputedRef<boolean> = computed(() => {
  return latestVersion.value === 'Service Worker Update' || 
         (needRefresh.value && !latestVersion.value) ||
         (needRefresh.value && latestVersion.value === currentVersion.value)
})

/**
 * Get the display version for the update
 */
const displayLatestVersion: ComputedRef<string> = computed(() => {
  if (isServiceWorkerUpdate.value) {
    return 'SW Update'
  }
  return latestVersion.value
})

/**
 * Get preview feature count based on screen size
 */
const getPreviewCount = (): number => {
  if (isMobile.value) return 1
  return 2
}

/**
 * Get preview features for collapsed state
 */
const getPreviewFeatures = (): string[] => {
  const count = getPreviewCount()
  return updateFeatures.value.slice(0, count).map(feature => {
    // Truncate long features for preview
    if (isMobile.value && feature.length > 25) {
      return `${feature.substring(0, 25)}...`
    }
    if (!isMobile.value && feature.length > 30) {
      return `${feature.substring(0, 30)}...`
    }
    return feature
  })
}

/**
 * Format version string for display
 */
const formatVersion = (version: string): string => {
  if (!version) return ''
  
  // Handle service worker updates
  if (version === 'Service Worker Update' || version === 'SW Update') {
    return 'SW Update'
  }
  
  const cleanVersion = version.replace(/^v/, '')
  
  if (cleanVersion.includes('beta')) {
    const [versionNum] = cleanVersion.split('-')
    return `${versionNum} β`
  }
  
  if (cleanVersion.includes('alpha')) {
    const [versionNum] = cleanVersion.split('-')
    return `${versionNum} α`
  }
  
  return cleanVersion
}

/**
 * Get contextual update description
 */
const getUpdateDescription = (): string => {
  // Service worker update
  if (isServiceWorkerUpdate.value) {
    return isMobile.value 
      ? 'App update ready - improved performance' 
      : 'App update ready - improved offline functionality and performance'
  }
  
  // Version update
  if (latestVersion.value && currentVersion.value && 
      latestVersion.value !== currentVersion.value) {
    
    // Check for beta to stable transition
    if (currentVersion.value.includes('beta') && !latestVersion.value.includes('beta')) {
      return 'Stable release ready - enhanced stability and performance'
    }
    
    if (updateFeatures.value.length > 0) {
      const featureText = isMobile.value ? 'updates' : 'features and improvements'
      return `${updateFeatures.value.length} new ${featureText} available`
    }
    
    return 'New version available with improvements'
  }
  
  return 'Enhanced experience awaits with the latest version'
}

/**
 * Toggle update details visibility
 */
const toggleDetails = (): void => {
  showDetails.value = !showDetails.value
}

/**
 * Handle update button click with loading state
 */
const handleUpdate = async (): Promise<void> => {
  if (isUpdating.value) return
  
  isUpdating.value = true
  
  try {
    await updateApp()
  } catch (error) {
    console.error('Failed to update:', error)
  } finally {
    isUpdating.value = false
  }
}

/**
 * Open release notes
 */
const openReleaseNotes = (): void => {
  const url = `https://github.com/Whitestar14/mathlly-app/releases/tag/v${latestVersion.value}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
<template>
  <Transition
    enter-active-class="transform transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transform transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-full opacity-0 scale-95"
  >
    <div 
      v-if="shouldShowUpdate"
      class="fixed bottom-3 left-3 right-3 z-50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-full sm:max-w-sm"
    >
      <!-- Main Card with Proper Border Isolation -->
      <div class="relative bg-background dark:bg-background rounded-2xl shadow-2xl border border-border dark:border-border overflow-hidden">
        <!-- Solid background layer to prevent background bleed -->
        <div class="absolute inset-0 bg-background/95 dark:bg-background/95 rounded-2xl" />
        
        <!-- Content overlay -->
        <div class="relative">
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-gray-800/10 pointer-events-none" />
          
          <!-- Header Section -->
          <div class="relative p-3 sm:p-5">
            <div class="flex items-start gap-2.5 sm:gap-3">
              <!-- Icon -->
              <div class="relative flex-shrink-0 mt-0.5">
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl blur-sm opacity-60" />
                <div class="relative bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
                  <RefreshCwIcon class="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <!-- Title Row -->
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-sm font-semibold text-foreground dark:text-foreground truncate">
                    {{ isServiceWorkerUpdate ? 'App Update Available' : 'Update Available' }}
                  </h3>
                  
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <!-- Details Toggle Icon -->
                    <BaseButton
                      v-if="updateFeatures.length > 0"
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7"
                      @click="toggleDetails"
                    >
                      <ChevronDownIcon 
                        class="h-4 w-4 transition-transform duration-300 ease-out"
                        :class="{ 'rotate-180': showDetails }"
                      />
                    </BaseButton>
                    
                    <!-- Close Button -->
                    <BaseButton
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7"
                      @click="dismissUpdate"
                    >
                      <XIcon class="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
                
                <!-- Version Progression -->
                <div class="flex items-center gap-1.5 mb-2 sm:mb-3 overflow-hidden">
                  <span 
                    v-if="currentVersion && !isServiceWorkerUpdate" 
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border border-border/50 dark:border-border/50 flex-shrink-0"
                  >
                    {{ formatVersion(currentVersion) }}
                  </span>
                  <ArrowRightIcon 
                    v-if="currentVersion && displayLatestVersion && !isServiceWorkerUpdate" 
                    class="h-3 w-3 text-muted-foreground flex-shrink-0" 
                  />
                  <span 
                    v-if="displayLatestVersion" 
                    class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm flex-shrink-0"
                  >
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                    {{ formatVersion(displayLatestVersion) }}
                  </span>
                </div>
                
                <!-- Description -->
                <p class="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed mb-2 sm:mb-3">
                  {{ getUpdateDescription() }}
                </p>
                
                <!-- Quick Feature Preview -->
                <div
                  v-if="updateFeatures.length > 0"
                  class="space-y-2"
                >
                  <!-- Collapsed Preview -->
                  <div
                    v-if="!showDetails"
                    class="flex flex-wrap gap-1"
                  >
                    <span
                      v-for="(feature, index) in getPreviewFeatures()"
                      :key="index"
                      class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-primary border border-indigo-100 dark:border-indigo-800/50"
                    >
                      <SparklesIcon class="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                      <span class="truncate">{{ feature }}</span>
                    </span>
                    <span
                      v-if="updateFeatures.length > getPreviewCount()"
                      class="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground"
                    >
                      +{{ updateFeatures.length - getPreviewCount() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Expandable Details -->
          <div class="overflow-hidden">
            <Transition
              enter-active-class="transition-all duration-400 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-64 opacity-100"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="max-h-64 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-if="showDetails && updateFeatures.length > 0"
                class="relative"
              >
                <!-- Divider -->
                <div class="px-3 sm:px-5">
                  <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                </div>
                
                <!-- Details Content -->
                <div class="px-3 sm:px-5 py-3 sm:py-4">
                  <div class="max-h-40 overflow-y-auto scrollbar-thin">
                    <h4 class="text-xs font-medium text-foreground dark:text-muted-foreground mb-2 sm:mb-3 flex items-center">
                      <div class="w-1 h-1 bg-primary rounded-full mr-2" />
                      {{ isServiceWorkerUpdate ? 'Service Worker Updates' : `What's new in ${formatVersion(displayLatestVersion)}` }}
                    </h4>
                    
                    <!-- Feature List -->
                    <div class="space-y-2 sm:space-y-2.5">
                      <div
                        v-for="(feature, index) in updateFeatures"
                        :key="index"
                        class="flex items-start group"
                      >
                        <div class="relative mt-1.5 mr-2.5 sm:mr-3 flex-shrink-0">
                          <div class="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-opacity" />
                          <CheckIcon class="relative h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span class="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed">{{ feature }}</span>
                      </div>
                    </div>
                    
                    <!-- Release Notes Link -->
                    <div
                      v-if="hasReleaseNotes"
                      class="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border dark:border-border"
                    >
                      <BaseButton
                        variant="link"
                        size="sm"
                        class="text-xs p-0 h-auto"
                        @click="openReleaseNotes"
                      >
                        <BookOpenIcon class="h-3 w-3 mr-1.5" />
                        <span class="hidden sm:inline">View full release notes</span>
                        <span class="sm:hidden">Release notes</span>
                        <ExternalLinkIcon class="h-3 w-3 ml-1" />
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          
          <!-- Action Bar -->
          <div class="relative px-3 sm:px-5 py-2.5 sm:py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/50 border-t border-border/30 dark:border-border/30">
            <!-- Action Buttons -->
            <div class="flex gap-2 justify-end">
              <BaseButton
                variant="outline"
                size="sm"
                class="text-xs"
                @click="dismissUpdate"
              >
                Later
              </BaseButton>
              
              <BaseButton
                variant="primary"
                size="sm"
                :disabled="isUpdating"
                :loading="isUpdating"
                class="text-xs min-w-[90px]"
                @click="handleUpdate"
              >
                <DownloadIcon 
                  v-if="!isUpdating"
                  class="h-3.5 w-3.5" 
                />
                {{ isUpdating ? 'Updating...' : (isServiceWorkerUpdate ? 'Update App' : 'Update Now') }}
              </BaseButton>
            </div>
          </div>
          
          <!-- Bottom accent -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-60" />
        </div>
      </div>
    </div>
  </Transition>
</template>

