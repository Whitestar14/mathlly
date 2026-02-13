import { reactive, computed, watch, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { routeError } from '@router/errorHandler'

export interface ErrorProps {
  error: Error | Object | String | null
  path: string
  isRouteError: boolean
  isGlobalError: boolean
  is404: boolean
}

export function useErrorState(props: ErrorProps, route: RouteLocationNormalizedLoaded, isOffline: Ref<boolean>) {
  const state = reactive({
    visualCode: '',
    stylizedCode: '',
    title: '',
    message: '',
    pageTitle: '',
    stackTrace: ''
  })

  const effectiveError = computed(() => {
    const err = props.error || routeError.value
    // @ts-ignore
    return err?.originalError || err
  })

  const is404Error = computed(() => {
    if (props.is404) return true

    const err: any = effectiveError.value
    if (!err) return false

    if (typeof err === 'object') {
      if (err.status === 404) return true
      if (err.message && err.message.toLowerCase().includes('not found')) return true
    }

    if (route.matched.length === 1 && route.matched[0].path === '/:pathMatch(.*)') {
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

  watch([is404Error, isOffline, effectiveError, extractedErrorMessage], () => {
    updateErrorState()
  }, { immediate: true })

  function updateErrorState() {
    if (is404Error.value) {
      state.visualCode = '404'
    } else if (isOffline.value) {
      state.visualCode = 'OFF'
    } else {
      const err: any = effectiveError.value
      const msg = (err?.message || '').toLowerCase()

      if (msg.includes('timeout')) state.visualCode = '408'
      else if (msg.includes('failed to fetch') || msg.includes('load chunk') || msg.includes('dynamically imported module')) state.visualCode = '503'
      else if (msg.includes('not found') || err?.name === 'NotFoundError') state.visualCode = '404'
      else if (msg.includes('permission') || msg.includes('forbidden')) state.visualCode = '403'
      else if (msg.includes('unauthorized')) state.visualCode = '401'
      else state.visualCode = '500'
    }

    const codeMap: Record<string, string> = {
      '404': '{not//found}',
      'OFF': '{connection//lost}',
      '401': '{not//authorized}',
      '403': '{access//denied}',
      '408': '{request//timeout}',
      '503': '{service//issue}',
      '500': '{system//error}'
    }
    state.stylizedCode = codeMap[state.visualCode] || '{system//error}'

    if (is404Error.value) {
      state.title = 'Page Not Found'
    } else if (isOffline.value) {
      state.title = 'You are Offline'
    } else {
      const titleMap: Record<string, string> = {
        '404': 'Page Not Found',
        '401': 'Authentication Required',
        '403': 'Access Forbidden',
        '408': 'Request Timed Out',
        '503': 'Service Temporarily Unavailable',
        '500': props.isGlobalError ? 'Application Error' : 'Something Went Wrong'
      }

      const rawMsg = extractedErrorMessage.value
      if (rawMsg &&
        !rawMsg.toLowerCase().includes('unknown error') &&
        !rawMsg.toLowerCase().includes('error occurred') &&
        rawMsg.length < 50 &&
        !rawMsg.includes('(')) {
        state.title = rawMsg
      } else {
        state.title = titleMap[state.visualCode] || 'Something Went Wrong'
      }
    }

    if (is404Error.value) {
      state.message = `We couldn't find the page at ${props.path || route.fullPath || 'the requested URL'}. Please check the address or go back.`
    } else if (isOffline.value) {
      state.message = 'Please check your internet connection. We will attempt to reconnect automatically.'
    } else {
      const messageMap: Record<string, string> = {
        '404': `We couldn't find the page at ${props.path ? `\`${props.path}\`` : 'the requested URL'}. Please check the address or go back.`,
        '401': 'You need to be logged in or have the correct credentials to access this page.',
        '403': "You don't have the necessary permissions to view this resource.",
        '408': 'The server took too long to respond. This might be a temporary issue. Please try again in a few moments.',
        '503': 'The service required for this page is currently unavailable or overloaded. Please try again shortly.',
        '500': 'An unexpected technical issue occurred. If this problem persists, please contact support or try again later.'
      }

      if (extractedErrorMessage.value && extractedErrorMessage.value !== state.title) {
        state.message = extractedErrorMessage.value
      } else {
        state.message = messageMap[state.visualCode] || messageMap['500']
      }
    }

    if (is404Error.value) {
      state.pageTitle = '404 - Not Found'
    } else if (isOffline.value) {
      state.pageTitle = 'Connection Issue'
    } else if (props.isRouteError) {
      state.pageTitle = 'Error Loading Page'
    } else if (props.isGlobalError) {
      state.pageTitle = 'Application Error'
    } else {
      state.pageTitle = 'An Error Occurred'
    }

    const err = effectiveError.value
    state.stackTrace = err instanceof Error && err.stack ? err.stack : ''
  }

  return {
    state,
    is404Error,
    effectiveError
  }
}