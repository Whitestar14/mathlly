import type { KeyBinding } from '@stores/keyboard'

export const colorManifest: KeyBinding[] = [
  { key: 'Ctrl+A', description: 'Toggle Adjustments Panel', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+R', description: 'Generate Random Color', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+E', description: 'Export Current Color', context: 'tools.color', enabled: false, priority: 5 },

  { key: 'Ctrl+Shift+C', description: 'Copy Current Color', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+P', description: 'Add Color to Palette', context: 'tools.color', enabled: false, priority: 5 },
  { key: 'Ctrl+Z', description: 'Undo Last Color Change', context: 'tools.color', enabled: false, priority: 5 },
]