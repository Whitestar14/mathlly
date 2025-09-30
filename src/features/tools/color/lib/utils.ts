// src/features/tools/color/utils.ts
import { hslToRgb, oklchToRgb } from '@color/lib/color'
import type { RGBA, ColorFormats } from '@color/lib/color'

export type InputFormat = 'auto' | 'hex' | 'rgba' | 'hsla' | 'oklch'
export type ResolvedFormat = Exclude<InputFormat, 'auto'>

type ParseState = 'valid' | 'partial' | 'invalid'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const clampInt = (v: number, min: number, max: number) => Math.round(clamp(v, min, max))
// Limit alpha precision to prevent ballooning like 0.50196078…
const roundAlpha = (a: number) => Number(clamp(a, 0, 1).toFixed(3))

// Detect format quickly (router for auto mode)
export function detectFormat(val: string): ResolvedFormat | null {
  const s = val.trim().toLowerCase()
  if (s.startsWith('#')) return 'hex'
  if (/^rgba?\(/i.test(s)) return 'rgba'
  if (/^hsla?\(/i.test(s)) return 'hsla'
  if (/^oklch\(/i.test(s)) return 'oklch'
  return null
}

// Shorthand hex helpers (#RGB, #RGBA)
export const isShorthandHex = (s: string) => /^#?[0-9a-fA-F]{3,4}$/.test(s.trim())
export const expandShorthandHex = (s: string) => {
  const h = s.trim().replace(/^#/, '')
  if (!isShorthandHex(s)) return s.startsWith('#') ? s : `#${s}`
  const full = h.split('').map(c => c + c).join('')
  return `#${full}`
}

// Partial-input heuristics (don’t commit or normalize mid-typing)
const isPartialHex = (s: string) => /^#?[0-9a-fA-F]{0,8}$/.test(s.trim())
const isLikelyPartialFunc = (s: string) => {
  const hasOpen = /\(/.test(s) && !/\)/.test(s)
  const endsWithComma = /,\s*$/.test(s) // trailing comma means still typing
  const endsWithOpen = /\(\s*$/.test(s)
  return hasOpen || endsWithComma || endsWithOpen
}

// CSS Color Level 4 functional syntax helpers (commas OR spaces, optional slash for alpha)
const extractFuncArgs = (raw: string, func: 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch') => {
  const m = raw.match(new RegExp(`^${func}\\(([^)]*)\\)$`, 'i'))
  return m ? m[1].trim() : null
}
// Split "a b c / d" OR "a, b, c, d" into [parts, alpha?]
const splitArgsWithAlpha = (args: string) => {
  const [left, right] = args.split('/')
  const parts = (left.includes(',') ? left.split(',') : left.trim().split(/\s+/))
    .map(s => s.trim())
    .filter(Boolean)
  const alpha = right !== undefined ? right.trim() : undefined
  return { parts, alpha }
}
const parseNumber = (s: string): number => {
  if (/%$/.test(s)) return parseFloat(s) / 100 // percentages to 0..1
  return parseFloat(s)
}

// Strict hex parse with alpha support (#RRGGBB or #RRGGBBAA, and shorthand expanded first)
function parseHexStrict(raw: string): RGBA | null {
  const s0 = raw.trim()
  const s1 = isShorthandHex(s0) ? expandShorthandHex(s0) : (s0.startsWith('#') ? s0 : `#${s0}`)
  const h = s1.replace('#', '')
  if (!/^([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(h)) return null

  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  let a = 1
  if (h.length === 8) {
    a = roundAlpha(parseInt(h.slice(6, 8), 16) / 255)
  }
  return { r, g, b, a }
}

// Main tolerant parser for explicit modes
export function parseWithFormatTolerant(
  val: string,
  fmt: ResolvedFormat,
  currentAlpha = 1
): { state: ParseState; rgba: RGBA | null } {
  const raw = val.trim()

  // HEX: commit only when full length; do not carry previous alpha if hex lacks it
  if (fmt === 'hex') {
    if (isPartialHex(raw)) {
      const rgba = parseHexStrict(raw)
      if (!rgba) return { state: 'partial', rgba: null }
      // If user supplied #RRGGBB, alpha should be 1; only #RRGGBBAA defines alpha
      return { state: 'valid', rgba }
    }
    return { state: 'invalid', rgba: null }
  }

  // RGBA: support commas or spaces, optional slash alpha; accept percentages
  if (fmt === 'rgba') {
    if (isLikelyPartialFunc(raw)) return { state: 'partial', rgba: null }
    const args = extractFuncArgs(raw, 'rgba') ?? extractFuncArgs(raw, 'rgb')
    if (!args) return { state: 'invalid', rgba: null }
    const { parts, alpha } = splitArgsWithAlpha(args)
    if (parts.length < 3) return { state: 'partial', rgba: null }

    const rN = parseNumber(parts[0])
    const gN = parseNumber(parts[1])
    const bN = parseNumber(parts[2])
    if ([rN, gN, bN].some(Number.isNaN)) return { state: 'invalid', rgba: null }

    const to255 = (n: number) => (n <= 1 ? n * 255 : n)
    const r = clampInt(to255(rN), 0, 255)
    const g = clampInt(to255(gN), 0, 255)
    const b = clampInt(to255(bN), 0, 255)

    const aRaw = alpha !== undefined ? parseNumber(alpha) : currentAlpha
    const a = roundAlpha(aRaw) // round to prevent alpha ballooning

    return { state: 'valid', rgba: { r, g, b, a } }
  }

  // HSLA: support commas or spaces, optional slash alpha
  if (fmt === 'hsla') {
    if (isLikelyPartialFunc(raw)) return { state: 'partial', rgba: null }
    const args = extractFuncArgs(raw, 'hsla') ?? extractFuncArgs(raw, 'hsl')
    if (!args) return { state: 'invalid', rgba: null }
    const { parts, alpha } = splitArgsWithAlpha(args)
    if (parts.length < 3) return { state: 'partial', rgba: null }

    const h = parseFloat(parts[0])
    const s = parseNumber(parts[1])
    const l = parseNumber(parts[2])
    if ([h, s, l].some(Number.isNaN)) return { state: 'invalid', rgba: null }
    const rgb = hslToRgb({ h, s: s * 100, l: l * 100 })

    const aRaw = alpha !== undefined ? parseNumber(alpha) : currentAlpha
    const a = roundAlpha(aRaw)

    return { state: 'valid', rgba: { r: rgb.r, g: rgb.g, b: rgb.b, a } }
  }

  // OKLCH: support spaces with optional slash alpha
  if (fmt === 'oklch') {
    if (isLikelyPartialFunc(raw)) return { state: 'partial', rgba: null }
    const args = extractFuncArgs(raw, 'oklch')
    if (!args) return { state: 'invalid', rgba: null }
    const { parts, alpha } = splitArgsWithAlpha(args)
    if (parts.length < 3) return { state: 'partial', rgba: null }

    const lRaw = parseFloat(parts[0])
    const cRaw = parseFloat(parts[1])
    const hDeg = parseFloat(parts[2])
    if ([lRaw, cRaw, hDeg].some(Number.isNaN)) return { state: 'invalid', rgba: null }

    const lPct = lRaw > 1 ? lRaw : lRaw * 100
    const cPct = cRaw > 1 ? cRaw : cRaw * 100
    const rgb = oklchToRgb({ l: lPct, c: cPct, h: hDeg })

    const aRaw = alpha !== undefined ? parseNumber(alpha) : currentAlpha
    const a = roundAlpha(aRaw)

    return { state: 'valid', rgba: { r: rgb.r, g: rgb.g, b: rgb.b, a } }
  }

  return { state: 'invalid', rgba: null }
}

// SIMPLE AUTO: detect, then route to the same tolerant parser used by explicit modes
export function parseAutoSimple(
  val: string,
  currentAlpha = 1
): { state: ParseState; rgba: RGBA | null; format: ResolvedFormat | null } {
  const fmt = detectFormat(val)
  if (!fmt) return { state: 'invalid', rgba: null, format: null }

  // Respect partial typing (so backspace doesn’t snap)
  if (fmt === 'hex' && isPartialHex(val)) {
    const rgba = parseHexStrict(val)
    if (!rgba) return { state: 'partial', rgba: null, format: 'hex' }
    // While typing hex, just mark partial unless fully valid handled above
    // Fall through to return valid if parseHexStrict succeeded
    return { state: 'valid', rgba, format: 'hex' }
  }
  if (isLikelyPartialFunc(val)) return { state: 'partial', rgba: null, format: fmt }

  // IMPORTANT: When auto detects HEX, do NOT carry previous alpha.
  // Use hex-defined alpha if present; otherwise set a = 1.
  if (fmt === 'hex') {
    const rgba = parseHexStrict(val)
    if (!rgba) return { state: 'invalid', rgba: null, format: 'hex' }
    return { state: 'valid', rgba, format: 'hex' }
  }

  const { state, rgba } = parseWithFormatTolerant(val, fmt, currentAlpha)
  return { state, rgba, format: fmt }
}

// Pretty formatters (QoL)
export const formatRgbaPretty = (c: RGBA) =>
  `rgba(${c.r}, ${c.g}, ${c.b}, ${roundAlpha(c.a ?? 1)})`

export const formatHslaPretty = (c: RGBA, f: ColorFormats) =>
  `hsla(${Math.round(f.hsl.h)}, ${Math.round(f.hsl.s)}%, ${Math.round(f.hsl.l)}%, ${roundAlpha(c.a ?? 1)})`

export const formatOklchPretty = (c: RGBA, f: ColorFormats) =>
  `oklch(${(f.oklch.l / 100).toFixed(3)} ${(f.oklch.c / 100).toFixed(3)} ${Math.round(f.oklch.h)} / ${roundAlpha(c.a ?? 1)})`

export function normalizeDisplay(
  current: RGBA,
  formats: ColorFormats,
  mode: InputFormat,
  lastAuto: ResolvedFormat | null,
  raw?: string
): string {
  // While editing, never overwrite the raw string.
  if (raw !== undefined) return raw

  if (mode === 'hex') return formats.hex
  if (mode === 'rgba') return formatRgbaPretty(current)
  if (mode === 'hsla') return formatHslaPretty(current, formats)
  if (mode === 'oklch') return formatOklchPretty(current, formats)

  // Auto: preserve last detected presentation; fallback to RGBA to keep alpha visible
  switch (lastAuto) {
    case 'hex': return formats.hex
    case 'hsla': return formatHslaPretty(current, formats)
    case 'oklch': return formatOklchPretty(current, formats)
    case 'rgba':
    default: return formatRgbaPretty(current)
  }
}
