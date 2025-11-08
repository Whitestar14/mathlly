import type { KeyBinding } from '@stores/keyboard'

export const converterManifest: KeyBinding[] = [
  { key: 'Ctrl+Enter', description: 'Convert value', context: 'converter', enabled: false, priority: 10 },
  { key: 'Ctrl+F', description: 'Flip units', context: 'converter', enabled: false, priority: 8 },
  { key: 'Ctrl+C', description: 'Copy result', context: 'converter', enabled: false, priority: 5 },
  { key: 'Escape', description: 'Clear input', context: 'converter', enabled: false, priority: 5 }
]
