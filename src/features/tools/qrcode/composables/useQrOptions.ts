import { computed } from 'vue'
import { useToolOptions } from '@composables/ui/useToolOptions'
import type { QrCodeToolOptions } from '../types'

const DEFAULT_QR_OPTIONS: QrCodeToolOptions = {
  defaultErrorCorrection: 'M',
  defaultMargin: 2,
  defaultScale: 10,
  autoGenerate: true,
  defaultDarkColor: '#000000',
  defaultLightColor: '#FFFFFF'
}

export function useQrOptions() {
  const { options, isLoading } = useToolOptions<QrCodeToolOptions>(
    'qrcode',
    'QR Code Generator',
    DEFAULT_QR_OPTIONS,
    options => [
      {
        id: 'autoGenerate',
        label: 'Auto Generate',
        description: 'Generate QR code immediately while typing',
        type: 'toggle',
        value: options,
        section: 'Behavior'
      },
      {
        id: 'defaultErrorCorrection',
        label: 'Default Error Correction',
        description: 'Recovery capacity (L: ~7%, M: ~15%, Q: ~25%, H: ~30%)',
        type: 'select',
        value: options,
        options: [
          { label: 'Low (L)', value: 'L' },
          { label: 'Medium (M)', value: 'M' },
          { label: 'Quartile (Q)', value: 'Q' },
          { label: 'High (H)', value: 'H' }
        ],
        section: 'Defaults'
      },
      {
        id: 'defaultMargin',
        label: 'Default Margin',
        description: 'Quiet zone width (modules)',
        type: 'range',
        value: options,
        min: 0,
        max: 10,
        step: 1,
        section: 'Defaults'
      },
      {
        id: 'defaultScale',
        label: 'Output Scale',
        description: 'Resolution multiplier (pixels per module)',
        type: 'range',
        value: options,
        min: 2,
        max: 20,
        step: 1,
        section: 'Defaults'
      }
    ]
  )

  return {
    options,
    autoGenerate: computed(() => options.value.autoGenerate),
    isLoading
  }
}
