import { onMounted, onUnmounted, ref, computed, type Ref, type ComputedRef } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useKeyboardStore } from '@stores/keyboard'

// Define interfaces for keyboard handlers
interface KeyboardHandlers {
  input?: (key: string) => void
  clear?: () => void
  calculate?: () => void
  backspace?: () => void
  toggleFullscreen?: () => void
  toggleSidebar?: () => void
  toggleActivity?: () => void
  toggleMenubar?: () => void
  openShortcutModal?: () => void
  toggleTheme?: () => void
  process?: () => void
  swap?: () => void
  paste?: () => void
  copy?: () => void
  [key: string]: ((payload?: any) => void) | undefined
}

// Define the return type of the composable
interface UseKeyboardReturn {
  setContext: (context: string) => void
  clearContext: (context: string) => void
  currentContext: ComputedRef<string>
}

/**
 * Composable for handling keyboard interactions and shortcuts
 * 
 * @param initialContext - Initial keyboard context
 * @param handlers - Event handlers for keyboard actions
 * @returns Keyboard management API
 */
export function useKeyboard(
  initialContext: string = 'global', 
  handlers: KeyboardHandlers = {}
): UseKeyboardReturn {
  const keyboardStore = useKeyboardStore()
  
  /**
   * Whether keyboard events are currently being processed
   */
  const isProcessing: Ref<boolean> = ref(false)
  
  /**
   * Constructs a key combination string from a keyboard event
   * 
   * @param event - The keyboard event
   * @returns Formatted key combination (e.g., "ctrl+shift+a")
   */
  const getKeyCombo = (event: KeyboardEvent): string => {
    const combo: string[] = []
    if (event.ctrlKey) combo.push('ctrl')
    if (event.shiftKey) combo.push('shift')
    if (event.altKey) combo.push('alt')
    if (event.metaKey) combo.push('meta')
    
    // Normalize key name
    const key = keyboardStore.normalizeKey(event.key?.toLowerCase?.() || '')
    combo.push(key)
    
    return combo.join('+')
  }

  /**
   * Current keyboard context
   */
  const currentContext: ComputedRef<string> = computed(() => keyboardStore.currentContext)

  /**
   * Handles keyboard events and dispatches to appropriate handlers
   * 
   * @param event - The keyboard event
   */
  const handleKeyDown = (event: KeyboardEvent): void => {
    // Prevent processing if keyboard is disabled or already processing
    if (!keyboardStore.isEnabled || isProcessing.value) return
    
    try {
      isProcessing.value = true
      
      const combo = getKeyCombo(event)
      const singleKey = keyboardStore.normalizeKey(event.key?.toLowerCase?.() || '')

      // Check for shortcuts first
      const shortcut = keyboardStore.activeShortcuts[combo]
      if (shortcut && handlers[shortcut.action]) {
        event.preventDefault()
        handlers[shortcut.action]?.(shortcut.payload)
        return
      }

      // Process single key input if valid
      if (keyboardStore.isValidInput(singleKey) && handlers.input) {
        event.preventDefault()
        handlers.input(singleKey)
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Sets the current keyboard context
   * @param context - The context to set
   */
  const setContext = (context: string): void => {
    keyboardStore.setContext(context)
  }

  /**
   * Clears a keyboard context
   * @param context - The context to clear
   */
  const clearContext = (context: string): void => {
    keyboardStore.clearContext(context)
  }

  // Use VueUse's useEventListener for better cleanup
  useEventListener('keydown', handleKeyDown)

  // Set initial context if provided
  onMounted(() => {
    if (initialContext && initialContext !== 'global') {
      keyboardStore.setContext(initialContext)
    }
  })

  // Clean up context when component is unmounted
  onUnmounted(() => {
    if (initialContext && initialContext !== 'global') {
      keyboardStore.clearContext(initialContext)
    }
  })

  return {
    setContext,
    clearContext,
    currentContext,
  }
}

// Export types for external use
export type { KeyboardHandlers, UseKeyboardReturn }
