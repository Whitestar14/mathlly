
import {
  wcagContrast,
  wcagLuminance,
  filterDeficiencyProt,
  filterDeficiencyDeuter,
  filterDeficiencyTrit
} from 'culori'
import { RGB, RGBA } from './types'
import { toCuloriRgb, fromCuloriRgb } from './converters'

export function getContrastRatio(color1: RGB | RGBA, color2: RGB | RGBA): number {
  return wcagContrast(toCuloriRgb(color1), toCuloriRgb(color2)) ?? 1
}
export function getLuminance(rgb: RGB | RGBA): number {
  return wcagLuminance(toCuloriRgb(rgb)) ?? 0
}
export function isDarkColor(rgb: RGB | RGBA): boolean {
  return getLuminance(rgb) < 0.5
}
export function getReadableTextColor(background: RGB | RGBA, opts?: { prefer?: 'black' | 'white' }): RGB {
  const black: RGBA = { r: 0, g: 0, b: 0, a: 1 }
  const white: RGBA = { r: 255, g: 255, b: 255, a: 1 }
  const cb = getContrastRatio(background, black)
  const cw = getContrastRatio(background, white)
  if (opts?.prefer && cb >= 4.5 && cw >= 4.5) {
    return opts.prefer === 'black' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
  }
  return cb >= cw ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
}

export function simulateColorBlindness(
  rgb: RGB,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): RGB {
  const base = toCuloriRgb(rgb)
  let simulated: any
  if (type === 'protanopia') simulated = filterDeficiencyProt(1)(base)
  else if (type === 'deuteranopia') simulated = filterDeficiencyDeuter(1)(base)
  else if (type === 'tritanopia') simulated = filterDeficiencyTrit(1)(base)
  return simulated ? fromCuloriRgb(simulated) : rgb
}
