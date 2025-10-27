import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useVersionStore } from '@stores/version'
import { useSettingsStore } from '@stores/settings'
import { useAppStorageStore } from '@stores/appStorage'

let useRegisterSW: any

// Dynamically import the PWA register module
async function initializePWA() {
  try {
    // Try virtual module first (this should work in most cases)
    const pwaModule = await import('virtual:pwa-register/vue')
    useRegisterSW = pwaModule.useRegisterSW
    console.log('[PWA] Using virtual PWA module')
  } catch (error) {
    console.warn('[PWA] Virtual module not available, using fallback:', error)
    
    // Only use fallback if we're sure we need it
    if (import.meta.env.DEV) {
      console.log('[PWA] Development mode: creating fallback registration')
    }
    
    useRegisterSW = createFallbackRegisterSW()
  }
}

// Fallback registration for when virtual module isn't available
function createFallbackRegisterSW() {
  return (callbacks: any = {}) => {
    const needRefresh = ref(false)
    const offlineReady = ref(false)

    const updateServiceWorker = async (reloadPage = true) => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            if (reloadPage) {
              window.location.reload()
            }
          }
        } catch (error) {
          console.error('[PWA] Failed to update service worker:', error)
          if (reloadPage) {
            window.location.reload()
          }
        }
      }
    }

    // Only register in production or when sw.js is actually available
    if ('serviceWorker' in navigator && (import.meta.env.PROD || import.meta.env.DEV)) {
      // FIXED: More robust service worker detection
      const swPath = import.meta.env.PROD ? '/sw.js' : '/dev-sw.js?dev-sw'
      
      navigator.serviceWorker.register(swPath)
        .then((registration: ServiceWorkerRegistration) => {
          console.log('[PWA] Service worker registered:', registration)
          callbacks.onRegistered?.(registration)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  needRefresh.value = true
                  callbacks.onNeedRefresh?.()
                }
              })
            }
          })

          if (registration.active && !navigator.serviceWorker.controller) {
            offlineReady.value = true
            callbacks.onOfflineReady?.()
          }
        })
        .catch((error: Error) => {
          console.warn('[PWA] Service worker registration failed:', error.message)
          if (import.meta.env.PROD) {
            callbacks.onRegisterError?.(error)
          }
        })
    }

    return {
      needRefresh,
      offlineReady,
      updateServiceWorker
    }
  }
}

/**
 * PWA update management composable
 */
