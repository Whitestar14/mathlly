import { computed } from 'vue'
import { useToolOptions } from '@composables/ui/useToolOptions'

interface ColorOptions {
  autoApplyAdjustments: boolean
  showImageExtractor: boolean
}

const DEFAULT_COLOR_OPTIONS: ColorOptions = {
  autoApplyAdjustments: true,
  showImageExtractor: true
}

export function useColorOptions() {
  const { options, isLoading } = useToolOptions<ColorOptions>(
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
      },
      {
        id: 'showImageExtractor',
        label: 'Show Image Color Extractor',
        description: 'Display the experimental image color extraction tool in the adjustments panel',
        type: 'toggle',
        value: options,
        section: 'Experimental'
      }
    ]
  )

  return {
    options,
    autoApplyAdjustments: computed(() => options.value.autoApplyAdjustments),
    showImageExtractor: computed(() => options.value.showImageExtractor),
    isLoading
  }
}
