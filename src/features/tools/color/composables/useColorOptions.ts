import { computed } from 'vue'
import { createToolOptions } from '@composables/ui/useToolOptions'

interface ColorOptions {
  autoApplyAdjustments: boolean
}

const DEFAULT_COLOR_OPTIONS: ColorOptions = {
  autoApplyAdjustments: true
}

export function useColorOptions() {
  const { options, isLoading } = createToolOptions<ColorOptions>(
    'color',
    'Color Manipulation Tool',
    DEFAULT_COLOR_OPTIONS,
    (options) => [
      {
        id: 'autoApplyAdjustments',
        label: 'Auto-Apply Adjustments',
        description: 'Apply slider changes immediately without clicking Apply buttons',
        type: 'toggle',
        value: options,
        section: 'Adjustments'
      }
    ]
  )

  return {
    options,
    autoApplyAdjustments: computed(() => options.value.autoApplyAdjustments),
    isLoading
  }
}