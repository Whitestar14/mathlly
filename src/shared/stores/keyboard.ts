
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

/**
 * Modifier keys supported in canonicalization.
 */
export type Modifier = 'Ctrl' | 'Alt' | 'Shift' | 'Meta'

/**
 * Canonicalized key string, e.g. "Ctrl+Shift+A".
 * For single characters it is usually the raw key (uppercased for letters).
 */
export type CanonicalKey = string

/**
 * Hierarchical context path, e.g. "calculator.programmer".
 * Dot-delimited; ancestors are prefixes.
 */
export type ContextPath = string

/**
 * Metadata for a shortcut binding.
 * Actions are attached later via attachAction/attachAllForContext.
 */
export interface KeyBinding {
  id?: string
  key: CanonicalKey
  description: string
  context: ContextPath
  action?: (e: KeyboardEvent) => void
  preventDefault?: boolean
  priority?: number
  enabled?: boolean
  hidden?: boolean
}

/**
 * A registered binding with guaranteed id.
 */
export interface RegisteredBinding extends KeyBinding {
  id: string
}

/**
 * Collision info when multiple bindings share the same key in overlapping contexts.
 */
export interface Collision {
  key: CanonicalKey
  contexts: ContextPath[]
  bindings: RegisteredBinding[]
}

/**
 * Summary item for ShortcutGuide (non-hidden bindings only).
 */
export interface ShortcutSummaryItem {
  id: string
  key: CanonicalKey
  description: string
  context: ContextPath
  priority: number
  enabled: boolean
}

/**
 * Unique id generator for bindings.
 */
function uid() {
  return Math.random().toString(36).slice(2)
}

/**
 * Canonicalize key names to be consistent across browsers.
 * - Uppercase single letters
 * - Normalize common aliases (Esc → Escape, Spacebar → Space)
 */
function canonicalizeKeyName(key: string): string {
  const k = key.length === 1 ? key.toUpperCase() : key
  switch (k) {
    case ' ':
    case 'Spacebar': return 'Space'
    case 'Esc': return 'Escape'
    default: return k
  }
}

/**
 * Normalize a KeyboardEvent into a canonical key string.
 * Includes modifiers if present (Ctrl/Alt/Shift/Meta) with '+' separators.
 *
 * Examples:
 * - "a" → "A"
 * - Ctrl + Shift + A → "Ctrl+Shift+A"
 * - Escape → "Escape"
 */
function normalizeKeyEvent(e: KeyboardEvent): CanonicalKey {
  const mods: Modifier[] = []
  if (e.ctrlKey) mods.push('Ctrl')
  if (e.altKey) mods.push('Alt')
  if (e.shiftKey) mods.push('Shift')
  if (e.metaKey) mods.push('Meta')
  const base = canonicalizeKeyName(e.key)
  return mods.length ? `${mods.join('+')}+${base}` : base
}

/**
 * Compute ancestry chain for a context.
 * Returns an array from most specific to least:
 * e.g. "tools.base64.editor" → ["tools.base64.editor","tools.base64","tools"]
 */
function ancestry(context: ContextPath): ContextPath[] {
  const parts = context.split('.')
  const paths: string[] = []
  for (let i = parts.length; i >= 1; i--) {
    paths.push(parts.slice(0, i).join('.'))
  }
  return paths
}

/**
 * Expand an active context into specificity levels (most specific first),
 * de-duplicated across all active contexts.
 */
function expandSpecificityLevels(activeContexts: ContextPath[]): ContextPath[] {
  const levels: ContextPath[] = []
  for (const ctx of activeContexts) {
    for (const level of ancestry(ctx)) {
      if (!levels.includes(level)) levels.push(level)
    }
  }
  return levels
}

