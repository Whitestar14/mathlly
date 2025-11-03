import { reactive, readonly, provide, inject } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { createPanel } from './createPanel'
import {
  PanelOptions,
  PanelAPI,
  PanelContext,
  PanelContextState,
  PanelContextActions,
  ToggleOptions
} from './types'

const PanelStateSymbol = Symbol('PanelState')
const PanelActionsSymbol = Symbol('PanelActions')

/**
 * Creates a central context for managing multiple panel states.
 * This should be instantiated once in a top-level component.
 */
export function createPanelContext(): PanelContext {
  const state = reactive<PanelContextState>({
    panels: {},
    options: {},
    isMobile: false
  })

  const actions: PanelContextActions = {
    /**
     * Registers a new panel instance with the context.
     */
    registerPanel(id: string, options: PanelOptions = {}): PanelAPI | undefined {
      if (state.panels[id]) {
        console.warn(`Panel with id "${id}" already registered. Registration skipped.`)
        return state.panels[id]
      }

      const panel = createPanel({ ...options, initialIsMobile: state.isMobile })
      state.panels[id] = panel
      state.options[id] = options
      return panel
    },

    /**
     * Unregisters a panel instance. Typically called on component unmount.
     */
    unregisterPanel(id: string): void {
      if (state.panels[id]) {
        delete state.panels[id]
        delete state.options[id]
      }
    },

    /**
     * Opens a specific panel.
     */
    openPanel(id: string): void {
      state.panels[id]?.open()
    },

    /**
     * Closes a specific panel.
     */
    closePanel(id: string): void {
      state.panels[id]?.close()
    },

    /**
     * Toggles a specific panel.
     */
    togglePanel(id: string, options?: ToggleOptions): void {
      state.panels[id]?.toggle(options)
    },

    /**
     * Closes all registered panels.
     */
    closeAllPanels(): void {
      Object.keys(state.panels).forEach(id => this.closePanel(id))
    },

    /**
     * Retrieves a panel instance by its ID.
     */
    getInstance(id: string): PanelAPI | undefined {
      return state.panels[id]
    },

    /**
     * Returns the function based on the id of a panel's instance
     */
    provide(id: string, action: string, fallback: any = null): any {
      const instance = this.getInstance(id)
      if (!instance) {
        if (fallback !== null) return fallback
        console.warn(`Panel "${id}" not ready for ${action}()`)
        return undefined
      }

      const prop = (instance as any)[action]
      if (typeof prop === 'function' && fallback === null) {
        return prop.call(instance)
      }
      return prop !== undefined ? prop : fallback
    },

    /**
     * Updates the global mobile state and notifies all panel instances.
     */
    setMobile: useDebounceFn(function(this: PanelContextActions, isMobile: boolean): void {
      if (state.isMobile === isMobile) return
      state.isMobile = isMobile

      Object.values(state.panels).forEach(instance =>
        instance.handleResize(isMobile)
      )

      if (isMobile) {
        this.closeAllPanels()
      }
    }, 100)
  }

  provide(PanelStateSymbol, readonly(state))
  provide(PanelActionsSymbol, actions)

  return { state, actions }
}

/**
 * Hook to access the central panel state and actions.
 * Throws an error if used outside of a PanelProvider.
 */
export function usePanelContext(): PanelContext {
  const state = inject<Readonly<PanelContextState>>(PanelStateSymbol)
  const actions = inject<PanelContextActions>(PanelActionsSymbol)
  if (!state || !actions) {
    throw new Error('usePanelContext() must be used within a <PanelProvider> component.')
  }
  return { state, actions }
}
