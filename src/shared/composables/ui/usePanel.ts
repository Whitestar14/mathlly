import { onUnmounted } from 'vue'
import { usePanelContext } from './panelContext'
import {
  PanelOptions,
  PanelAPI,
  LightweightPanelAPI,
  ToggleOptions
} from './types'

/**
 * Hook to interact with a specific panel instance managed by the context.
 *
 * @param {string} id - The unique ID of the panel.
 * @param {PanelOptions} [options] - Options for the panel. If provided, the panel will be registered.
 * @returns {PanelAPI | LightweightPanelAPI | Record<string, never>} A reference to the panel's API.
 */
export function usePanel(id: string, options: PanelOptions = {}): PanelAPI | LightweightPanelAPI | Record<string, never> {
  if (!id) {
    console.warn('usePanel() requires an id')
    return {}
  }

  const { state, actions } = usePanelContext()
  const hasRegistrationOptions = Object.keys(options).length > 0

  if (state.panels[id]) {
    return state.panels[id]
  }

  if (hasRegistrationOptions) {
    const panel = actions.registerPanel(id, options)!

    onUnmounted(() => {
      actions.unregisterPanel(id)
    })

    return panel
  }

  const lightweightPanel: LightweightPanelAPI = {
    get isOpen(): boolean {
      return actions.provide(id, 'isOpen', false)
    },
    get isMobile(): boolean {
      return state.isMobile
    },
    get panels(): Record<string, PanelAPI> {
      return state.panels
    },
    get options(): PanelOptions | undefined {
      return state.options[id]
    },
    open: (): void => actions.openPanel(id),
    close: (): void => actions.closePanel(id),
    toggle: (options?: ToggleOptions): void => actions.togglePanel(id, options)
  }

  return lightweightPanel
}
