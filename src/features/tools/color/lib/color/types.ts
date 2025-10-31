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

export function isRGBA(x: any): x is RGBA {
  return 'r' in x && 'g' in x && 'b' in x && 'a' in x
}
export function isRGB(x: any): x is RGB {
  return 'r' in x && 'g' in x && 'b' in x && !('a' in x)
}
export function isHSL(x: any): x is HSL {
  return 'h' in x && 's' in x && 'l' in x
}
export function isHSV(x: any): x is HSV {
  return 'h' in x && 's' in x && 'v' in x
}
export function isOKLCH(x: any): x is OKLCH {
  return 'l' in x && 'c' in x && 'h' in x
}
export function isLAB(x: any): x is LAB {
  return 'l' in x && 'a' in x && 'b' in x && !('c' in x)
}

