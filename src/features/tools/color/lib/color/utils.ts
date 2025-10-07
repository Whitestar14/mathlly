// src/features/tools/color/composables/utils.ts
import { RGB } from "./types"
import { adjustHue } from "./adjustments"

export function invertColor(rgb: RGB): RGB {
  return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b }
}
export function toGrayscale(rgb: RGB): RGB {
  const lum = Math.round(rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114)
  return { r: lum, g: lum, b: lum }
}
export function clampRgbValues(rgb: RGB): RGB {
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b))),
  }
}
export function adjustTemperature(rgb: RGB, kelvinDelta: number): RGB {
  const hueShift = kelvinDelta > 0 ? 15 : -15
  return adjustHue(rgb, hueShift)
}
