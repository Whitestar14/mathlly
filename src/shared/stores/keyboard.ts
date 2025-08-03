import { defineStore } from "pinia"
import { ref, computed, markRaw, type Ref, type ComputedRef } from "vue"

// Define interfaces for keyboard shortcuts
interface ShortcutAction {
  action: string
  payload?: string
  description: string
}

interface ShortcutRegistry {
  global: Record<string, ShortcutAction>
  calculator: Record<string, ShortcutAction>
  programmer: Record<string, ShortcutAction>
  tools: Record<string, ShortcutAction>
}

// Define base validator type
type BaseValidator = RegExp

// Define base validators interface
interface BaseValidators {
  BIN: BaseValidator
  OCT: BaseValidator
  DEC: BaseValidator
  HEX: BaseValidator
}

/**
 * Store for managing keyboard shortcuts and input validation
 */
export const useKeyboardStore = defineStore("keyboard", () => {
  /**
   * Base validation regular expressions for programmer mode
   */
  const BASE_VALIDATORS: BaseValidators = markRaw({
    BIN: /^[0-1]$/,
    OCT: /^[0-7]$/,
    DEC: /^[0-9]$/,
    HEX: /^[0-9a-fA-F]$/,
  })

  /**
   * Keys that are always allowed regardless of context
   */
  const COMMON_KEYS: readonly string[] = markRaw([
    "backspace", 
    "enter", 
    "escape", 
    "+", 
    "-", 
    "×", 
    "÷", 
    "(", 
    ")", 
    "%"
  ])

  /**
   * Key normalization mapping
   */
  const KEY_MAP: Record<string, string> = markRaw({
    enter: "enter",
    backspace: "backspace",
    escape: "escape",
    "*": "×",
    "/": "÷",
  })

  /**
   * Registered keyboard shortcuts by context
   */
  const shortcuts: Ref<ShortcutRegistry> = ref({
    global: {
      "ctrl+alt+f": {
        action: "toggleFullscreen",
        description: "Toggle Fullscreen",
      },
      "ctrl+l": { action: "toggleSidebar", description: "Toggle Sidebar" },
      "ctrl+h": { action: "toggleActivity", description: "Toggle Activity" },
      "ctrl+,": { action: "toggleMenubar", description: "Toggle Menubar" },
      "ctrl+ ": { action: "openShortcutModal", description: "Open Shortcuts" },
      "ctrl+shift+m": { action: "toggleTheme", description: "Toggle Theme" },
    },
    calculator: {
      escape: { action: "clear", description: "Clear Input" },
      enter: { action: "calculate", description: "Calculate Result" },
      backspace: { action: "backspace", description: "Delete Last Character" },

      // Number keys
      0: { action: "input", payload: "0", description: "Input 0" },
      1: { action: "input", payload: "1", description: "Input 1" },
      2: { action: "input", payload: "2", description: "Input 2" },
      3: { action: "input", payload: "3", description: "Input 3" },
      4: { action: "input", payload: "4", description: "Input 4" },
      5: { action: "input", payload: "5", description: "Input 5" },
      6: { action: "input", payload: "6", description: "Input 6" },
      7: { action: "input", payload: "7", description: "Input 7" },
      8: { action: "input", payload: "8", description: "Input 8" },
      9: { action: "input", payload: "9", description: "Input 9" },

      // Operators
      "+": { action: "input", payload: "+", description: "Add" },
      "-": { action: "input", payload: "-", description: "Subtract" },
      "*": { action: "input", payload: "×", description: "Multiply" },
      "/": { action: "input", payload: "÷", description: "Divide" },
      ".": { action: "input", payload: ".", description: "Decimal" },
      "(": { action: "input", payload: "(", description: "Open Parenthesis" },
      ")": { action: "input", payload: ")", description: "Close Parenthesis" },
    },
    programmer: {
      a: { action: "input", payload: "A", description: "Hex A" },
      b: { action: "input", payload: "B", description: "Hex B" },
      c: { action: "input", payload: "C", description: "Hex C" },
      d: { action: "input", payload: "D", description: "Hex D" },
      e: { action: "input", payload: "E", description: "Hex E" },
      f: { action: "input", payload: "F", description: "Hex F" },
    },
    tools: {
      "ctrl+enter": { action: "process", description: "Process Input" },
      "ctrl+s": { action: "swap", description: "Swap Input and Output" },
      "ctrl+v": { action: "paste", description: "Paste from Clipboard" },
      "ctrl+c": { action: "copy", description: "Copy Result" },
    },
  })

  /**
   * Whether keyboard shortcuts are enabled
   */
  const isEnabled: Ref<boolean> = ref(true)
  
  /**
   * Current context stack (hierarchical)
   */
  const contextStack: Ref<string[]> = ref(["global"])
  
  /**
   * Active shortcuts based on current context stack
   */
  const activeShortcuts: ComputedRef<Record<string, ShortcutAction>> = computed(() => {
    return contextStack.value.reduce((acc, context) => {
      const contextShortcuts = shortcuts.value[context as keyof ShortcutRegistry] || {}
      return { ...acc, ...contextShortcuts }
    }, {} as Record<string, ShortcutAction>)
  })

  /**
   * Current active context (excluding global)
   */
  const currentContext: ComputedRef<string> = computed(() => {
    return contextStack.value[contextStack.value.length - 1]
  })

  /**
   * Sets the current keyboard context
   */
  function setContext(ctx: string): void {    
    // Remove existing instance of context if it exists
    contextStack.value = contextStack.value.filter((c) => c !== ctx)
    
    // Add new context to top of stack
    contextStack.value.push(ctx)
  }

  /**
   * Clears a context from the stack
   */
  function clearContext(ctx: string): void {    
    contextStack.value = contextStack.value.filter((c) => c !== ctx)
    
    // Ensure global context is always present
    if (contextStack.value.length === 0) {
      contextStack.value = ["global"]
    }
  }

  /**
   * Validates if a key is valid input in the current context
   */
  function isValidInput(key: string): boolean {
    // Normalize the key to handle special cases
    const normalizedKey = key?.toLowerCase?.()

    // Always allow common keys
    if (COMMON_KEYS.includes(normalizedKey)) return true

    // If not in programmer mode, allow all numeric input
    if (!contextStack.value.includes("programmer")) {
      return /^[0-9.]$/.test(normalizedKey)
    }

    // For programmer mode, validate against current base
    const validator = BASE_VALIDATORS[currentContext.value as keyof BaseValidators]
    
    // Ensure validation happens against the normalized key
    return validator?.test(normalizedKey) ?? false
  }

  /**
   * Normalizes key names for consistency
   */
  function normalizeKey(key: string): string {
    return KEY_MAP[key] || key
  }

  return {
    shortcuts,
    isEnabled,
    contextStack,
    currentContext,
    activeShortcuts,
    setContext,
    clearContext,
    isValidInput,
    normalizeKey,
  }
})
