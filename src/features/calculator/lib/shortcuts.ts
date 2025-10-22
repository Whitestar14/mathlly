// src/features/calculator/shortcuts.ts
import type { KeyBinding } from '@stores/keyboard'

export const calculatorManifest: KeyBinding[] = [
  // Core calculator actions
  { key: 'Enter', description: 'Evaluate', context: 'calculator', enabled: false, priority: 10 },
  { key: 'Escape', description: 'Clear', context: 'calculator', enabled: false, priority: 5 },
  { key: 'Backspace', description: 'Backspace', context: 'calculator', enabled: false, priority: 5 },
  { key: 'Ctrl+Shift+A', description: 'Toggle activity', context: 'calculator', enabled: false, priority: 5 },

  // Programmer base switching
  { key: 'Ctrl+1', description: 'Set base: HEX', context: 'calculator.programmer', enabled: false, priority: 6 },
  { key: 'Ctrl+2', description: 'Set base: DEC', context: 'calculator.programmer', enabled: false, priority: 6 },
  { key: 'Ctrl+3', description: 'Set base: OCT', context: 'calculator.programmer', enabled: false, priority: 6 },
  { key: 'Ctrl+4', description: 'Set base: BIN', context: 'calculator.programmer', enabled: false, priority: 6 },
]
