import { colorsNamed, converter } from 'culori'
import { RGB, RGBA } from './types'

const toRgb = converter('rgb')
type CuloriRgb = { r: number; g: number; b: number; mode: 'rgb'; a?: number }

// Precompute named colors
const NAMED_COLOR_ENTRIES: Array<[string, CuloriRgb]> = Object.entries(colorsNamed).map(([name, value]) => {
  const hex = '#' + value.toString(16).padStart(6, '0')
  return [name, toRgb(hex) as CuloriRgb]
})

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const toCuloriRgb = (rgb: RGB | RGBA) => ({
  r: clamp01((rgb.r ?? 0) / 255),
  g: clamp01((rgb.g ?? 0) / 255),
  b: clamp01((rgb.b ?? 0) / 255),
  a: 'a' in rgb ? clamp01((rgb as any).a ?? 1) : undefined,
  mode: 'rgb' as const
})

function getColorDistance(c1: CuloriRgb, c2: CuloriRgb): number {
  const dr = c1.r - c2.r
  const dg = c1.g - c2.g
  const db = c1.b - c2.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

export function getColorName(rgb: RGB | RGBA | undefined | null): string {
  if (!rgb) return 'Unknown'
  
  try {
    const target = toCuloriRgb(rgb)
    let minDistance = Infinity
    let nearestName = 'Unknown'

    for (const [name, color] of NAMED_COLOR_ENTRIES) {
      const distance = getColorDistance(target as CuloriRgb, color)
      if (distance < minDistance) {
        minDistance = distance
        nearestName = name
      }
    }
    
    return nearestName
  } catch {
    return 'Unknown'
  }
}
