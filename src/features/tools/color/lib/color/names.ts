
import { colorsNamed, converter, nearest } from 'culori'
import { RGB, RGBA } from './types'

const toRgb = converter('rgb')
type CuloriRgb = { r: number; g: number; b: number; mode: 'rgb'; a?: number }
const NAMED_COLOR_ENTRIES: Array<[string, CuloriRgb]> = Object.entries(colorsNamed).map(([name, value]) => {
  const hex = '#' + value.toString(16).padStart(6, '0')
  return [name, toRgb(hex) as CuloriRgb]
})
const NAMED_COLOR_MAP = new Map<string, CuloriRgb>(NAMED_COLOR_ENTRIES)
const NAMED_COLOR_NAMES = NAMED_COLOR_ENTRIES.map(([name]) => name)
const resolveNearestName = nearest(NAMED_COLOR_NAMES, undefined, (name: string) => NAMED_COLOR_MAP.get(name)!)

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const toCuloriRgb = (rgb: RGB | RGBA) => ({
  r: clamp01((rgb.r ?? 0) / 255),
  g: clamp01((rgb.g ?? 0) / 255),
  b: clamp01((rgb.b ?? 0) / 255),
  a: 'a' in rgb ? clamp01((rgb as any).a ?? 1) : undefined,
  mode: 'rgb' as const
})

export function getColorName(rgb: RGB | RGBA | undefined | null): string {
  if (!rgb) return 'Unknown'
  try {
    const result = resolveNearestName(toCuloriRgb(rgb), 1)
    return result?.[0] ?? 'Unknown'
  } catch {
    return 'Unknown'
  }
}
