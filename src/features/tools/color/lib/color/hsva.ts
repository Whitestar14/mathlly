// src/features/tools/color/composables/hsva.ts
import { clamp01 } from "./converters"
import { HSVA, RGBA } from "./types"
import { rgbToHsv, hsvToRgb } from "./converters"

export function hsvaToRgba(hsva: HSVA): RGBA {
  const rgb = hsvToRgb({ h: hsva.h, s: hsva.s * 100, v: hsva.v * 100 })
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: clamp01(hsva.a) }
}

export function hexToHsva(hex: string): HSVA | null {
  if (!hex) return null
  let h = hex.trim().replace(/^#/, "").toLowerCase()
  if (h.length === 3 || h.length === 4) h = h.split("").map(c => c + c).join("")
  if (!(h.length === 6 || h.length === 8)) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
  const hsv = rgbToHsv({ r, g, b })
  return { h: hsv.h, s: (hsv.s ?? 0) / 100, v: (hsv.v ?? 0) / 100, a }
}