export const useKeyboardStore = defineStore('keyboard', {
  state: () => ({
    /**
     * Map key → bindings (across contexts).
     */
    bindingsByKey: new Map<CanonicalKey, RegisteredBinding[]>(),

    /**
     * Ordered list of active contexts. Pushed ancestors are included.
     */
    activeContexts: [] as ContextPath[],

    /**
     * Collisions computed per key for developer visibility.
     */
    collisions: [] as Collision[],

    /**
     * Global listener state.
     */
    listening: false,

    /**
     * ShortcutGuide summary of registered non-hidden bindings.
     */
    summary: [] as ShortcutSummaryItem[],

    /**
     * Context-level input proxies (wildcard handlers).
     * If no explicit binding resolves for a key, the proxy for the first matching
     * specificity level runs.
     */
    inputProxies: new Map<
      ContextPath,
      (e: KeyboardEvent, payload: { canonical: string; key: string; code: string }) => void
    >(),

    /**
     * Global enabled state for keyboard shortcuts.
     */
    globalEnabled: true
  }),

  getters: {
    /**
     * ShortcutGuide summary of all non-hidden bindings.
     */
    guideSummary(state): ShortcutSummaryItem[] {
      return state.summary
    },

    /**
     * Getter for global enabled state.
     */
    isGloballyEnabled(state): boolean {
      return state.globalEnabled
    }
  },

  actions: {
    /**
     * Attach a global keydown listener (idempotent).
     */
    attachListener() {
      if (this.listening) return
      window.addEventListener('keydown', this._onKeyDown, { capture: true })
      this.listening = true
      this.syncWithSettings()
    },

    /**
     * Detach the global keydown listener (idempotent).
     */
    detachListener() {
      if (!this.listening) return
      window.removeEventListener('keydown', this._onKeyDown as EventListener)
      this.listening = false
    },

    /**
     * Replace all active contexts.
     */
    setActiveContexts(contexts: ContextPath[]) {
      this.activeContexts = contexts
      this.syncEnabledFlags()
    },

    /**
     * Push a context and its ancestors.
     * If already present, it is not duplicated.
     */
    pushContext(context: ContextPath) {
      for (const level of ancestry(context)) {
        if (!this.activeContexts.includes(level)) this.activeContexts.push(level)
      }
      this.syncEnabledFlags()
    },

    /**
     * Pop a context with tree semantics:
     * - If popping a parent, also remove all its children (descendants).
     * - If popping a child, remove only that child.
     */
    popContext(context: ContextPath) {
      this.activeContexts = this.activeContexts.filter(c => {
        if (c === context) return false
        if (c.startsWith(context + '.')) return false
        return true
      })
      this.syncEnabledFlags()
    },

    /**
     * Register a binding (metadata only).
     * Returns the assigned id. Hidden bindings are excluded from the summary.
     */
    register(binding: KeyBinding): string {
      const id = binding.id ?? uid()
      const entry: RegisteredBinding = {
        id,
        ...binding,
        preventDefault: binding.preventDefault ?? true,
        priority: binding.priority ?? 0,
        enabled: binding.enabled ?? false
      }

      const list = this.bindingsByKey.get(entry.key) ?? []
      list.push(entry)
      this.bindingsByKey.set(entry.key, list)

      if (!entry.hidden) {
        this.summary.push({
          id: entry.id,
          key: entry.key,
          description: entry.description,
          context: entry.context,
          priority: entry.priority!,
          enabled: entry.enabled!
        })
      }

      this.computeCollisionsForKey(entry.key)
      return id
    },

    /**
     * Unregister a binding by id.
     * Removes it from bindings and summary; recomputes collisions.
     */
    unregister(id: string) {
      for (const [key, list] of this.bindingsByKey.entries()) {
        const next = list.filter(b => b.id !== id)
        if (next.length !== list.length) {
          this.bindingsByKey.set(key, next)
          this.summary = this.summary.filter(s => s.id !== id)
          this.computeCollisionsForKey(key)
        }
      }
    },

    /**
     * Attach an action to an existing binding.
     */
    attachAction(id: string, action: (e: KeyboardEvent) => void) {
      for (const [key, list] of this.bindingsByKey.entries()) {
        const idx = list.findIndex(b => b.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], action }
          this.bindingsByKey.set(key, list)
          break
        }
      }
    },

    /**
     * Attach multiple actions by context.
     * Only updates bindings that exist for the given context.
     */
    attachAllForContext(context: ContextPath, handlers: Record<string, (e: KeyboardEvent) => void>) {
      for (const [key, fn] of Object.entries(handlers)) {
        const list = this.bindingsByKey.get(key) ?? []
        const match = list.find(b => b.context === context)
        if (match) this.attachAction(match.id, fn)
      }
    },

    /**
     * Enable a binding by id.
     */
    enable(id: string) {
      this._setEnabled(id, true)
    },

    /**
     * Disable a binding by id.
     */
    disable(id: string) {
      this._setEnabled(id, false)
    },

    /**
     * Internal: set enabled flag on a binding by id and reflect in summary.
     */
    _setEnabled(id: string, enabled: boolean) {
      for (const [key, list] of this.bindingsByKey.entries()) {
        const idx = list.findIndex(b => b.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], enabled }
          this.bindingsByKey.set(key, list)
          break
        }
      }
      const sidx = this.summary.findIndex(s => s.id === id)
      if (sidx !== -1) {
        this.summary[sidx] = { ...this.summary[sidx], enabled }
      }
    },

    /**
     * Enable all bindings for a context and its ancestors.
     */
    enableByContext(context: ContextPath) {
      const levels = new Set(ancestry(context))
      for (const list of this.bindingsByKey.values()) {
        for (const b of list) {
          if (levels.has(b.context)) this._setEnabled(b.id, true)
        }
      }
    },

    /**
     * Disable all bindings for a context and its ancestors.
     */
    disableByContext(context: ContextPath) {
      const levels = new Set(ancestry(context))
      for (const list of this.bindingsByKey.values()) {
        for (const b of list) {
          if (levels.has(b.context)) this._setEnabled(b.id, false)
        }
      }
    },

    /**
     * Set an input proxy (wildcard handler) for a context.
     * Proxies are invoked when no explicit binding resolves for the key.
     */
    setInputProxy(
      context: ContextPath,
      proxy: (e: KeyboardEvent, payload: { canonical: string; key: string; code: string }) => void
    ) {
      this.inputProxies.set(context, proxy)
    },

    /**
     * Clear an input proxy for a context.
     */
    clearInputProxy(context: ContextPath) {
      this.inputProxies.delete(context)
    },

    /**
     * Global keydown dispatcher.
     * Resolution order:
     * 1) Canonical key → explicit bindings, filtered by enabled and active context specificity.
     * 2) If none handled, try input proxies in specificity order.
     * 3) Otherwise, let the event fall through.
     */
    _onKeyDown(e: KeyboardEvent) {
      if (!this.globalEnabled) return
      const canonical = normalizeKeyEvent(e)
      const rawKey = e.key
      const code = e.code

      const candidates = this.bindingsByKey.get(canonical) ?? []
      const enabled = candidates.filter(b => b.enabled && !!b.action)
      const resolved = this.resolveByContextAndPriority(enabled)

      if (resolved) {
        if (resolved.preventDefault) {
          e.preventDefault()
          e.stopPropagation()
        }
        resolved.action!(e)
        return
      }

      if (this.activeContexts.length > 0) {
        const levels = expandSpecificityLevels(this.activeContexts)
        for (const level of levels) {
          const proxy = this.inputProxies.get(level)
          if (proxy) {
            proxy(e, { canonical, key: rawKey, code })
            return
          }
        }
      }
    },

    /**
     * Pick the best binding based on active context specificity and priority.
     * Prefers bindings whose context matches the most specific active level,
     * then breaks ties by higher priority.
     */
    resolveByContextAndPriority(bindings: RegisteredBinding[]): RegisteredBinding | null {
      if (bindings.length === 0) return null
      if (this.activeContexts.length === 0) {
        return null
      }

      const levels = expandSpecificityLevels(this.activeContexts)

      for (const level of levels) {
        const candidatesAtLevel = bindings.filter(b => b.context === level)
        if (candidatesAtLevel.length > 0) {
          let best = candidatesAtLevel[0]
          for (const b of candidatesAtLevel) {
            if ((b.priority ?? 0) > (best.priority ?? 0)) best = b
          }
          return best
        }
      }

      return null
    },

    /**
     * Recompute collisions for a specific key and refresh the collisions list.
     * A collision occurs when a key has multiple bindings across overlapping contexts.
     */
    computeCollisionsForKey(key: CanonicalKey) {
      const list = this.bindingsByKey.get(key) ?? []
      if (list.length <= 1) {
        this.collisions = this.collisions.filter(c => c.key !== key)
        return
      }

      const contexts = Array.from(new Set(list.map(b => b.context)))
      const collision: Collision = { key, contexts, bindings: list.slice() }

      const idx = this.collisions.findIndex(c => c.key === key)
      if (idx !== -1) {
        this.collisions[idx] = collision
      } else {
        this.collisions.push(collision)
      }
    },

    /**
     * Sync enabled flags based on active contexts.
     * This ensures manifest entries in inactive contexts are disabled,
     * and active ones enabled. Explicit enable/disable calls still win locally.
     */
    syncEnabledFlags() {
      if (this.activeContexts.length === 0) {
        for (const list of this.bindingsByKey.values()) {
          for (const b of list) this._setEnabled(b.id, false)
        }
        return
      }

      const levels = new Set(expandSpecificityLevels(this.activeContexts))
      for (const list of this.bindingsByKey.values()) {
        for (const b of list) {
          const shouldEnable = levels.has(b.context)
          this._setEnabled(b.id, shouldEnable)
        }
      }
    },

    /**
     * Sync global enabled state with settings store.
     */
    syncWithSettings() {
      const settings = useSettingsStore()
      this.globalEnabled = settings.keyboard?.shortcutsEnabled ?? true
    },

    /**
     * Set global enabled state and optionally update settings store.
     */
    setGlobalEnabled(enabled: boolean) {
      this.globalEnabled = enabled
      const settings = useSettingsStore()
      settings.updateSetting('keyboard.shortcutsEnabled', enabled)
    }
  }
})
