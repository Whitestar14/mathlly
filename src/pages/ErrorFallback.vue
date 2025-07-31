<template>
  <BasePage
    :title="errorState.pageTitle"
    :show-header="false"
    :show-footer="false"
    main-class="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background transition-colors duration-300"
  >
    <div class="space-y-6 max-w-lg">
      <!-- Error Code Visual -->
      <div class="relative">
        <h1 class="text-9xl font-bold text-muted-foreground select-none">
          {{ errorState.visualCode }}
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <kbd class="text-muted-foreground font-medium px-3 py-2 text-xl bg-muted/80 border border-border rounded-md shadow-sm">
            {{ errorState.stylizedCode }}
          </kbd>
        </div>
      </div>

      <!-- Error Message -->
      <div class="space-y-2">
        <h2 class="text-xl font-medium text-foreground">
          {{ errorState.title }}
        </h2>
        <p class="text-muted-foreground">
          {{ errorState.message }}
        </p>

        <!-- Network Status Message -->
        <p
          v-if="isOffline && autoRetryActive && !is404Error"
          class="text-primary text-sm mt-2"
        >
          {{ networkStatus ? 'Reconnected! Attempting to reload...' : `Connection lost. Auto-retrying in ${autoRetryCountdownTime}s...` }}
          <BaseButton
            variant="link"
            size="sm"
            class="text-sm"
            @click="cancelAutomaticRetry"
          >
            Cancel Auto-Retry
          </BaseButton>
        </p>
        <p
          v-if="manualRetryFeedbackMessage"
          class="text-accent text-sm mt-2"
        >
          {{ manualRetryFeedbackMessage }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex w-full flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <BaseButton
          v-if="is404Error"
          variant="ghost"
          class="w-full sm:w-auto"
          @click="router.back()"
        >
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
          @click="handleManualRetry"
        >
          <RefreshCwIcon
            class="h-4 w-4"
            :class="[isManualRetrying && !isOffline && 'hidden']"
          />
          {{ isOffline ? 'Retry Connection' : 'Try Again' }}
        </BaseButton>
        
        <BaseButton
          variant="primary"
          :disabled="isManualRetrying"
          class="w-full sm:w-auto"
          @click="navigateToHome"
        >
          <HomeIcon class="h-4 w-4" />
          Go Home
        </BaseButton>
      </div>

      <!-- Technical Details -->
      <div
        v-if="errorState.stackTrace && !isOffline && !is404Error"
        class="mt-8 p-4 bg-muted dark:bg-background ml-auto mr-auto max-w-[90vw] rounded-lg text-left overflow-auto border border-border max-h-60"
      >
        <details>
          <summary class="cursor-pointer text-primary dark:text-primary font-medium text-sm">
            Technical Details
          </summary>
          <pre class="mt-2 text-xs text-foreground dark:text-muted-foreground whitespace-pre-wrap break-words">{{ errorState.stackTrace }}</pre>
        </details>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { HomeIcon, RefreshCwIcon, ArrowLeft } from 'lucide-vue-next'
import { clearRouteError, routeError, networkStatus } from '@router/errorHandler'
import { useToast } from '@composables/ui/useToast'
import { BasePage, BaseButton } from '@components/ui'

const props = defineProps({
  error: {
    type: [Error, Object, String],
    default: null,
  },
  path: {
    type: String,
    default: '',
  },
  isRouteError: {
    type: Boolean,
    default: false,
  },
  isGlobalError: {
    type: Boolean,
    default: false,
  },
  is404: {
    type: Boolean,
    default: false,
  }
})
const { toast } = useToast()
const router = useRouter()

// --- State Management ---
const isManualRetrying = ref(false)
const manualRetryFeedbackMessage = ref('')
const autoRetryActive = ref(false)
const autoRetryCountdownTime = ref(0)
const AUTO_RETRY_INITIAL_DELAY_SECONDS = 30
let autoRetryTimerId = null

// --- Computed Properties ---
const isOffline = computed(() => !networkStatus.value)

const effectiveError = computed(() => {
  const err = props.error || routeError.value
  return err?.originalError || err
})

const is404Error = computed(() => {
  if (props.is404) return true
  
  const err = effectiveError.value
  if (!err) return false
  
  if (typeof err === 'object') {
    if (err.status === 404) return true
    if (err.message && err.message.toLowerCase().includes('not found')) return true
  }
  
  if (router.currentRoute.value.matched.length === 1 && 
      router.currentRoute.value.matched[0].path === '/:pathMatch(.*)') {
    return true
  }
  
  return false
})

const extractedErrorMessage = computed(() => {
  const err = effectiveError.value
  if (err instanceof Error && err.message) {
    return err.message
      .replace(/^(Error: )?Failed to fetch dynamically imported module:.*/i, 'Could not load page resources.')
      .replace(/^(Error: )?error loading dynamically imported module/i, 'Could not load page components.')
      .replace(/\$\$Original error:.*?\$\$/g, '')
      .trim()
  }
  if (typeof err === 'string') {
    return err
  }
  return isOffline.value ? 'Internet connection unavailable.' : 'An unexpected error occurred.'
})

const canAttemptRetry = computed(() => {
  return !is404Error.value && (props.isRouteError || isOffline.value || props.isGlobalError)
})

// --- Consolidated Error State ---
const errorState = reactive({
  visualCode: '',
  stylizedCode: '',
  title: '',
  message: '',
  pageTitle: '',
  stackTrace: ''
})

// Update error state when dependencies change
watch([is404Error, isOffline, effectiveError, extractedErrorMessage], updateErrorState, { immediate: true })

function updateErrorState() {
  // Set visual code
  if (is404Error.value) {
    errorState.visualCode = '404'
  } else if (isOffline.value) {
    errorState.visualCode = 'OFF'
  } else {
    const err = effectiveError.value
    const msg = (err?.message || '').toLowerCase()
    
    if (msg.includes('timeout')) errorState.visualCode = '408'
    else if (msg.includes('failed to fetch') || msg.includes('load chunk') || msg.includes('dynamically imported module')) errorState.visualCode = '503'
    else if (msg.includes('not found') || err?.name === 'NotFoundError') errorState.visualCode = '404'
    else if (msg.includes('permission') || msg.includes('forbidden')) errorState.visualCode = '403'
    else if (msg.includes('unauthorized')) errorState.visualCode = '401'
    else errorState.visualCode = '500'
  }

  // Set stylized code
  const codeMap = {
    '404': '{not//found}',
    'OFF': '{connection//lost}',
    '401': '{not//authorized}',
    '403': '{access//denied}',
    '408': '{request//timeout}',
    '503': '{service//issue}',
    '500': '{system//error}'
  }
  errorState.stylizedCode = codeMap[errorState.visualCode] || '{system//error}'

  // Set title
  if (is404Error.value) {
    errorState.title = 'Page Not Found'
  } else if (isOffline.value) {
    errorState.title = 'You are Offline'
  } else {
    const titleMap = {
      '404': 'Page Not Found',
      '401': 'Authentication Required',
      '403': 'Access Forbidden',
      '408': 'Request Timed Out',
      '503': 'Service Temporarily Unavailable',
      '500': props.isGlobalError ? 'Application Error' : 'Something Went Wrong'
    }
    
    // Use error message as title if it's concise and meaningful
    if (extractedErrorMessage.value &&
        !extractedErrorMessage.value.toLowerCase().includes('unknown error') &&
        !extractedErrorMessage.value.toLowerCase().includes('error occurred') &&
        extractedErrorMessage.value.length < 50 &&
        !extractedErrorMessage.value.includes('(')) {
      errorState.title = extractedErrorMessage.value
    } else {
      errorState.title = titleMap[errorState.visualCode] || 'Something Went Wrong'
    }
  }

  // Set message
  if (is404Error.value) {
    errorState.message = `We couldn't find the page at ${props.path || router.currentRoute.value.fullPath || 'the requested URL'}. Please check the address or go back.`
  } else if (isOffline.value) {
    errorState.message = 'Please check your internet connection. We will attempt to reconnect automatically.'
  } else {
    const messageMap = {
      '404': `We couldn't find the page at ${props.path ? `\`${props.path}\`` : 'the requested URL'}. Please check the address or go back.`,
      '401': 'You need to be logged in or have the correct credentials to access this page.',
      '403': "You don't have the necessary permissions to view this resource.",
      '408': 'The server took too long to respond. This might be a temporary issue. Please try again in a few moments.',
      '503': 'The service required for this page is currently unavailable or overloaded. Please try again shortly.',
      '500': 'An unexpected technical issue occurred. If this problem persists, please contact support or try again later.'
    }
    
    if (extractedErrorMessage.value && extractedErrorMessage.value !== errorState.title) {
      errorState.message = extractedErrorMessage.value
    } else {
      errorState.message = messageMap[errorState.visualCode] || messageMap['500']
    }
  }

  // Set page title
  if (is404Error.value) {
    errorState.pageTitle = '404 - Not Found'
  } else if (isOffline.value) {
    errorState.pageTitle = 'Connection Issue'
  } else if (props.isRouteError) {
    errorState.pageTitle = 'Error Loading Page'
  } else if (props.isGlobalError) {
    errorState.pageTitle = 'Application Error'
  } else {
    errorState.pageTitle = 'An Error Occurred'
  }

  // Set stack trace
  const err = effectiveError.value
  errorState.stackTrace = err instanceof Error && err.stack ? err.stack : ''
}

// --- Navigation Functions ---
const navigateToHome = () => {
  if (isManualRetrying.value) return
  cancelAutomaticRetry()
  clearRouteError()
  router.push('/').catch((err) => {
    console.error('ErrorFallback: Failed to navigate home:', err)
    toast({ type: 'error', message: 'Could not navigate to home. Please try again.'})
  })
}

async function handleManualRetry() {
  if (isManualRetrying.value) return

  isManualRetrying.value = true
  manualRetryFeedbackMessage.value = ''
  cancelAutomaticRetry()

  if (isOffline.value) {
    toast({
      type: 'warning',
      message: 'Still offline. Please check your connection.',
    })
    setTimeout(() => {
      isManualRetrying.value = false
    }, 1500)
    
    if ((props.isRouteError || props.isGlobalError || (routeError.value && Object.keys(routeError.value).length > 0)) && !is404Error.value) {
      startAutomaticRetry()
    }
    return
  }

  await new Promise((resolve) => setTimeout(resolve, 300)) // UX delay

  clearRouteError()

  try {
    const targetPath = props.path || router.currentRoute.value.redirectedFrom?.fullPath || router.options.history.state.back || '/'
    console.log(`ErrorFallback: Attempting to re-navigate to: ${targetPath}`)
    await router.replace(targetPath)
  } catch (err) {
    console.error('ErrorFallback: Error during manual retry navigation attempt:', err)
  } finally {
    setTimeout(() => {
      isManualRetrying.value = false
    }, 200) // Delay to prevent rapid clicks
  }
}

// --- Auto-retry Functions ---
function startAutomaticRetry() {
  if (!isOffline.value || autoRetryActive.value || is404Error.value) {
    return
  }

  console.log(`ErrorFallback: Starting automatic retry countdown (${AUTO_RETRY_INITIAL_DELAY_SECONDS}s)`)
  autoRetryActive.value = true
  autoRetryCountdownTime.value = AUTO_RETRY_INITIAL_DELAY_SECONDS
  manualRetryFeedbackMessage.value = ''

  if (autoRetryTimerId) clearInterval(autoRetryTimerId)

  autoRetryTimerId = setInterval(() => {
    if (!isOffline.value) {
      console.log('ErrorFallback: Network reconnected during auto-retry countdown.')
      handleManualRetry()
      cancelAutomaticRetry()
      return
    }
    
    autoRetryCountdownTime.value -= 1
    
    if (autoRetryCountdownTime.value <= 0) {
      console.log('ErrorFallback: Auto-retry countdown complete, attempting retry...')
      handleManualRetry()
      
      // If still offline after retry, restart with exponential backoff
      if (isOffline.value) {
        cancelAutomaticRetry()
        setTimeout(() => {
          autoRetryCountdownTime.value = Math.min(AUTO_RETRY_INITIAL_DELAY_SECONDS * 2, 120)
          startAutomaticRetry()
        }, 1000)
      }
    }
  }, 1000)
}

function cancelAutomaticRetry() {
  if (autoRetryTimerId) {
    clearInterval(autoRetryTimerId)
    autoRetryTimerId = null
  }
  autoRetryActive.value = false
  manualRetryFeedbackMessage.value = ''
}

// --- Watchers ---
watch(networkStatus, (isOnline) => {
  if (isOnline && autoRetryActive.value) {
    console.log('ErrorFallback: Network reconnected, attempting retry...')
    setTimeout(() => {
      manualRetryFeedbackMessage.value = 'Connection restored! Reloading...'
      setTimeout(handleManualRetry, 1000)
    }, 500)
  } else if (!isOnline && !autoRetryActive.value && (props.isRouteError || props.isGlobalError) && !is404Error.value) {
    startAutomaticRetry()
  }
}, { immediate: true })

// Start automatic retry if offline (but not for 404 errors)
if (isOffline.value && (props.isRouteError || props.isGlobalError) && !is404Error.value) {
  startAutomaticRetry()
}

// Clean up on component unmount
onUnmounted(() => {
  cancelAutomaticRetry()
})
</script>

