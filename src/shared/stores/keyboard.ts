// src/stores/keyboard.ts
import { defineStore } from 'pinia'

export type Modifier = 'Ctrl' | 'Alt' | 'Shift' | 'Meta'
export type CanonicalKey = string
export type ContextPath = string

export interface KeyBinding {
  id?: string
  key: CanonicalKey
  description: string
  context: ContextPath
  action?: (e: KeyboardEvent) => void
  preventDefault?: boolean
  priority?: number
  enabled?: boolean
}

export interface RegisteredBinding extends KeyBinding {
  id: string
}

export interface Collision {
  key: CanonicalKey
  context: ContextPath
  bindings: RegisteredBinding[]
}

export interface ShortcutSummaryItem {
  id: string
  key: CanonicalKey
  description: string
  context: ContextPath
  priority: number
  enabled: boolean
}

function uid() {
  return Math.random().toString(36).slice(2)
}

function canonicalizeKeyName(key: string): string {
  const k = key.length === 1 ? key.toUpperCase() : key
  switch (k) {
    case ' ':
    case 'Spacebar': return 'Space'
    case 'Esc': return 'Escape'
    default: return k
  }
}

function normalizeKeyEvent(e: KeyboardEvent): CanonicalKey {
  const mods: Modifier[] = []
  if (e.ctrlKey) mods.push('Ctrl')
  if (e.altKey) mods.push('Alt')
  if (e.shiftKey) mods.push('Shift')
  if (e.metaKey) mods.push('Meta')
  const base = canonicalizeKeyName(e.key)
  return mods.length ? `${mods.join('+')}+${base}` : base
}

// ancestry("tools.base64.editor") -> ["tools.base64.editor","tools.base64","tools"]
function ancestry(context: ContextPath): ContextPath[] {
  const parts = context.split('.')
  const paths: string[] = []
  for (let i = parts.length; i >= 1; i--) {
    paths.push(parts.slice(0, i).join('.'))
  }
  return paths
}

export const useKeyboardStore = defineStore('keyboard', {
  state: () => ({
    bindingsByKey: new Map<CanonicalKey, RegisteredBinding[]>(),
    activeContexts: [] as ContextPath[],
    collisions: [] as Collision[],
    listening: false,
    summary: [] as ShortcutSummaryItem[],
  }),
  getters: {
    guideSummary(state): ShortcutSummaryItem[] {
      return state.summary
    },
  },
  actions: {
    attachListener() {
      if (this.listening) return
      window.addEventListener('keydown', this._onKeyDown, { capture: true })
      this.listening = true
    },
    detachListener() {
      if (!this.listening) return
      window.removeEventListener('keydown', this._onKeyDown as EventListener)
      this.listening = false
    },

    setActiveContexts(contexts: ContextPath[]) {
      this.activeContexts = contexts
      this.syncEnabledFlags()
    },
    pushContext(context: ContextPath) {
      for (const level of ancestry(context)) {
        if (!this.activeContexts.includes(level)) this.activeContexts.push(level)
      }
      this.syncEnabledFlags()
    },
    popContext(context: ContextPath) {
      const levels = ancestry(context)
      this.activeContexts = this.activeContexts.filter(c => !levels.includes(c))
      this.syncEnabledFlags()
    },

    register(binding: KeyBinding): string {
      const id = binding.id ?? uid()
      const entry: RegisteredBinding = {
        id,
        ...binding,
        preventDefault: binding.preventDefault ?? true,
        priority: binding.priority ?? 0,
        enabled: binding.enabled ?? false,
      }

      const list = this.bindingsByKey.get(entry.key) ?? []
      list.push(entry)
      this.bindingsByKey.set(entry.key, list)

      this.summary.push({
        id: entry.id,
        key: entry.key,
        description: entry.description,
        context: entry.context,
        priority: entry.priority!,
        enabled: entry.enabled!,
      })

      this.computeCollisionsForKey(entry.key)
      return id
    },

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

  attachAllForContext(context: string, handlers: Record<string, (e: KeyboardEvent) => void>) {
  for (const [key, fn] of Object.entries(handlers)) {
    const list = this.bindingsByKey.get(key) ?? []
    const match = list.find(b => b.context === context)
    if (match) this.attachAction(match.id, fn)
  }
},

    enable(id: string) { this._setEnabled(id, true) },
    disable(id: string) { this._setEnabled(id, false) },
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

    enableByContext(context: ContextPath) {
      const levels = new Set(ancestry(context))
      for (const list of this.bindingsByKey.values()) {
        for (const b of list) if (levels.has(b.context)) this._setEnabled(b.id, true)
      }
    },
    disableByContext(context: ContextPath) {
      const levels = new Set(ancestry(context))
      for (const list of this.bindingsByKey.values()) {
        for (const b of list) if (levels.has(b.context)) this._setEnabled(b.id, false)
      }
    },

    syncEnabledFlags() {
      const active = new Set(this.activeContexts)
      for (const list of this.bindingsByKey.values()) {
        for (const b of list) {
          const shouldEnable = active.has(b.context)
          if (b.enabled !== shouldEnable) this._setEnabled(b.id, shouldEnable)
        }
      }
    },

    _onKeyDown(e: KeyboardEvent) {
      const key = normalizeKeyEvent(e)
      const candidates = this.bindingsByKey.get(key)
      if (!candidates || candidates.length === 0) return

      const enabled = candidates.filter(b => b.enabled && b.action)
      const resolved = this.resolveByContextAndPriority(enabled)
      if (!resolved) return

      if (resolved.preventDefault) { e.preventDefault(); e.stopPropagation() }
      resolved.action!(e)
    },

    resolveByContextAndPriority(bindings: RegisteredBinding[]): RegisteredBinding | null {
      if (bindings.length === 0) return null

      if (this.activeContexts.length === 0) {
        const globals = bindings.filter(b => !b.context.includes('.'))
        const source = globals.length ? globals : bindings
        return source.sort((a, b) => b.priority! - a.priority!)[0] ?? null
      }

      const specificityLevels: ContextPath[] = []
      for (const ctx of this.activeContexts) {
        for (const level of ancestry(ctx)) {
          if (!specificityLevels.includes(level)) specificityLevels.push(level)
        }
      }

      for (const level of specificityLevels) {
        const scoped = bindings.filter(b => b.context === level)
        if (scoped.length) {
          return scoped.sort((a, b) => b.priority! - a.priority!)[0]
        }
      }

      return bindings.sort((a, b) => b.priority! - a.priority!)[0] ?? null
    },

    computeCollisionsForKey(key: CanonicalKey) {
      const list = this.bindingsByKey.get(key) ?? []
      const byContext = new Map<ContextPath, RegisteredBinding[]>()

      for (const b of list) {
        const arr = byContext.get(b.context) ?? []
        arr.push(b)
        byContext.set(b.context, arr)
      }

      this.collisions = this.collisions.filter(c => c.key !== key)
      for (const [ctx, arr] of byContext.entries()) {
        if (arr.length > 1) this.collisions.push({ key, context: ctx, bindings: arr })
      }
    },
  },
})
