import type { KeyBinding } from '@stores/keyboard'

export const globalManifest: KeyBinding[] = [
  { key: 'Ctrl+Alt+F', description: 'Toggle Fullscreen', context: 'global', enabled: true, priority: 5 },
  { key: 'Ctrl+L', description: 'Toggle Sidebar', context: 'global', enabled: true, priority: 5 },
  { key: 'Ctrl+M', description: 'Toggle Menubar', context: 'global', enabled: true, priority: 5 },
  { key: 'Ctrl+Space', description: 'Open Shortcuts', context: 'global', enabled: true, priority: 10 },
  { key: 'Ctrl+Shift+K', description: 'Toggle Theme', context: 'global', enabled: true, priority: 5,},
]
