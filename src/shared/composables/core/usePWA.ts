import { ref, nextTick, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useVersionStore } from '@stores/version'
import { useSettingsStore } from '@stores/settings'
import { useAppStorageStore } from '@stores/appStorage'

import { initializePWA, getRegisterSW } from './registerPWA'
import { isNewerVersion } from '../utils/versionUtils'

const ONE_HOUR = 60 * 60 * 1000
const VERSION_ENDPOINT = '/version-info.json'

export function usePWA() {
  const versionStore = useVersionStore()
  const settingsStore = useSettingsStore()
  const storageStore = useAppStorageStore()

  const latestVersion = ref('')
  const updateFeatures = ref<string[]>([])
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  const isInitialized = ref(false)
  const downloadProgress = ref(0)

  let updateServiceWorkerFn: ((reloadPage?: boolean) => Promise<void>) | null = null
  let intervalController: { pause: () => void; resume: () => void } | null = null

  const currentVersion = computed(() => versionStore.versionInfo.full)
  const updatesEnabled = computed(() => settingsStore.appearance.checkForUpdates !== false)

  const dismissedVersion = computed({
    get: () => storageStore.get('pwa', 'dismissedVersion', ''),
    set: (value: string) => storageStore.set('pwa', 'dismissedVersion', value)
  })

  const initPWA = async() => {
    if (isInitialized.value) return
    await initializePWA()

    const useRegisterSW = getRegisterSW()
    if (!useRegisterSW) {
      console.warn('[PWA] Registration function unavailable')
      isInitialized.value = true
      return
    }

    const pwaResult = useRegisterSW({
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        if (updatesEnabled.value && registration) {
          registration.update()
          intervalController = startPeriodicChecks(registration)
        }
      },
      onRegisterError(error: Error) {
        console.error('[PWA] Service worker registration error:', error)
      },
      onNeedRefresh() {
        needRefresh.value = true
        void populateUpdateInfo()
      },
      onOfflineReady() {
        offlineReady.value = true
      }
    })

    needRefresh.value = pwaResult.needRefresh.value
    offlineReady.value = pwaResult.offlineReady.value
    updateServiceWorkerFn = pwaResult.updateServiceWorker

    isInitialized.value = true
  }

  const startPeriodicChecks = (registration: ServiceWorkerRegistration) => {
    const { pause, resume } = useIntervalFn(
      () => {
        if (updatesEnabled.value) {
          registration.update()
          void checkForVersionUpdates()
        }
      },
      ONE_HOUR,
      { immediate: false }
    )

    void checkForVersionUpdates()
    resume()

    return { pause, resume }
  }

  const checkForVersionUpdates = async(): Promise<void> => {
    if (!updatesEnabled.value) return

    try {
      const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`)
      if (!response.ok) return

      const versionData = await response.json()
      const fetchedVersion: string = versionData.version || ''

      if (fetchedVersion && isNewerVersion(fetchedVersion, currentVersion.value)) {
        latestVersion.value = fetchedVersion

        if (versionData.hasChangelog && Array.isArray(versionData.features) && versionData.features.length > 0) {
          updateFeatures.value = versionData.features
        } else if (versionData.updateType === 'beta-to-stable') {
          updateFeatures.value = [
            'Stable release - all features tested and verified',
            'Improved stability and performance',
            'Bug fixes from beta testing'
          ]
        } else {
          updateFeatures.value = versionData.message ? [versionData.message] : ['General improvements and bug fixes']
        }
      }
    } catch(error) {
      console.warn('[PWA] Failed to check for version updates:', error)
    }
  }

  const populateUpdateInfo = async() => {
    await checkForVersionUpdates()

    if (needRefresh.value && !latestVersion.value) {
      latestVersion.value = 'Service Worker Update'
      updateFeatures.value = [
        'Updated service worker for better offline functionality',
        'Improved caching and performance',
        'Enhanced app reliability'
      ]
    }
  }

  const shouldShowUpdate = computed(() => {
    const dismissedUntil = storageStore.get('pwa', 'updateDismissedUntil', 0)
    if (dismissedUntil && Date.now() < dismissedUntil) return false
    if (needRefresh.value) return true

    if (latestVersion.value && isNewerVersion(latestVersion.value, currentVersion.value)) {
      return dismissedVersion.value !== latestVersion.value
    }

    return false
  })

  const updateApp = async(): Promise<void> => {
    try {
      if (updateServiceWorkerFn) {
        await updateServiceWorkerFn(true)
        await nextTick()
      } else {
        window.location.reload()
      }
    } catch(error) {
      console.error('[PWA] Failed to update app:', error)
      window.location.reload()
    }
  }

  const dismissUpdate = (): void => {
    if (latestVersion.value) {
      dismissedVersion.value = latestVersion.value
      storageStore.set('pwa', 'updateDismissedUntil', Date.now() + ONE_HOUR)
    }
    needRefresh.value = false
    latestVersion.value = ''
    updateFeatures.value = []
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'DOWNLOAD_PROGRESS') {
        const { downloadedBytes, totalBytes } = event.data
        downloadProgress.value = Math.round((downloadedBytes / totalBytes) * 100)
      }
    })
  }

  void initPWA()

  return {
    needRefresh,
    offlineReady,
    latestVersion,
    updateFeatures,

    currentVersion,
    shouldShowUpdate,
    updatesEnabled,

    updateApp,
    dismissUpdate,
    checkForVersionUpdates,
    populateUpdateInfo,

    isNewerVersion,
    downloadProgress,
    pauseChecks: () => intervalController?.pause(),
    resumeChecks: () => intervalController?.resume()
  }
}
