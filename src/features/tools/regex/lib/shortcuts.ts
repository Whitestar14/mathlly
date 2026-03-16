import type { KeyBinding } from '@stores/keyboard'

export const regexManifest: KeyBinding[] = [
  { key: 'Ctrl+Enter', description: 'Evaluate active RegEx pattern', context: 'tools.regex', enabled: false, priority: 5 },
  { key: 'Ctrl+Delete', description: 'Clear Regex tester inputs', context: 'tools.regex', enabled: false, priority: 5 }
]
