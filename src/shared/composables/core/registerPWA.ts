import { ref } from 'vue'

export interface RegisterSWCallbacks {
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
  onRegisterError?: (error: Error) => void
  onNeedRefresh?: () => void
  onOfflineReady?: () => void
}

export interface RegisterSWResult {
  needRefresh: { value: boolean }
  offlineReady: { value: boolean }
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
}

let useRegisterSW: ((callbacks?: RegisterSWCallbacks) => RegisterSWResult) | null = null

export async function initializePWA(): Promise<void> {
  if (useRegisterSW) return
  try {
    const pwaModule = await import('virtual:pwa-register/vue')
    useRegisterSW = pwaModule.useRegisterSW
    console.log('[PWA] Using virtual PWA module')
  } catch(error) {
    console.warn('[PWA] Virtual module not available, using fallback:', error)
    useRegisterSW = createFallbackRegisterSW()
  }
}

function createFallbackRegisterSW() {
  return (callbacks: RegisterSWCallbacks = {}): RegisterSWResult => {
    const needRefresh = ref(false)
    const offlineReady = ref(false)

    const updateServiceWorker = async(reloadPage = true) => {
      if (!('serviceWorker' in navigator)) return
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        const waiting = registration?.waiting
        if (waiting) {
          waiting.postMessage({ type: 'SKIP_WAITING' })
          if (reloadPage) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              window.location.reload()
            })
          }
        }
      } catch(error) {
        console.error('[PWA] Failed to update service worker:', error)
        if (reloadPage) window.location.reload()
      }
    }

    if ('serviceWorker' in navigator) {
      const swPath = import.meta.env.PROD ? '/sw.js' : '/dev-sw.js?dev-sw'
      navigator.serviceWorker
        .register(swPath)
        .then((registration: ServiceWorkerRegistration) => {
          callbacks.onRegistered?.(registration)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return
            newWorker.addEventListener('statechange', () => {
              const installed = newWorker.state === 'installed'
              if (installed && navigator.serviceWorker.controller) {
                needRefresh.value = true
                callbacks.onNeedRefresh?.()
              }
            })
          })

          if (registration.active && !navigator.serviceWorker.controller) {
            offlineReady.value = true
            callbacks.onOfflineReady?.()
          }
        })
        .catch((error: Error) => {
          console.warn('[PWA] Service worker registration failed:', error.message)
          callbacks.onRegisterError?.(error)
        })
    }

    return { needRefresh, offlineReady, updateServiceWorker }
  }
}

export function getRegisterSW() {
  return useRegisterSW
}
