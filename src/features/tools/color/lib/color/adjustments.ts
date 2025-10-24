// src/features/tools/color/composables/adjustments.ts
import { filterBrightness, filterSaturate, filterHueRotate, filterContrast } from "culori"
import { RGB } from "./types"
import { toCuloriRgb, fromCuloriRgb } from "./converters"

export function adjustBrightness(rgb: RGB, amount: number): RGB {
  return fromCuloriRgb(filterBrightness(amount)(toCuloriRgb(rgb)))
}
export function adjustSaturation(rgb: RGB, factor: number): RGB {
  return fromCuloriRgb(filterSaturate(factor)(toCuloriRgb(rgb)))
}
export function adjustHue(rgb: RGB, degrees: number): RGB {
  return fromCuloriRgb(filterHueRotate(degrees)(toCuloriRgb(rgb)))
}
export function adjustContrast(rgb: RGB, factor: number): RGB {
  return fromCuloriRgb(filterContrast(factor)(toCuloriRgb(rgb)))
}
export function adjustTemperature(rgb: RGB, kelvinDelta: number): RGB {
  const hueShift = kelvinDelta > 0 ? 15 : -15
  return adjustHue(rgb, hueShift)
}
