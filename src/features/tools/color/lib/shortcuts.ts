import type { KeyBinding } from '@stores/keyboard'

export const colorManifest: KeyBinding[] = [
  { key: 'Ctrl+A', description: 'Open Activity Panel', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+Shift+C', description: 'Copy Current Color', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+P', description: 'Add Color to Palette', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+ArrowRight', description: 'Previous Harmony Card', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+ArrowLeft', description: 'Next Harmony Card', context: 'tools.color', enabled: false, priority: 5 },
]