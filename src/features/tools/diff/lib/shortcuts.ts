import type { KeyBinding } from '@stores/keyboard'

export const diffManifest: KeyBinding[] = [
  { key: 'Ctrl+S', description: 'Swap Original and Modified texts', context: 'tools.diff', enabled: false, priority: 5 },
  { key: 'Ctrl+Delete', description: 'Clear all Diff Checker inputs', context: 'tools.diff', enabled: false, priority: 5 }
]