export function usePWA() {
  const versionStore = useVersionStore()
  const settingsStore = useSettingsStore()
  const storageStore = useAppStorageStore()
  
  // Local state
  const latestVersion = ref('')
  const updateFeatures = ref<string[]>([])
  const dismissedVersion = computed({
    get: () => storageStore.get('pwa', 'dismissedVersion', ''),
    set: (value: string) => storageStore.set('pwa', 'dismissedVersion', value)
  })
  const isInitialized = ref(false)
  
  // PWA state - initialize with default values
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  let updateServiceWorkerFn: ((reloadPage?: boolean) => Promise<void>) | null = null

  // Computed properties
  const currentVersion = computed(() => versionStore.versionInfo.full)
  const updatesEnabled = computed(() => settingsStore.appearance.checkForUpdates !== false)
  
  // Initialize PWA
  const initPWA = async () => {
    if (isInitialized.value) return

    await initializePWA()
    
    if (useRegisterSW) {
      const pwaResult = useRegisterSW({
        onRegistered(registration: ServiceWorkerRegistration | undefined) {
          console.log('[PWA] Service worker registered:', registration)
          
          if (updatesEnabled.value && registration) {
            registration.update()
            startPeriodicChecks(registration)
          }
        },
        onRegisterError(error: Error) {
          console.error('[PWA] Service worker registration error:', error)
        },
        onNeedRefresh() {
          needRefresh.value = true
          // When PWA detects an update, populate the update info
          populateUpdateInfo()
        },
        onOfflineReady() {
          offlineReady.value = true
        }
      })

      // Update reactive refs
      needRefresh.value = pwaResult.needRefresh.value
      offlineReady.value = pwaResult.offlineReady.value
      updateServiceWorkerFn = pwaResult.updateServiceWorker

      // Watch for changes
      if (pwaResult.needRefresh) {
        needRefresh.value = pwaResult.needRefresh.value
      }
      if (pwaResult.offlineReady) {
        offlineReady.value = pwaResult.offlineReady.value
      }
    }

    isInitialized.value = true
  }

  /**
   * Start periodic update checks
   */
  const startPeriodicChecks = (registration: ServiceWorkerRegistration) => {
    const { pause, resume } = useIntervalFn(
      () => {
        if (registration && updatesEnabled.value) {
          registration.update()
          checkForVersionUpdates()
        }
      },
      60 * 60 * 1000, // Check every hour
      { immediate: false }
    )

    // Initial check
    checkForVersionUpdates()
    resume()

    return { pause, resume }
  }

/**
 * Check for version updates from generated version-info.json
 */
const checkForVersionUpdates = async (): Promise<void> => {
  if (!updatesEnabled.value) return
  
  try {
    const response = await fetch(`/version-info.json?t=${Date.now()}`)
    if (response.ok) {
      const versionData = await response.json()
      const fetchedVersion = versionData.version || ''
      
      console.log('[PWA] Checking versions:', {
        current: currentVersion.value,
        fetched: fetchedVersion,
        hasChangelog: versionData.hasChangelog,
        source: versionData.source,
        updateType: versionData.updateType
      })
      
      if (fetchedVersion && isNewerVersion(fetchedVersion, currentVersion.value)) {
        latestVersion.value = fetchedVersion
        
        // Handle different update types with better messaging
        if (versionData.hasChangelog && versionData.features?.length > 0) {
          updateFeatures.value = versionData.features
        } else if (versionData.updateType === 'beta-to-stable') {
          // Special handling for beta to stable transitions
          updateFeatures.value = [
            'Stable release - all features tested and verified',
            'Improved stability and performance',
            'Bug fixes from beta testing'
          ]
        } else {
          updateFeatures.value = versionData.message ? [versionData.message] : ['General improvements and bug fixes']
        }
        
        console.log('[PWA] Update available:', {
          version: fetchedVersion,
          type: versionData.updateType || (versionData.hasChangelog ? 'changelog' : 'build-only'),
          features: updateFeatures.value.length
        })
      }
    }
  } catch (error) {
    console.warn('[PWA] Failed to check for version updates:', error)
  }
}

/**
 * Populate update information when PWA update is detected
 */
const populateUpdateInfo = async () => {
  // Always try to get real version info first
  await checkForVersionUpdates()
  
  // If PWA detected an update but we still don't have version info,
  // it's likely a service worker-only update
  if (needRefresh.value && !latestVersion.value) {
    console.log('[PWA] Service worker update detected without version change')
    latestVersion.value = 'Service Worker Update'
    updateFeatures.value = [
      'Updated service worker for better offline functionality',
      'Improved caching and performance',
      'Enhanced app reliability'
    ]
  }
}

/**
 * Compare version strings with proper prerelease handling
 */
const isNewerVersion = (latest: string, current: string): boolean => {
  if (!latest || !current) return false
  
  // If it's a service worker update, don't compare versions
  if (latest === 'Service Worker Update') return false
  
  type PrereleaseType = 'alpha' | 'beta' | 'rc' | null;

  const parseVersionForComparison = (v: string) => {
    const cleaned = v.replace(/^v/, '')
    const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)(?:-(beta|alpha|rc)(\d*))?$/)
    
    if (!match) return null
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: (match[4] as PrereleaseType) || null,
      prereleaseNumber: match[5] ? parseInt(match[5], 10) : 0,
      isStable: !match[4]
    }
  }
  
  const latestParsed = parseVersionForComparison(latest)
  const currentParsed = parseVersionForComparison(current)
  
  if (!latestParsed || !currentParsed) return false
  
  // Compare major.minor.patch first
  if (latestParsed.major !== currentParsed.major) {
    return latestParsed.major > currentParsed.major
  }
  if (latestParsed.minor !== currentParsed.minor) {
    return latestParsed.minor > currentParsed.minor
  }
  if (latestParsed.patch !== currentParsed.patch) {
    return latestParsed.patch > currentParsed.patch
  }
  
  // Same version number, check prerelease status
  // Stable versions are newer than prerelease versions
  if (currentParsed.prerelease && latestParsed.isStable) {
    return true // beta -> stable is an update
  }
  
  if (currentParsed.isStable && latestParsed.prerelease) {
    return false // stable -> beta is not an update
  }
  
  // Both prerelease, compare prerelease numbers
  if (currentParsed.prerelease && latestParsed.prerelease) {
    // alpha < beta < rc
    const prereleaseOrder: Record<'alpha' | 'beta' | 'rc', number> = { alpha: 1, beta: 2, rc: 3 };
    if (currentParsed.prerelease === latestParsed.prerelease) {
      return latestParsed.prereleaseNumber > currentParsed.prereleaseNumber;
    }
    return prereleaseOrder[latestParsed.prerelease as 'alpha' | 'beta' | 'rc'] > prereleaseOrder[currentParsed.prerelease as 'alpha' | 'beta' | 'rc'];
  }
  
  return false
}

  /**
   * Check if update should be shown
   */
  const shouldShowUpdate = computed(() => {
    // Check if dismissal has expired
    const dismissedUntil = storageStore.get('pwa', 'updateDismissedUntil', 0)
    if (dismissedUntil && Date.now() < dismissedUntil) {
      return false
    }
    
    // Service worker update available (this takes priority)
    if (needRefresh.value) return true
    
    // Version update available and not permanently dismissed
    if (latestVersion.value && isNewerVersion(latestVersion.value, currentVersion.value)) {
      return dismissedVersion.value !== latestVersion.value
    }
    
    return false
  })

  /**
   * Update the application
   */
  const updateApp = async (): Promise<void> => {
    try {
      if (updateServiceWorkerFn) {
        await updateServiceWorkerFn(true)
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('[PWA] Failed to update app:', error)
      window.location.reload()
    }
  }

  /**
   * Dismiss the update notification
   */
  const dismissUpdate = (): void => {
    if (latestVersion.value) {
      // Only dismiss for this session, not permanently
      dismissedVersion.value = latestVersion.value
      
      // Set a shorter dismissal period (e.g., 1 hour)
      const dismissalExpiry = Date.now() + (60 * 60 * 1000) // 1 hour
      storageStore.set('pwa', 'updateDismissedUntil', dismissalExpiry)
    }
    needRefresh.value = false
    latestVersion.value = ''
    updateFeatures.value = []
  }

  // Initialize PWA on first call
  initPWA()

  return {
    // State
    needRefresh,
    offlineReady,
    latestVersion,
    updateFeatures,
    currentVersion,
    
    // Computed
    shouldShowUpdate,
    updatesEnabled,
    
    // Methods
    updateApp,
    isNewerVersion,
    dismissUpdate,
    checkForVersionUpdates,
    populateUpdateInfo // Export for testing
  }
}