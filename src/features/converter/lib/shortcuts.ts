import type { KeyBinding } from '@stores/keyboard'

export const converterManifest: KeyBinding[] = [
  { key: 'Ctrl+Enter', description: 'Convert value', context: 'converter', enabled: false, priority: 10 },
  { key: 'Ctrl+F', description: 'Flip units', context: 'converter', enabled: false, priority: 8 },
  { key: 'Ctrl+C', description: 'Copy result', context: 'converter', enabled: false, priority: 5 },
  { key: 'Ctrl+V', description: 'Paste from clipboard', context: 'converter', enabled: false, priority: 5 },
  { key: 'Ctrl+1', description: 'Switch to Temperature converter', context: 'converter', enabled: false, priority: 6 },
  { key: 'Ctrl+2', description: 'Switch to Length converter', context: 'converter', enabled: false, priority: 6 },
  { key: 'Ctrl+3', description: 'Switch to Weight converter', context: 'converter', enabled: false, priority: 6 },
  { key: 'Ctrl+4', description: 'Switch to CSS Units converter', context: 'converter', enabled: false, priority: 6 },
  { key: 'Escape', description: 'Clear input', context: 'converter', enabled: false, priority: 5 }
]