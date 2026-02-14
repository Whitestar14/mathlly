<template>
  <BasePage
    :title="state.pageTitle"
    :show-header="false"
    :show-footer="false"
    main-class="flex flex-col items-center justify-center min-h-[clamp(700px,100%,100vh)] p-4 text-center bg-background transition-colors duration-300">
    <div class="space-y-6 max-w-lg">

      <div class="relative">
        <h1 class="text-9xl font-bold text-muted-foreground select-none">
          {{ state.visualCode }}
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <kbd class="text-muted-foreground font-medium px-3 py-2 text-xl bg-muted/80 border border-border rounded-md shadow-sm">
            {{ state.stylizedCode }}
          </kbd>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-medium text-foreground">
          {{ state.title }}
        </h2>
        <p class="text-muted-foreground">
          {{ state.message }}
        </p>

        <p
          v-if="isOffline && autoRetryActive && !is404Error"
          class="text-primary text-sm mt-2">
          {{ isOnline ? 'Reconnected! Attempting to reload...' : `Connection lost. Auto-retrying in ${autoRetryCountdownTime}s...` }}
          <BaseButton
            variant="link"
            size="sm"
            class="text-sm"
            @click="cancelAutomaticRetry">
            Cancel Auto-Retry
          </BaseButton>
        </p>
        <p
          v-if="manualRetryFeedbackMessage"
          class="text-accent text-sm mt-2">
          {{ manualRetryFeedbackMessage }}
        </p>
      </div>

      <div class="flex w-full flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <BaseButton
          v-if="is404Error"
          variant="ghost"
          class="w-full sm:w-auto"
          @click="router.back()">
          <ArrowLeft class="h-4 w-4" />
          Go Back
        </BaseButton>

        <BaseButton
          v-if="canAttemptRetry"
          variant="ghost"
          :disabled="isManualRetrying"
          :loading="isManualRetrying && !isOffline"
          :aria-label="isOffline ? 'Retry Connection' : 'Try Loading Page Again'"
          class="w-full sm:w-auto"
          @click="handleManualRetry">
          <RefreshCwIcon
            class="h-4 w-4"
            :class="[isManualRetrying && !isOffline && 'hidden']" />
          {{ isOffline ? 'Retry Connection' : 'Try Again' }}
        </BaseButton>

        <BaseButton
          variant="primary"
          :disabled="isManualRetrying"
          class="w-full sm:w-auto"
          @click="navigateToHome">
          <HomeIcon class="h-4 w-4" />
          Go Home
        </BaseButton>
      </div>

      <div
        v-if="state.stackTrace && !isOffline && !is404Error"
        class="mt-8 ml-auto mr-auto max-w-[90vw]">
        <BaseCollapsible
          v-model:open="showDetails"
          title="Technical Details"
          :default-open="false">
          <div class="flex justify-end gap-2 mb-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/60"
              aria-label="Copy stack trace"
              @click.stop="copyStack">
              <component
                :is="copied ? Check : Copy"
                class="size-4 transition-transform duration-150" />
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/60"
              @click.stop="reportError">
              Report
            </button>
          </div>

          <pre class="text-xs text-foreground dark:text-muted-foreground whitespace-pre-wrap break-words">{{ state.stackTrace }}</pre>
        </BaseCollapsible>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClipboard, useTimeoutFn, useNetwork } from '@vueuse/core'
import { HomeIcon, RefreshCwIcon, Copy, ArrowLeft, Check } from 'lucide-vue-next'
import { clearRouteError, routePath, hasError } from '@router/errorHandler'
import { useToast } from '@composables/ui/useToast'
import { useAppStorageStore } from '@stores/appStorage'
import { BasePage, BaseButton, BaseCollapsible } from '@components/ui'
import { useErrorState } from '@composables/utils/useErrorState'
import { useErrorRetry } from '@composables/utils/useErrorRetry'

const props = defineProps({
  error: { type: [Error, Object, String], default: null },
  path: { type: String, default: '' },
  isRouteError: { type: Boolean, default: false },
  isGlobalError: { type: Boolean, default: false },
  is404: { type: Boolean, default: false }
})

const { success, error: toastError } = useToast()
const storageStore = useAppStorageStore()
const router = useRouter()
const route = useRoute()
const { copy } = useClipboard()
const network = useNetwork()

const showDetails = ref(false)
const copied = ref(false)

const performRetry = async() => {
  clearRouteError()
  const targetPath = routePath.value || props.path || route.fullPath || '/'
  try {
    await router.replace(targetPath)
  } catch(err) {
    console.error('ErrorFallback: Retry navigation failed:', err)
  }
}

// Setup shared offline state
import { watch } from 'vue'
const _isOffline = ref(!network.isOnline.value)
watch(network.isOnline, val => { _isOffline.value = !val })

// Init State
// Passing props directly
const errorState = useErrorState(props, route, _isOffline)
// Init Retry
const retryState = useErrorRetry(errorState.is404Error, props.isRouteError, props.isGlobalError, performRetry)

// Re-expose to template
const { state, is404Error } = errorState
const { isOnline, isOffline, isManualRetrying, autoRetryActive, autoRetryCountdownTime, manualRetryFeedbackMessage, canAttemptRetry, handleManualRetry, cancelAutomaticRetry } = retryState

const navigateToHome = () => {
  if (retryState.isManualRetrying.value) return
  retryState.cancelAutomaticRetry()

  clearRouteError()
  hasError.value = false
  const last = storageStore.get('router', 'lastVisitedPath', routePath.value || '/') || '/'
  router.replace(last).catch(() => {
    toastError('Could not navigate to previous page.')
  })
}

const copyStack = async() => {
  await copy(errorState.state.stackTrace || '')
  copied.value = true
  useTimeoutFn(() => (copied.value = false), 500)
  success('Stack trace copied.')
}

const reportError = () => {
  try {
    const title = encodeURIComponent(`Error: ${errorState.state.visualCode} - ${errorState.state.title}`)
    const body = encodeURIComponent(`**Page:** ${route.fullPath}\n**Stack:**\n\`\`\`\n${errorState.state.stackTrace || ''}\n\`\`\``)
    window.open(`https://github.com/Whitestar14/mathlly/issues/new?title=${title}&body=${body}`, '_blank')
  } catch {
    toastError('Could not open report window.')
  }
}
</script>
