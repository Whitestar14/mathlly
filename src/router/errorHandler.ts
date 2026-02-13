import { ref } from 'vue'
import { useOnline } from '@vueuse/core'
import type { Router, RouteLocationNormalized } from 'vue-router'
import { RouteError } from './types'
import { TelemetryService } from '@shared/services/telemetry/TelemetryService'

export const routeError = ref<RouteError | null>(null)
export const routePath = ref<string>('')
export const isHandlingError = ref<boolean>(false)
export const hasError = ref<boolean>(false)
export const networkStatus = useOnline()

export function setRouteError(error: RouteError | Error, path: string): void {
  TelemetryService.getInstance().logError(error)

  console.error(`[Router Error] Path: ${path}`, error)

  if (error instanceof Error) {
    routeError.value = {
      message: error.message,
      originalError: error
    }
  } else {
    routeError.value = error
  }

  routePath.value = path
  hasError.value = true
  isHandlingError.value = true
}

export function clearRouteError(): void {
  if (routeError.value) {
    routeError.value = null
    routePath.value = ''
    isHandlingError.value = false
  }
  hasError.value = false
}

export function setupRouteErrorHandling(router: Router): void {
  router.onError((error: Error, to: RouteLocationNormalized) => {
    if (to.path === '/error' && isHandlingError.value) {
      console.warn(
        'Router.onError triggered while already handling an error or navigating to /error. Preventing loop.'
      )
      return
    }

    const currentPath = to.fullPath || router.currentRoute.value.fullPath
    const isCurrentlyOnline = networkStatus.value
    let processedError: RouteError = {
      message: error.message,
      originalError: error
    }

    const isChunkLoadError =
      error.message &&
      (error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('error loading dynamically imported module'))

    if (!isCurrentlyOnline) {
      processedError = {
        message: `You appear to be offline. Please check your connection. (Original error: ${error.message})`,
        originalError: error
      }
    } else if (isChunkLoadError) {
      processedError = {
        message: `Failed to load page component. Please check your connection and try again. (${error.message})`,
        originalError: error
      }
    } else if (!error.message) {
      processedError = {
        message: `An unknown error occurred while navigating to ${currentPath}.`,
        originalError: error
      }
    }

    setRouteError(processedError, currentPath)
    router.replace({ path: '/error' })
  })
}
