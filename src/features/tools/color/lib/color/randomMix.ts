// src/features/tools/color/composables/randomMix.ts
import { random, interpolate } from "culori"
import { RGB } from "./types"

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
const fromCuloriRgb = (c: any): RGB => ({
  r: clamp255((c?.r ?? 0) * 255),
  g: clamp255((c?.g ?? 0) * 255),
  b: clamp255((c?.b ?? 0) * 255),
})
const toCuloriRgb = (rgb: RGB) => ({
  r: clamp01(rgb.r / 255),
  g: clamp01(rgb.g / 255),
  b: clamp01(rgb.b / 255),
  mode: "rgb" as const,
})

export function generateRandomColor(): RGB {
  return fromCuloriRgb(random())
}
export function mixColors(color1: RGB, color2: RGB, ratio: number): RGB {
  const t = Math.max(0, Math.min(1, ratio))
  const interpolator = interpolate([toCuloriRgb(color1), toCuloriRgb(color2)], "rgb")
  const mixed = interpolator(t)
  return mixed ? fromCuloriRgb(mixed) : color1
}
