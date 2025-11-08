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

import { usePWA } from '@composables/core/usePWA'
import { BaseButton } from '@components/ui'
import { formatVersion } from '@composables/utils/versionUtils'

const {
  needRefresh,
  latestVersion,
  updateFeatures,
  shouldShowUpdate,
  updateApp,
  dismissUpdate,
  currentVersion
} = usePWA()

// Local UI state
const showDetails: Ref<boolean> = ref(false)

// Derived flags and helpers
const hasReleaseNotes: ComputedRef<boolean> = computed(() => {
  return Boolean(
    latestVersion.value &&
      latestVersion.value !== 'Service Worker Update' &&
      updateFeatures.value.length > 0
  )
})

const isServiceWorkerUpdate: ComputedRef<boolean> = computed(() => {
  return (
    latestVersion.value === 'Service Worker Update' ||
    (needRefresh.value && !latestVersion.value) ||
    (needRefresh.value && latestVersion.value === currentVersion.value)
  )
})

const displayLatestVersion: ComputedRef<string> = computed(() => {
  if (isServiceWorkerUpdate.value) return 'SW Update'
  return latestVersion.value
})

const toggleDetails = (): void => {
  showDetails.value = !showDetails.value
}

const openReleaseNotes = (): void => {
  const url = `https://github.com/Whitestar14/mathlly-app/releases/tag/v${latestVersion.value}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const getPreviewCount = (): number => (window.innerWidth < 640 ? 1 : 2)

const getPreviewFeatures = (): string[] => {
  const isMobile = window.innerWidth < 640
  const count = getPreviewCount()
  return updateFeatures.value.slice(0, count).map(feature => {
    if (isMobile && feature.length > 25) return `${feature.substring(0, 25)}...`
    if (!isMobile && feature.length > 30) return `${feature.substring(0, 30)}...`
    return feature
  })
}

const getUpdateDescription = (): string => {
  const isMobile = window.innerWidth < 640

  if (isServiceWorkerUpdate.value) {
    return isMobile ?
      'App update ready - improved performance' :
      'App update ready - improved offline functionality and performance'
  }

  if (latestVersion.value && currentVersion.value && latestVersion.value !== currentVersion.value) {
    if (currentVersion.value.includes('beta') && !latestVersion.value.includes('beta')) {
      return 'Stable release ready - enhanced stability and performance'
    }
    if (updateFeatures.value.length > 0) {
      const featureText = isMobile ? 'updates' : 'features and improvements'
      return `${updateFeatures.value.length} new ${featureText} available`
    }
    return 'New version available with improvements'
  }

  return 'Enhanced experience awaits with the latest version'
}

const handleUpdate = async(): Promise<void> => {
  try {
    await updateApp()
  } catch(error) {
    console.error('Failed to update:', error)
  }
}
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transform transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-full opacity-0 scale-95">
    <div
      v-if="shouldShowUpdate"
      class="fixed bottom-3 left-3 right-3 z-50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-full sm:max-w-sm">
      <div class="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        <div class="p-4">
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <div class="bg-primary/10 p-2 rounded-lg">
                <RefreshCwIcon class="h-4 w-4 text-primary" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <!-- Header -->
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-card-foreground">
                  {{ isServiceWorkerUpdate ? 'App Update Available' : 'Update Available' }}
                </h3>

                <div class="flex items-center gap-1 flex-shrink-0">
                  <BaseButton
                    v-if="updateFeatures.length > 0"
                    variant="ghost"
                    size="icon"
                    @click="toggleDetails">
                    <ChevronDownIcon
                      class="h-4 w-4 transition-transform duration-200"
                      :class="{ 'rotate-180': showDetails }" />
                  </BaseButton>

                  <BaseButton variant="ghost" size="icon" @click="dismissUpdate">
                    <XIcon class="h-4 w-4" />
                  </BaseButton>
                </div>
              </div>

              <!-- Versions -->
              <div class="flex items-center gap-2 mb-3 overflow-hidden">
                <span
                  v-if="currentVersion && !isServiceWorkerUpdate"
                  class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground border border-border flex-shrink-0">
                  {{ formatVersion(currentVersion) }}
                </span>

                <ArrowRightIcon
                  v-if="currentVersion && displayLatestVersion && !isServiceWorkerUpdate"
                  class="h-3 w-3 text-muted-foreground flex-shrink-0" />

                <span
                  v-if="displayLatestVersion"
                  class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                  <span class="size-1.5 bg-primary rounded-full mr-1.5 animate-pulse"></span>
                  {{ formatVersion(displayLatestVersion) }}
                </span>
              </div>

              <!-- Description -->
              <p class="text-xs text-muted-foreground leading-relaxed mb-3">{{ getUpdateDescription() }}</p>

              <!-- Feature preview -->
              <div v-if="updateFeatures.length > 0" class="space-y-2">
                <Transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <div v-if="!showDetails" class="flex flex-wrap gap-1">
                    <span
                      v-for="(feature, index) in getPreviewFeatures()"
                      :key="index"
                      class="inline-flex items-center px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                      <SparklesIcon class="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                      <span class="truncate">{{ feature }}</span>
                    </span>

                    <span
                      v-if="updateFeatures.length > getPreviewCount()"
                      class="inline-flex items-center px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                      +{{ updateFeatures.length - getPreviewCount() }}
                    </span>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded details -->
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-64 opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-64 opacity-100"
          leave-to-class="max-h-0 opacity-0">
          <div v-if="showDetails" class="overflow-hidden">
            <div class="border-t border-border"></div>

            <div class="p-4">
              <div class="max-h-40 overflow-y-auto">
                <h4 class="text-xs font-medium text-card-foreground mb-3 flex items-center">
                  <div class="size-1 bg-primary rounded-full mr-2"></div>
                  {{ isServiceWorkerUpdate ? 'Service Worker Updates' : `What's new in ${formatVersion(displayLatestVersion)}` }}
                </h4>

                <div class="space-y-2">
                  <div
                    v-for="(feature, index) in updateFeatures"
                    :key="index"
                    class="flex items-start gap-2">
                    <CheckIcon class="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span class="text-xs text-muted-foreground leading-relaxed">{{ feature }}</span>
                  </div>
                </div>

                <div v-if="hasReleaseNotes" class="mt-4 pt-3 border-t border-border">
                  <BaseButton variant="link" size="sm" class="text-xs p-0 h-auto" @click="openReleaseNotes">
                    <BookOpenIcon class="h-3 w-3" />
                    <span class="hidden sm:inline">View full release notes</span>
                    <span class="sm:hidden">Release notes</span>
                    <ExternalLinkIcon class="h-3 w-3" />
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Footer actions -->
        <div class="border-t border-border bg-muted/30 p-3">
          <div class="flex gap-2 justify-end">
            <BaseButton variant="outline" size="sm" @click="dismissUpdate">Later</BaseButton>

            <BaseButton variant="primary" size="sm" @click="handleUpdate">
              <DownloadIcon class="size-4" />
              Update App
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
