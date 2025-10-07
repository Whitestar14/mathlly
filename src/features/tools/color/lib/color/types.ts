export type RGB = { r: number; g: number; b: number }
export type RGBA = { r: number; g: number; b: number; a: number }
export type HSL = { h: number; s: number; l: number }
export type HSV = { h: number; s: number; v: number }
export type OKLCH = { l: number; c: number; h: number }
export type LAB = { l: number; a: number; b: number }
export type HSVA = { h: number; s: number; v: number; a: number }

export type ColorFormats = {
  hex: string
  rgb: RGB
  rgba: RGBA
  hsl: HSL
  hsv: HSV
  oklch: OKLCH
  lab: LAB
}
