import { ref, readonly, type Ref } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { appStorage, type AppDataBlob } from '@services/storage'

// Global storage key for PWA installation history
const pwaInstalledFlagKey = 'pwaInstalled'
let listenersInitialized = false

// --- State Variables ---
// Using 'any' as BeforeInstallPromptEvent type is not defined here
const deferredPrompt = ref<any | null>(null) 
const canInstall = ref(false)
const isInstalled = ref(false)

// --- Persistent State from Storage ---
const dismissedInstall = ref<boolean>(appStorage.get('pwa', 'dismissedInstall', false))
const installPromptVisits = ref<number>(appStorage.get('pwa', 'installPromptVisits', 0))
const installPromptSeen = ref<boolean>(appStorage.get('pwa', 'installPromptSeen', false))
const hasInstalledPreviously = ref<boolean>(appStorage.get('pwa', pwaInstalledFlagKey, false))


// --- Utility Functions for State/Storage Management ---

/** Updates a boolean Ref and sets/removes the corresponding key in appStorage. */
const updateBooleanState = (stateRef: Ref<boolean>, key: keyof NonNullable<AppDataBlob['pwa']> | string, value: boolean) => {
  stateRef.value = value
  if (value) {
    appStorage.set('pwa', key as any, true)
  } else {
    appStorage.remove('pwa', key as any)
  }
}

const setDismissed = (v: boolean) => updateBooleanState(dismissedInstall, 'dismissedInstall', v)
const setInstalledFlag = (v: boolean) => updateBooleanState(hasInstalledPreviously, pwaInstalledFlagKey, v)
const markPromptSeen = (v = true) => updateBooleanState(installPromptSeen, 'installPromptSeen', v)

const resetVisits = () => {
  installPromptVisits.value = 0
  appStorage.remove('pwa', 'installPromptVisits')
}

// --- Public Actions ---

const promptInstall = async () => {
  if (!deferredPrompt.value) return null
  markPromptSeen(true)
  
  deferredPrompt.value.prompt()
  
  const choice = await deferredPrompt.value.userChoice

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


// --- Main Composable ---

export function usePWAInstallPrompt() {
  if (!listenersInitialized) {
    listenersInitialized = true

    // Detect if running in standalone mode (installed)
    const isStandalone = useMediaQuery('(display-mode: standalone)')
    if (isStandalone.value || (navigator as any).standalone) {
      isInstalled.value = true
      setInstalledFlag(true)
    }

    // Handle beforeinstallprompt event (Affordance opportunity)
    useEventListener(window, 'beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e

      // Increment visit count
      installPromptVisits.value = (installPromptVisits.value || 0) + 1
      appStorage.set('pwa', 'installPromptVisits', installPromptVisits.value)

      // PWA UNINSTALLATION DETECTION: If historical flag is true, but runtime status is false,
      // and the prompt fires again, it means uninstallation occurred.
      if (hasInstalledPreviously.value && !isInstalled.value) {
        console.log('🚨 PWA UNINSTALLATION DETECTED')
        setInstalledFlag(false)
        isInstalled.value = false
        resetDismissal()
      }

      // Show install affordance if criteria met
      if (!isInstalled.value && installPromptVisits.value >= 2) {
        canInstall.value = true
      }
    })

    // Handle appinstalled event (Success)
    useEventListener(window, 'appinstalled', () => {
      isInstalled.value = true
      setInstalledFlag(true)
      deferredPrompt.value = null
      canInstall.value = false
      
      resetDismissal()
      resetVisits()
    })
  }

  return {
    // Readonly state properties
    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),
    dismissedInstall: readonly(dismissedInstall),
    installPromptSeen: readonly(installPromptSeen),
    installPromptVisits: readonly(installPromptVisits),
    hasInstalledPreviously: readonly(hasInstalledPreviously),

    // Actions
    promptInstall,
    dismissInstall,
    resetDismissal,
    markPromptSeen,
    resetVisits,
  }
}
