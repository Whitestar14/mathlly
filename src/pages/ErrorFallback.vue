<template>
  <BasePage
    :title="errorState.pageTitle"
    :show-header="false"
    :show-footer="false"
    main-class="flex flex-col items-center justify-center min-h-[clamp(700px,100%,100vh)] p-4 text-center bg-background transition-colors duration-300">
    <div class="space-y-6 max-w-lg">

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

      <div class="space-y-2">
        <h2 class="text-xl font-medium text-foreground">
          {{ errorState.title }}
        </h2>
        <p class="text-muted-foreground">
          {{ errorState.message }}
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
        v-if="errorState.stackTrace && !isOffline && !is404Error"
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

          <pre class="text-xs text-foreground dark:text-muted-foreground whitespace-pre-wrap break-words">{{ errorState.stackTrace }}</pre>
        </BaseCollapsible>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIntervalFn, useTimeoutFn, useClipboard, useNetwork } from '@vueuse/core'
import { HomeIcon, RefreshCwIcon, Copy, ArrowLeft, Check } from 'lucide-vue-next'
import { clearRouteError, routeError, routePath, hasError } from '@router/errorHandler'
import { useToast } from '@composables/ui/useToast'
import { useAppStorageStore } from '@stores/appStorage'
import { BasePage, BaseButton, BaseCollapsible } from '@components/ui'

const props = defineProps({
  error: {
    type: [Error, Object, String],
    default: null
  },
  path: {
    type: String,
    default: ''
  },
  isRouteError: {
    type: Boolean,
    default: false
  },
  isGlobalError: {
    type: Boolean,
    default: false
  },
  is404: {
    type: Boolean,
    default: false
  }
})

const { success, error: toastError, warning } = useToast()
const storageStore = useAppStorageStore()
const router = useRouter()
const route = useRoute()

const { isOnline } = useNetwork()
const { copy } = useClipboard()
const isOffline = computed(() => !isOnline.value)

const isManualRetrying = ref(false)
const manualRetryFeedbackMessage = ref('')
const autoRetryActive = ref(false)
const autoRetryCountdownTime = ref(0)
const AUTO_RETRY_INITIAL_DELAY_SECONDS = 30

const {
  pause: pauseAutoRetry,
  resume: resumeAutoRetry
} = useIntervalFn(() => {
  if (isOnline.value) {
    handleManualRetry()
    pauseAutoRetry()
    return
  }

  autoRetryCountdownTime.value--

  if (autoRetryCountdownTime.value <= 0) {
    handleManualRetry()
    if (isOffline.value) {
      pauseAutoRetry()
      useTimeoutFn(() => {
        autoRetryCountdownTime.value = Math.min(
          AUTO_RETRY_INITIAL_DELAY_SECONDS * 2,
          120
        )
        resumeAutoRetry()
      }, 1000)
    }
  }
}, 1000, { immediate: false })

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

  if (route.matched.length === 1 &&
      route.matched[0].path === '/:pathMatch(.*)') {
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

const errorState = reactive({
  visualCode: '',
  stylizedCode: '',
  title: '',
  message: '',
  pageTitle: '',
  stackTrace: ''
})

watch([is404Error, isOffline, effectiveError, extractedErrorMessage], updateErrorState, { immediate: true })

function updateErrorState() {
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

  if (is404Error.value) {
    errorState.message = `We couldn't find the page at ${props.path || route.fullPath || 'the requested URL'}. Please check the address or go back.`
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

  const err = effectiveError.value
  errorState.stackTrace = err instanceof Error && err.stack ? err.stack : ''
}

const navigateToHome = () => {
  if (isManualRetrying.value) return
  cancelAutomaticRetry()

  clearRouteError()
  hasError.value = false
  const last = storageStore.get('router', 'lastVisitedPath', routePath.value || '/') || '/'
  router.replace(last).catch(err => {
    console.error('ErrorFallback: Failed to navigate to last visited path:', err)
    toastError('Could not navigate to previous page. Please try again.')
  })
}

async function handleManualRetry() {
  if (isManualRetrying.value) return

  isManualRetrying.value = true
  manualRetryFeedbackMessage.value = ''
  cancelAutomaticRetry()

  if (isOffline.value) {
    warning('Still offline. Please check your connection.')
    useTimeoutFn(() => {
      isManualRetrying.value = false
    }, 1500)

    if ((props.isRouteError || props.isGlobalError || (routeError.value && Object.keys(routeError.value).length > 0)) && !is404Error.value) {
      startAutomaticRetry()
    }
    return
  }

  useTimeoutFn(async() => {
    clearRouteError()

    try {
      const targetPath = routePath.value || props.path || route.fullPath || '/'
      await router.replace(targetPath)
    } catch(err) {
      console.error('ErrorFallback: Error during manual retry navigation attempt:', err)
    } finally {
      useTimeoutFn(() => {
        isManualRetrying.value = false
      }, 200)
    }
  }, 300)
}

function startAutomaticRetry() {
  if (!isOffline.value || autoRetryActive.value || is404Error.value) {
    return
  }

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

watch(isOnline, online => {
  if (online && autoRetryActive.value) {
    manualRetryFeedbackMessage.value = 'Connection restored! Reloading...'
    useTimeoutFn(handleManualRetry, 1000)
  } else if (!online && !autoRetryActive.value && !is404Error.value) {
    startAutomaticRetry()
  }
}, { immediate: true })

onUnmounted(cancelAutomaticRetry)

const showDetails = ref(false)

const copied = ref(false)

const copyStack = async() => {
  const text = errorState.stackTrace || ''
  await copy(text)

  copied.value = true

  setTimeout(() => copied.value = false, 500)
  success('Stack trace copied to clipboard.')
}

const reportError = () => {
  try {
    const title = encodeURIComponent(`Error Report: ${errorState.visualCode} - ${errorState.title}`)
    const bodyParts = [
      `**Page:** ${route.fullPath || routePath.value || 'unknown'}`,
      `**Title:** ${errorState.title}`,
      '',
      '**Stack Trace:**',
      '```',
      errorState.stackTrace || '(none)',
      '```'
    ]
    const body = encodeURIComponent(bodyParts.join('\n'))
    const url = `https://github.com/Whitestar14/mathlly/issues/new?title=${title}&body=${body}`
    window.open(url, '_blank')
  } catch(e) {
    toastError(e, { title: 'Could not open Github for reporting.' })
  }
}
</script>
