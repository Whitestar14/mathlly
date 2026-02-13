import { ref, computed, watch, onUnmounted, type Ref } from 'vue'
import { useIntervalFn, useTimeoutFn, useNetwork } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { routeError } from '@router/errorHandler'

export function useErrorRetry(
  is404: Ref<boolean>,
  isRouteError: boolean,
  isGlobalError: boolean,
  onRetry: () => Promise<void>
) {
  const { isOnline } = useNetwork()
  const { warning } = useToast()
  
  const isOffline = computed(() => !isOnline.value)
  const isManualRetrying = ref(false)
  const manualRetryFeedbackMessage = ref('')
  const autoRetryActive = ref(false)
  const autoRetryCountdownTime = ref(0)
  const AUTO_RETRY_INITIAL_DELAY_SECONDS = 30

  // Timer logic for countdown
  const { pause: pauseAutoRetry, resume: resumeAutoRetry } = useIntervalFn(() => {
    if (isOnline.value) {
      handleManualRetry()
      pauseAutoRetry()
      return
    }

    autoRetryCountdownTime.value--

    if (autoRetryCountdownTime.value <= 0) {
      handleManualRetry()
      // If still offline after attempt, restart timer with longer delay
      if (isOffline.value) {
        pauseAutoRetry()
        useTimeoutFn(() => {
          autoRetryCountdownTime.value = Math.min(AUTO_RETRY_INITIAL_DELAY_SECONDS * 2, 120)
          resumeAutoRetry()
        }, 1000)
      }
    }
  }, 1000, { immediate: false })

  const canAttemptRetry = computed(() => {
    return !is404.value && (isRouteError || isOffline.value || isGlobalError)
  })

  async function handleManualRetry() {
    if (isManualRetrying.value) return

    isManualRetrying.value = true
    manualRetryFeedbackMessage.value = ''
    cancelAutomaticRetry()

    if (isOffline.value) {
      warning('Still offline. Please check your connection.')
      useTimeoutFn(() => { isManualRetrying.value = false }, 1500)
      
      // Re-enable auto-retry if we are still offline and it's a retryable error
      if ((isRouteError || isGlobalError || (routeError.value && Object.keys(routeError.value).length > 0)) && !is404.value) {
        startAutomaticRetry()
      }
      return
    }

    try {
      await onRetry()
    } finally {
      useTimeoutFn(() => { isManualRetrying.value = false }, 200)
    }
  }

  function startAutomaticRetry() {
    if (!isOffline.value || autoRetryActive.value || is404.value) return
    autoRetryActive.value = true
    autoRetryCountdownTime.value = AUTO_RETRY_INITIAL_DELAY_SECONDS
    manualRetryFeedbackMessage.value = ''
    resumeAutoRetry()
  }

  function cancelAutomaticRetry() {
    pauseAutoRetry()
    autoRetryActive.value = false
    manualRetryFeedbackMessage.value = ''
  }

  // Watch network status to auto-trigger retry
  watch(isOnline, online => {
    if (online && autoRetryActive.value) {
      manualRetryFeedbackMessage.value = 'Connection restored! Reloading...'
      useTimeoutFn(handleManualRetry, 1000)
    } else if (!online && !autoRetryActive.value && !is404.value) {
      startAutomaticRetry()
    }
  }, { immediate: true })

  onUnmounted(cancelAutomaticRetry)

  return {
    isOnline,
    isOffline,
    isManualRetrying,
    autoRetryActive,
    autoRetryCountdownTime,
    manualRetryFeedbackMessage,
    canAttemptRetry,
    handleManualRetry,
    cancelAutomaticRetry
  }
}