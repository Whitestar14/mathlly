// src/features/tools/color/composables/useColorMixing.ts
import { ref } from 'vue'
import { mixColors, convertColor } from '@color/lib/color'
import type { RGB } from '@color/lib/color'

const HEX6 = /^#[0-9A-Fa-f]{6}$/

export function useColorMixing(onUpdate: (c: RGB) => void, autoApply = false) {
  const mixColor = ref<RGB>({ r: 255, g: 255, b: 255 })
  const mixRatio = ref(50)

  const setMixHex = (hex: string) => {
    if (!HEX6.test(hex)) return false
    
    mixColor.value = convertColor(hex).rgb
    return true
  }
  const setMixRgb = (rgb: RGB) => { mixColor.value = rgb }
  const setMixRatio = (v: number) => { mixRatio.value = Math.max(0, Math.min(100, Math.round(v))) }

  const applyMix = (base: RGB) => {
    onUpdate(mixColors(base, mixColor.value, mixRatio.value / 100))
  }

  const adjustMixRatio = (value: number, baseColor: RGB) => {
    setMixRatio(value)
    if (autoApply) {
      applyMix(baseColor)
    }
  }

  return { mixColor, mixRatio, setMixHex, setMixRgb, setMixRatio, applyMix, adjustMixRatio }
}