// src/features/tools/color/composables/useColorAdjustments.ts
import { ref } from 'vue'
import { adjustBrightness, adjustSaturation, adjustHue, adjustContrast } from '@color/lib/color'
import type { RGB } from '@color/lib/color'

export function useColorAdjustments(onUpdate: (c: RGB) => void) {
  const brightness = ref(0)
  const saturation = ref(1)
  const hue = ref(0)

  const setBrightness = (v: number) => { brightness.value = v }
  const setSaturation = (v: number) => { saturation.value = v }
  const setHue = (v: number) => { hue.value = v }

  const applyBrightness = (color: RGB) => {
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
