import type { KeyBinding } from '@stores/keyboard'

export const base64Manifest: KeyBinding[] = [
  { key: 'Ctrl+Enter', description: 'Process current input', context: 'tools.base64', enabled: true, priority: 10 },
  { key: 'Ctrl+V', description: 'Paste from clipboard', context: 'tools.base64', enabled: true, priority: 5 },
  { key: 'Ctrl+C', description: 'Copy result', context: 'tools.base64', enabled: true, priority: 5 },
  { key: 'Ctrl+S', description: 'Swap input/output', context: 'tools.base64', enabled: true, priority: 5 },
  { key: 'Escape', description: 'Clear all fields', context: 'tools.base64', enabled: true, priority: 5 }
]
