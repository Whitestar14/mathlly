/**
 * Centralized storage service for the application.
 *
 * Design:
 * - Top-level keys: 'app:theme', 'app:theme-pack' (fast boot path)
 * - Blob: 'app:data' namespaced persistent state
 * - Cross-tab sync: storage event invalidates cache
 * - Type safety: generics for namespaces and keys
 */

export type StorageNamespace =
  | 'meta'
  | 'pwa'
  | 'onboarding'
  | 'devDock'
  | 'router'
  | 'panels'

export interface AppDataBlob {
  meta?: {
    hasVisitedBefore?: boolean
  }
  pwa?: {
    dismissedInstall?: boolean
    installPromptSeen?: boolean
    hasInstalledPreviously?: boolean
    installPromptVisits?: number
    pwaInstalled?: boolean
    dismissedVersion?: string
  }
  onboarding?: {
    welcomeShown?: boolean
  }
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
    toolOptions?: Record<string, unknown>
  }
  panels?: Record<
    string,
    {
      desktop: { isOpen: boolean }
      mobile: { isOpen: boolean }
    }
  >
}

export type TopLevelKeys = 'app:theme' | 'app:theme-pack'

class AppStorage {
  private _cache: AppDataBlob | null = null
  private readonly BLOB_KEY = 'app:data'
  private _loaded = false

  private STORAGE_VERSION = '0.0.0'
  private VERSION_KEY = 'app:storage-version'

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (!e.key) return
        if (e.key === this.BLOB_KEY || e.key === 'app:theme' || e.key === 'app:theme-pack') {
          // Invalidate cache; next read will reload from localStorage
          this._cache = null
          this._loaded = false
        }
      })
    }
  }

  private _loadBlob(): void {
    if (typeof window === 'undefined') {
      this._cache = {}
      this._loaded = true
      return
    }
    try {
      const stored = localStorage.getItem(this.BLOB_KEY)
      this._cache = stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to load storage blob:', error)
      this._cache = {}
    } finally {
      this._loaded = true
    }
  }

  private _saveBlob(): void {
    if (typeof window === 'undefined') return
    if (this._cache !== null) {
      try {
        localStorage.setItem(this.BLOB_KEY, JSON.stringify(this._cache))
      } catch (error) {
        console.warn('Failed to save storage blob:', error)
      }
    }
  }

  private _ensureLoaded(): void {
    if (!this._loaded || this._cache === null) {
      this._loadBlob()
    }
  }

  // Strongly-typed per-namespace key access using mapped types
  get<K extends keyof NonNullable<AppDataBlob[N]>, N extends StorageNamespace, T = NonNullable<AppDataBlob[N]>[K]>(
    namespace: N,
    key: K,
    defaultValue?: T
  ): T {
    this._ensureLoaded()
    const ns = this._cache![namespace] as Record<string, unknown> | undefined
    const value = ns?.[key as string]
    return (value !== undefined ? (value as T) : (defaultValue as T)) as T
  }

  set<K extends keyof NonNullable<AppDataBlob[N]>, N extends StorageNamespace>(
    namespace: N,
    key: K,
    value: NonNullable<AppDataBlob[N]>[K]
  ): void {
    this._ensureLoaded()
    if (!this._cache![namespace]) {
      this._cache![namespace] = {} as any
    }
    ;(this._cache![namespace] as any)[key] = value
    this._saveBlob()
  }

  // Namespace-level generics for ergonomics with inference
  getNamespace<N extends StorageNamespace>(namespace: N): NonNullable<AppDataBlob[N]> {
    this._ensureLoaded()
    return (this._cache![namespace] || {}) as NonNullable<AppDataBlob[N]>
  }

  setNamespace<N extends StorageNamespace>(namespace: N, data: NonNullable<AppDataBlob[N]>): void {
    this._ensureLoaded()
    this._cache![namespace] = data
    this._saveBlob()
  }

  remove<N extends StorageNamespace, K extends keyof NonNullable<AppDataBlob[N]>>(namespace: N, key: K): void {
    this._ensureLoaded()
    if (this._cache![namespace]) {
      delete (this._cache![namespace] as any)[key]
      this._saveBlob()
    }
  }

  clear(namespace?: StorageNamespace): void {
    if (typeof window === 'undefined') return
    if (namespace) {
      this._ensureLoaded()
      delete this._cache![namespace]
      this._saveBlob()
    } else {
      this._cache = {}
      this._loaded = true
      try {
        localStorage.removeItem(this.BLOB_KEY)
      } catch (error) {
        console.warn('Failed to clear storage blob:', error)
      }
    }
  }

  // Top-level fast-boot keys
  getTopLevel(key: TopLevelKeys): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  }

  setTopLevel(key: TopLevelKeys, value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  }

  /**
   * @todo remove this once prism becomes stable. try not to accidentally nuke the users' database
   */
  ensureStorageVersion(): void {
  if (typeof window === 'undefined') return

  const current = localStorage.getItem(this.VERSION_KEY)
  if (current !== this.STORAGE_VERSION) {
    localStorage.clear()
    localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION)
  }
}

  // Dev helper
  debugDump(): void {
    this._ensureLoaded()
    const tlTheme = this.getTopLevel('app:theme')
    const tlPack = this.getTopLevel('app:theme-pack')
    console.table({
      'app:theme': tlTheme,
      'app:theme-pack': tlPack
    })
    console.log('Blob', this._cache)
  }
}

export const appStorage = new AppStorage()
