import type { KeyBinding } from '@stores/keyboard'

export const qrCodeManifest: KeyBinding[] = [
  { key: 'Ctrl+Enter', description: 'Generate QR Code', context: 'tools.qrcode', enabled: false, priority: 10 },
  { key: 'Ctrl+S', description: 'Download PNG', context: 'tools.qrcode', enabled: false, priority: 5 },
  { key: 'Escape', description: 'Clear Input', context: 'tools.qrcode', enabled: false, priority: 5 }
]
