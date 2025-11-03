import { ref, readonly, type Ref } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useAppStorageStore } from '@stores/appStorage'
import type { AppDataBlob } from '@stores/appStorage'

const pwaInstalledFlagKey = 'pwaInstalled'

let listenersInitialized = false
let storageHydrated = false

const deferredPrompt = ref<any | null>(null)
const canInstall = ref(false)
const isInstalled = ref(false)

const dismissedInstall = ref<boolean>(false)
const installPromptVisits = ref<number>(0)
const installPromptSeen = ref<boolean>(false)
const hasInstalledPreviously = ref<boolean>(false)

export function usePWAInstallPrompt() {
  const storageStore = useAppStorageStore()

  if (!storageHydrated) {
    storageHydrated = true
    dismissedInstall.value = storageStore.get('pwa', 'dismissedInstall', false) ?? false
    installPromptVisits.value = storageStore.get('pwa', 'installPromptVisits', 0) ?? 0
    installPromptSeen.value = storageStore.get('pwa', 'installPromptSeen', false) ?? false
    hasInstalledPreviously.value = storageStore.get('pwa', pwaInstalledFlagKey, false) ?? false
  }

  const updateBooleanState = (
    stateRef: Ref<boolean>,
    key: keyof NonNullable<AppDataBlob['pwa']> | string,
    value: boolean
  ) => {
    stateRef.value = value
    if (value) {
      storageStore.set('pwa', key as any, true)
    } else {
      storageStore.remove('pwa', key as any)
    }
  }

  const setDismissed = (v: boolean) => updateBooleanState(dismissedInstall, 'dismissedInstall', v)
  const setInstalledFlag = (v: boolean) => updateBooleanState(hasInstalledPreviously, pwaInstalledFlagKey, v)
  const markPromptSeen = (v = true) => updateBooleanState(installPromptSeen, 'installPromptSeen', v)

  const resetVisits = () => {
    installPromptVisits.value = 0
    storageStore.remove('pwa', 'installPromptVisits')
  }

  if (!listenersInitialized) {
    listenersInitialized = true

    const isStandalone = useMediaQuery('(display-mode: standalone)')
    if (isStandalone.value || (navigator as any).standalone) {
      isInstalled.value = true
      setInstalledFlag(true)
    }

    useEventListener(window, 'beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e

      installPromptVisits.value = (installPromptVisits.value || 0) + 1
      storageStore.set('pwa', 'installPromptVisits', installPromptVisits.value)

      if (hasInstalledPreviously.value && !isInstalled.value) {
        console.log('🚨 PWA UNINSTALLATION DETECTED')
        setInstalledFlag(false)
        isInstalled.value = false
        setDismissed(false) // reset dismissal on potential re-install intent
      }

      if (!isInstalled.value && installPromptVisits.value >= 2) {
        canInstall.value = true
      }
    })

    useEventListener(window, 'appinstalled', () => {
      isInstalled.value = true
      setInstalledFlag(true)
      deferredPrompt.value = null
      canInstall.value = false

      setDismissed(false)
      resetVisits()
    })
  }

  const promptInstall = async() => {
    if (!deferredPrompt.value) return null
    markPromptSeen(true)

    deferredPrompt.value.prompt()
    const choice = await (deferredPrompt.value as any).userChoice

    deferredPrompt.value = null
    canInstall.value = false
    return choice
  }

  const dismissInstall = () => {
    setDismissed(true)
    markPromptSeen(true)
    canInstall.value = false
  }

  const resetDismissal = () => {
    setDismissed(false)
  }

  return {

    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),
    dismissedInstall: readonly(dismissedInstall),
    installPromptSeen: readonly(installPromptSeen),
    installPromptVisits: readonly(installPromptVisits),
    hasInstalledPreviously: readonly(hasInstalledPreviously),

    promptInstall,
    dismissInstall,
    resetDismissal,
    markPromptSeen,
    resetVisits
  }
}
