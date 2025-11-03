
import { computed } from 'vue'
import {
  generateComplementary,
  generateTriadic,
  generateAnalogous,
  generateMonochromatic
} from '@color/lib/color'
import type { RGB } from '@color/lib/color'

export function useColorHarmonies(current: () => RGB) {
  const complementaryColor = computed(() => generateComplementary(current()))
  const triadicColors = computed(() => generateTriadic(current()))
  const analogousColors = computed(() => generateAnalogous(current()))
  const monochromaticColors = computed(() => generateMonochromatic(current()))
  return { complementaryColor, triadicColors, analogousColors, monochromaticColors }
}
