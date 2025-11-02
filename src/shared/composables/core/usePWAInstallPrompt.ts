import { ref, readonly, type Ref } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useAppStorageStore } from '@stores/appStorage'
import type { AppDataBlob } from '@stores/appStorage'

// Global storage key for PWA installation history
const pwaInstalledFlagKey = 'pwaInstalled'

// Ensure single init of listeners/state hydration across calls
let listenersInitialized = false
let storageHydrated = false

// --- Ephemeral State ---
const deferredPrompt = ref<any | null>(null)
const canInstall = ref(false)
const isInstalled = ref(false)

// --- Persistent State (hydrated from storage on first use) ---
const dismissedInstall = ref<boolean>(false)
const installPromptVisits = ref<number>(0)
const installPromptSeen = ref<boolean>(false)
const hasInstalledPreviously = ref<boolean>(false)

export function usePWAInstallPrompt() {
  // Lazy-init Pinia store only when the composable is used
  const storageStore = useAppStorageStore()

  // Hydrate refs from storage exactly once
  if (!storageHydrated) {
    storageHydrated = true
    dismissedInstall.value = storageStore.get('pwa', 'dismissedInstall', false) ?? false
    installPromptVisits.value = storageStore.get('pwa', 'installPromptVisits', 0) ?? 0
    installPromptSeen.value = storageStore.get('pwa', 'installPromptSeen', false) ?? false
    hasInstalledPreviously.value = storageStore.get('pwa', pwaInstalledFlagKey, false) ?? false
  }

  // --- Utility functions (capture store) ---
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

  // --- One-time listeners and runtime detection ---
  if (!listenersInitialized) {
    listenersInitialized = true

    // Detect standalone (installed) mode
    const isStandalone = useMediaQuery('(display-mode: standalone)')
    if (isStandalone.value || (navigator as any).standalone) {
      isInstalled.value = true
      setInstalledFlag(true)
    }

    // Handle beforeinstallprompt (affordance opportunity)
    useEventListener(window, 'beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e

      // Increment visit count
      installPromptVisits.value = (installPromptVisits.value || 0) + 1
      storageStore.set('pwa', 'installPromptVisits', installPromptVisits.value)

      // Uninstallation detection: previously installed, now not installed, prompt fired again
      if (hasInstalledPreviously.value && !isInstalled.value) {
        console.log('🚨 PWA UNINSTALLATION DETECTED')
        setInstalledFlag(false)
        isInstalled.value = false
        setDismissed(false) // reset dismissal on potential re-install intent
      }

      // Show install affordance if criteria met
      if (!isInstalled.value && installPromptVisits.value >= 2) {
        canInstall.value = true
      }
    })

    // Handle appinstalled (success)
    useEventListener(window, 'appinstalled', () => {
      isInstalled.value = true
      setInstalledFlag(true)
      deferredPrompt.value = null
      canInstall.value = false

      setDismissed(false)
      resetVisits()
    })
  }

  // --- Public actions ---
  const promptInstall = async () => {
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
    // Readonly state
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
