// src/features/tools/color/composables/converters.ts
import { converter, formatHex, parse } from "culori"
import { RGB, RGBA, HSL, HSV, OKLCH, LAB, ColorFormats } from "./types"

const toRgb = converter("rgb")
const toHsl = converter("hsl")
const toHsv = converter("hsv")
const toOklch = converter("oklch")
const toLab = converter("lab")

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

const fromCuloriRgb = (c: any): RGB => ({
  r: clamp255((c?.r ?? 0) * 255),
  g: clamp255((c?.g ?? 0) * 255),
  b: clamp255((c?.b ?? 0) * 255),
})
const toCuloriRgb = (rgb: RGB | RGBA) => ({
  r: clamp01((rgb.r ?? 0) / 255),
  g: clamp01((rgb.g ?? 0) / 255),
  b: clamp01((rgb.b ?? 0) / 255),
  a: "a" in rgb ? clamp01((rgb as any).a ?? 1) : undefined,
  mode: "rgb" as const,
})
const getAlpha = (c: any): number | undefined =>
  typeof c?.a === "number" ? Math.max(0, Math.min(1, c.a)) : undefined

export function hexToRgb(hex: string): RGB {
  const c = toRgb(hex)
  return c ? fromCuloriRgb(c) : { r: 0, g: 0, b: 0 }
}
export function rgbToHex(rgb: RGB): string {
  return formatHex(toCuloriRgb(rgb)) || "#000000"
}
export function rgbaToHex(rgba: RGBA, includeAlpha = true): string {
  const rr = clamp255(rgba.r).toString(16).padStart(2, "0")
  const gg = clamp255(rgba.g).toString(16).padStart(2, "0")
  const bb = clamp255(rgba.b).toString(16).padStart(2, "0")
  if (includeAlpha) {
    const aa = clamp255(Math.round(Math.max(0, Math.min(1, rgba.a)) * 255)).toString(16).padStart(2, "0")
    return `#${rr}${gg}${bb}${aa}`.toUpperCase()
  }
  return `#${rr}${gg}${bb}`.toUpperCase()
}

export function rgbToHsl(rgb: RGB): HSL {
  const c = toHsl(toCuloriRgb(rgb))
  return { h: c?.h ?? 0, s: (c?.s ?? 0) * 100, l: (c?.l ?? 0) * 100 }
}
export function hslToRgb(hsl: HSL): RGB {
  const c = toRgb({ h: hsl.h, s: hsl.s / 100, l: hsl.l / 100, mode: "hsl" })
  return fromCuloriRgb(c)
}
export function rgbToHsv(rgb: RGB): HSV {
  const c = toHsv(toCuloriRgb(rgb))
  return { h: c?.h ?? 0, s: (c?.s ?? 0) * 100, v: (c?.v ?? 0) * 100 }
}
export function hsvToRgb(hsv: HSV): RGB {
  const c = toRgb({ h: hsv.h, s: hsv.s / 100, v: hsv.v / 100, mode: "hsv" })
  return fromCuloriRgb(c)
}
export function rgbToOklch(rgb: RGB): OKLCH {
  const c = toOklch(toCuloriRgb(rgb))
  return { l: (c?.l ?? 0) * 100, c: (c?.c ?? 0) * 100, h: c?.h ?? 0 }
}
export function oklchToRgb(oklch: OKLCH): RGB {
  const c = toRgb({ l: oklch.l / 100, c: oklch.c / 100, h: oklch.h, mode: "oklch" })
  return fromCuloriRgb(c)
}
export function rgbToLab(rgb: RGB): LAB {
  const c = toLab(toCuloriRgb(rgb))
  return { l: (c?.l ?? 0) * 100, a: (c?.a ?? 0) * 100, b: (c?.b ?? 0) * 100 }
}
export function labToRgb(lab: LAB): RGB {
  const c = toRgb({ l: lab.l / 100, a: lab.a / 100, b: lab.b / 100, mode: "lab" })
  return fromCuloriRgb(c)
}

export function convertColor(input: string | RGB | RGBA | HSL | HSV | OKLCH | LAB): ColorFormats {
  let c: any
  if (typeof input === "string") {
    c = parse(input) ?? toCuloriRgb({ r: 0, g: 0, b: 0 })
  } else if ("a" in (input as any)) {
    c = toCuloriRgb(input as RGBA)
  } else if ("r" in (input as any)) {
    c = toCuloriRgb(input as RGB)
  } else if ("h" in (input as any) && "s" in (input as any) && "l" in (input as any)) {
    c = { h: (input as HSL).h, s: (input as HSL).s / 100, l: (input as HSL).l / 100, mode: "hsl" }
  } else if ("h" in (input as any) && "s" in (input as any) && "v" in (input as any)) {
    c = { h: (input as HSV).h, s: (input as HSV).s / 100, v: (input as HSV).v / 100, mode: "hsv" }
  } else if ("l" in (input as any) && "c" in (input as any) && !("a" in (input as any))) {
    c = { l: (input as OKLCH).l / 100, c: (input as OKLCH).c / 100, h: (input as OKLCH).h, mode: "oklch" }
  } else if ("l" in (input as any) && "a" in (input as any) && "b" in (input as any) && !("c" in (input as any))) {
    c = { l: (input as LAB).l / 100, a: (input as LAB).a / 100, b: (input as LAB).b / 100, mode: "lab" }
  } else {
    c = toCuloriRgb({ r: 0, g: 0, b: 0 })
  }

  const rgbC = toRgb(c) ?? { r: 0, g: 0, b: 0 }
  const hslC = toHsl(c) ?? { h: 0, s: 0, l: 0 }
  const hsvC = toHsv(c) ?? { h: 0, s: 0, v: 0 }
  const oklchC = toOklch(c) ?? { l: 0, c: 0, h: 0 }
  const labC = toLab(c) ?? { l: 0, a: 0, b: 0 }

  const alpha = getAlpha(c) ?? getAlpha(rgbC) ?? 1
  const rgb: RGB = fromCuloriRgb(rgbC)
  const rgba: RGBA = { ...rgb, a: alpha }
  const hex = alpha !== undefined && alpha !== 1 ? rgbaToHex(rgba, true) : rgbToHex(rgb)

  return {
    hex,
    rgb,
    rgba,
    hsl: { h: hslC.h ?? 0, s: (hslC.s ?? 0) * 100, l: (hslC.l ?? 0) * 100 },
    hsv: { h: hsvC.h ?? 0, s: (hsvC.s ?? 0) * 100, v: (hsvC.v ?? 0) * 100 },
    oklch: { l: (oklchC.l ?? 0) * 100, c: (oklchC.c ?? 0) * 100, h: oklchC.h ?? 0 },
    lab: { l: (labC.l ?? 0) * 100, a: (labC.a ?? 0) * 100, b: (labC.b ?? 0) * 100 },
  }
}

// re-export helpers for other modules
export { fromCuloriRgb, toCuloriRgb, clamp01, clamp255 }
