// src/features/tools/color/composables/harmonies.ts
import { RGB } from "./types"
import { adjustHue } from "./adjustments"
import { converter } from "culori"
const toHsl = converter("hsl")
const toRgb = converter("rgb")
import { toCuloriRgb, fromCuloriRgb } from "./converters"

export function generateComplementary(rgb: RGB): RGB {
  return adjustHue(rgb, 180)
}
export function generateTriadic(rgb: RGB): RGB[] {
  return [rgb, adjustHue(rgb, 120), adjustHue(rgb, 240)]
}
export function generateAnalogous(rgb: RGB): RGB[] {
  return [adjustHue(rgb, -30), rgb, adjustHue(rgb, 30)]
}
export function generateMonochromatic(rgb: RGB): RGB[] {
  const hsl = toHsl(toCuloriRgb(rgb))
  const L = (hsl?.l ?? 0) * 100
  const variations = [
    Math.max(0, L - 40),
    Math.max(0, L - 20),
    L,
    Math.min(100, L + 20),
    Math.min(100, L + 40),
  ]
  return variations.map(l =>
    fromCuloriRgb(toRgb({ h: hsl?.h ?? 0, s: hsl?.s ?? 0, l: l / 100, mode: "hsl" }))
  )
}
