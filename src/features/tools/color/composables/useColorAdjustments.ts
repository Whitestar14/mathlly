// src/features/tools/color/composables/useColorAdjustments.ts
import { ref } from 'vue'
import { adjustBrightness, adjustSaturation, adjustHue, adjustContrast } from './useColor'
import type { RGB } from '../types/color'

export function useColorAdjustments(onUpdate: (c: RGB) => void) {
  // Brightness: -1 → 1 (relative factor offset)
  const brightness = ref(0)
  // Saturation: 0 → 2 (factor)
  const saturation = ref(1)
  // Hue: -180 → 180 (degrees)
  const hue = ref(0)

  const setBrightness = (v: number) => { brightness.value = v }
  const setSaturation = (v: number) => { saturation.value = v }
  const setHue = (v: number) => { hue.value = v }

  const applyBrightness = (color: RGB) => {
    // brightness.value is -1..1, so convert to factor
    const factor = 1 + brightness.value
    onUpdate(adjustBrightness(color, factor))
  }

  const applySaturation = (color: RGB) => {
    onUpdate(adjustSaturation(color, saturation.value))
  }

  const applyHue = (color: RGB) => {
    onUpdate(adjustHue(color, hue.value))
  }

  const applyContrast = (color: RGB, factor = 1.2) => {
    onUpdate(adjustContrast(color, factor))
  }

  return {
    brightness, saturation, hue,
    setBrightness, setSaturation, setHue,
    applyBrightness, applySaturation, applyHue, applyContrast,
  }
}
