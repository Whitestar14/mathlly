import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'

export type StorageNamespace =
  | 'meta' |
  'pwa' |
  'onboarding' |
  'devDock' |
  'router' |
  'panels'

export interface AppDataBlob {
  meta?: { hasVisitedBefore?: boolean }
  pwa?: {
    dismissedInstall?: boolean
    installPromptSeen?: boolean
    hasInstalledPreviously?: boolean
    installPromptVisits?: number
    pwaInstalled?: boolean
    dismissedVersion?: string
    updateDismissedUntil?: number
  }
  onboarding?: { welcomeShown?: boolean }
  devDock?: {
    betaOptedIn?: boolean
    betaDecisionMade?: boolean
    expanded?: boolean
    open?: boolean
    panels?: Record<string, boolean>
    currentPanel?: string | null
  }
  router?: {
    lastVisitedPath?: string
    toolOptions?: Record<string, any>
    lastUsedColor?: Record<string, number>
  }
  panels?: Record<
    string,
    { desktop: { isOpen: boolean }; mobile: { isOpen: boolean } }
  >
}

export type TopLevelKeys = 'app:theme' | 'app:theme-pack'

type NamespaceMap = {
  [N in StorageNamespace]: NonNullable<AppDataBlob[N]>
}

export const useAppStorageStore = defineStore('appStorage', () => {
  const blob = ref<AppDataBlob>({} as AppDataBlob)
  const _initialized = ref(false)

  const BLOB_KEY = 'app:data'
  const VERSION_KEY = 'app:storage-version'
  const STORAGE_VERSION = '0.0.2'

  function _loadBlob(): void {
    try {
      const stored = localStorage.getItem(BLOB_KEY)
      blob.value = stored ? JSON.parse(stored) : {}
    } catch(err) {
      console.warn('Failed to load storage blob:', err)
      blob.value = {}
    }
  }

  function _saveBlob(): void {
    try {
      localStorage.setItem(BLOB_KEY, JSON.stringify(blob.value))
    } catch(err) {
      console.warn('Failed to save storage blob:', err)
    }
  }

  function _ensureLoaded(): void {
    if (!_initialized.value) {
      _loadBlob()
      _initialized.value = true
    }
  }

  const meta = computed(() => blob.value.meta ?? {})
  const pwa = computed(() => blob.value.pwa ?? {})
  const onboarding = computed(() => blob.value.onboarding ?? {})
  const devDock = computed(() => blob.value.devDock ?? {})
  const router = computed(() => blob.value.router ?? {})
  const panels = computed(() => blob.value.panels ?? {})

  function initialize(): void {
    ensureStorageVersion()
    _ensureLoaded()
  }

  function get<
    N extends StorageNamespace,
    K extends keyof NamespaceMap[N],
    D extends NamespaceMap[N][K]
  >(
    namespace: N,
    key: K,
    defaultValue: D
  ): Exclude<NamespaceMap[N][K], undefined> | D
  function get<N extends StorageNamespace, K extends keyof NamespaceMap[N]>(
    namespace: N,
    key: K,
    defaultValue?: NamespaceMap[N][K]
  ) {
    _ensureLoaded()
    const ns = blob.value[namespace] as NamespaceMap[N] | undefined
    const val = ns?.[key]
    return (val !== undefined ? val : defaultValue)!
  }

  function set<N extends StorageNamespace, K extends keyof NamespaceMap[N]>(
    namespace: N,
    key: K,
    value: NamespaceMap[N][K]
  ): void {
    _ensureLoaded()
    if (!blob.value[namespace]) blob.value[namespace] = {} as any
    ; (blob.value[namespace] as any)[key] = value
    _saveBlob()
  }

  function getNamespace<N extends StorageNamespace>(
    namespace: N
  ): NamespaceMap[N] {
    _ensureLoaded()
    return (blob.value[namespace] ?? {}) as NamespaceMap[N]
  }

  function setNamespace<N extends StorageNamespace>(
    namespace: N,
    data: NamespaceMap[N]
  ): void {
    _ensureLoaded()
    blob.value[namespace] = data
    _saveBlob()
  }

  function remove<N extends StorageNamespace, K extends keyof NamespaceMap[N]>(
    namespace: N,
    key: K
  ): void {
    _ensureLoaded()
    if (blob.value[namespace]) {
      delete (blob.value[namespace] as any)[key]
      _saveBlob()
    }
  }

  function clear(namespace?: StorageNamespace): void {
    _ensureLoaded()
    if (namespace) {
      delete blob.value[namespace]
    } else {
      blob.value = {} as AppDataBlob
    }
    _saveBlob()
  }

  function getTopLevel(key: TopLevelKeys): string | null {
    return localStorage.getItem(key)
  }
  function setTopLevel(key: TopLevelKeys, value: string): void {
    localStorage.setItem(key, value)
  }

  function ensureStorageVersion(): void {
    const current = localStorage.getItem(VERSION_KEY)
    if (current !== STORAGE_VERSION) {
      localStorage.clear()
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
    }
  }

  function debugDump(): void {
    console.debug('AppStorage Dump:', JSON.stringify(blob.value, null, 2))
    console.log('Blob Key:', BLOB_KEY)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (e.key === BLOB_KEY) {
        _loadBlob()
      }
    })
  }

  watchDebounced(
    () => blob.value,
    () => {
      _saveBlob()
    },
    { deep: true, debounce: 300 }
  )

  return {
    blob,
    _initialized,
    meta,
    pwa,
    onboarding,
    devDock,
    router,
    panels,
    initialize,
    get,
    set,
    getNamespace,
    setNamespace,
    remove,
    clear,
    getTopLevel,
    setTopLevel,
    ensureStorageVersion,
    debugDump
  }
})
