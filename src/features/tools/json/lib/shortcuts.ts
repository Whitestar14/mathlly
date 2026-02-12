import type { KeyBinding } from '@stores/keyboard'

export const jsonManifest: KeyBinding[] = [
  { key: 'Ctrl+Enter', description: 'Format JSON', context: 'tools.json', enabled: false, priority: 10 },
  { key: 'Ctrl+Shift+Enter', description: 'Minify JSON', context: 'tools.json', enabled: false, priority: 10 },
  { key: 'Ctrl+S', description: 'Copy Result', context: 'tools.json', enabled: false, priority: 5 }
]
