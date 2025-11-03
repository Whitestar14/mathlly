/**
 * Color parsing and formatting utilities for the color tools.
 *
 * Supports both modern CSS Color Level 4 space-separated syntax with optional
 * slash alpha and legacy comma-separated function syntax. Parsing is tolerant
 * to partial input to support live-editing UX.
 */
import { hslToRgb, oklchToRgb } from '@color/lib/color'
import type { RGBA, ColorFormats } from '@color/lib/color'

export type InputFormat = 'auto' | 'hex' | 'rgba' | 'hsla' | 'oklch'
export type ResolvedFormat = Exclude<InputFormat, 'auto'>

type ParseState = 'valid' | 'partial' | 'invalid'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const clampInt = (v: number, min: number, max: number) => Math.round(clamp(v, min, max))

const roundAlpha = (a: number) => Number(clamp(a, 0, 1).toFixed(3))

/**
 * Detect the explicit color notation of a string (excluding auto).
 * @param val Raw color string
 * @returns A concrete format or null if undetected
 */
export function detectFormat(val: string): ResolvedFormat | null {
  const s = val.trim().toLowerCase()
  if (s.startsWith('#')) return 'hex'
  if (/^rgba?\(/i.test(s)) return 'rgba'
  if (/^hsla?\(/i.test(s)) return 'hsla'
  if (/^oklch\(/i.test(s)) return 'oklch'
  return null
}

/** Check if a hex string is shorthand (#RGB or #RGBA, with or without #). */
export const isShorthandHex = (s: string) => /^#?[0-9a-fA-F]{3,4}$/.test(s.trim())
/** Expand shorthand hex (#RGB or #RGBA) to full form (#RRGGBB or #RRGGBBAA). */
export const expandShorthandHex = (s: string) => {
  const h = s.trim().replace(/^#/, '')
  if (!isShorthandHex(s)) return s.startsWith('#') ? s : `#${s}`
  const full = h.split('').map(c => c + c).join('')
  return `#${full}`
}

const isPartialHex = (s: string) => /^#?[0-9a-fA-F]{0,8}$/.test(s.trim())
const isLikelyPartialFunc = (s: string) => {
  const hasOpen = /\(/.test(s) && !/\)/.test(s)
  const endsWithComma = /,\s*$/.test(s)
  const endsWithOpen = /\(\s*$/.test(s)
  return hasOpen || endsWithComma || endsWithOpen
}

/**
 * Extract the inner argument list of a CSS color function.
 * Supports rgb/rgba, hsl/hsla, and oklch.
 * @param raw The full function string, e.g. "rgba(1, 2, 3, 0.5)"
 * @param func Function name to match
 * @returns Inner arguments string or null if not matched
 */
const extractFuncArgs = (raw: string, func: 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch') => {
  const m = raw.match(new RegExp(`^${func}\\(([^)]*)\\)$`, 'i'))
  return m ? m[1].trim() : null
}
/**
 * Split a color function's argument list into channel parts and alpha.
 * Accepts both space-separated and comma-separated syntaxes.
 * If there is no explicit slash alpha, a 4th comma-separated item is treated as alpha.
 * @param args Inner arguments string (without the function wrapper)
 * @returns Parts (channels), slash alpha token if present, and whether commas were used
 */
const splitArgsWithAlpha = (args: string) => {
  const [left, right] = args.split('/')
  const leftHasComma = left.includes(',')
  const parts = (leftHasComma ? left.split(',') : left.trim().split(/\s+/))
    .map(s => s.trim())
    .filter(Boolean)
  const alpha = right !== undefined ? right.trim() : undefined
  return { parts, alpha, leftHasComma }
}
/**
 * Parse a numeric token possibly expressed as a percentage.
 * For alpha: "50%" -> 0.5; For channels: caller decides mapping.
 */
const parseNumber = (s: string): number => {
  if (/%$/.test(s)) return parseFloat(s) / 100
  return parseFloat(s)
}

/**
 * Strict hex parse with optional alpha (#RRGGBB or #RRGGBBAA).
 * Shorthand is expanded prior to validation.
 * @internal
 */
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

/**
 * Parse a color string for an explicit format, tolerant to partial input.
 * Supports modern space-separated with optional "/ alpha" and legacy comma-separated forms.
 * Alpha precedence: slash alpha > 4th comma component > currentAlpha.
 * @param val Raw color string
 * @param fmt Explicit format ('hex' | 'rgba' | 'hsla' | 'oklch')
 * @param currentAlpha Alpha to fall back to when not specified
 */
export function parseWithFormatTolerant(
  val: string,
  fmt: ResolvedFormat,
  currentAlpha = 1
): { state: ParseState; rgba: RGBA | null } {
  const raw = val.trim()

  if (fmt === 'hex') {
    if (isPartialHex(raw)) {
      const rgba = parseHexStrict(raw)
      if (!rgba) return { state: 'partial', rgba: null }
      return { state: 'valid', rgba }
    }
    return { state: 'invalid', rgba: null }
  }

  if (fmt === 'rgba') {
    if (isLikelyPartialFunc(raw)) return { state: 'partial', rgba: null }
    const args = extractFuncArgs(raw, 'rgba') ?? extractFuncArgs(raw, 'rgb')
    if (!args) return { state: 'invalid', rgba: null }
    const { parts, alpha, leftHasComma } = splitArgsWithAlpha(args)
    if (parts.length < 3) return { state: 'partial', rgba: null }

    const rN = parseNumber(parts[0])
    const gN = parseNumber(parts[1])
    const bN = parseNumber(parts[2])
    if ([rN, gN, bN].some(Number.isNaN)) return { state: 'invalid', rgba: null }

    const to255 = (n: number) => (n <= 1 ? n * 255 : n)
    const r = clampInt(to255(rN), 0, 255)
    const g = clampInt(to255(gN), 0, 255)
    const b = clampInt(to255(bN), 0, 255)

    let alphaToken: string | undefined = alpha
    if (alphaToken === undefined && leftHasComma && parts.length >= 4) {
      alphaToken = parts[3]
    }
    const aRaw = alphaToken !== undefined ? parseNumber(alphaToken) : currentAlpha
    const a = roundAlpha(aRaw)

    return { state: 'valid', rgba: { r, g, b, a } }
  }

  if (fmt === 'hsla') {
    if (isLikelyPartialFunc(raw)) return { state: 'partial', rgba: null }
    const args = extractFuncArgs(raw, 'hsla') ?? extractFuncArgs(raw, 'hsl')
    if (!args) return { state: 'invalid', rgba: null }
    const { parts, alpha, leftHasComma } = splitArgsWithAlpha(args)
    if (parts.length < 3) return { state: 'partial', rgba: null }

    const h = parseFloat(parts[0])
    const s = parseNumber(parts[1])
    const l = parseNumber(parts[2])
    if ([h, s, l].some(Number.isNaN)) return { state: 'invalid', rgba: null }
    const rgb = hslToRgb({ h, s: s * 100, l: l * 100 })

    let alphaToken: string | undefined = alpha
    if (alphaToken === undefined && leftHasComma && parts.length >= 4) {
      alphaToken = parts[3]
    }
    const aRaw = alphaToken !== undefined ? parseNumber(alphaToken) : currentAlpha
    const a = roundAlpha(aRaw)

    return { state: 'valid', rgba: { r: rgb.r, g: rgb.g, b: rgb.b, a } }
  }

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

/**
 * Auto-detect and parse a color string using the tolerant explicit parser.
 * @param val Raw color string
 * @param currentAlpha Alpha to fall back to when not specified
 */
export function parseAutoSimple(
  val: string,
  currentAlpha = 1
): { state: ParseState; rgba: RGBA | null; format: ResolvedFormat | null } {
  const fmt = detectFormat(val)
  if (!fmt) return { state: 'invalid', rgba: null, format: null }

  if (fmt === 'hex' && isPartialHex(val)) {
    const rgba = parseHexStrict(val)
    if (!rgba) return { state: 'partial', rgba: null, format: 'hex' }
    return { state: 'valid', rgba, format: 'hex' }
  }
  if (isLikelyPartialFunc(val)) return { state: 'partial', rgba: null, format: fmt }

  if (fmt === 'hex') {
    const rgba = parseHexStrict(val)
    if (!rgba) return { state: 'invalid', rgba: null, format: 'hex' }
    return { state: 'valid', rgba, format: 'hex' }
  }

  const { state, rgba } = parseWithFormatTolerant(val, fmt, currentAlpha)
  return { state, rgba, format: fmt }
}

/** Pretty rgba() formatter with normalized alpha */
export const formatRgbaPretty = (c: RGBA) =>
  `rgba(${c.r}, ${c.g}, ${c.b}, ${roundAlpha(c.a ?? 1)})`

/** Pretty hsla() formatter with normalized alpha */
export const formatHslaPretty = (c: RGBA, f: ColorFormats) =>
  `hsla(${Math.round(f.hsl.h)}, ${Math.round(f.hsl.s)}%, ${Math.round(f.hsl.l)}%, ${roundAlpha(c.a ?? 1)})`

/** Pretty oklch() formatter with normalized alpha */
export const formatOklchPretty = (c: RGBA, f: ColorFormats) =>
  `oklch(${(f.oklch.l / 100).toFixed(3)} ${(f.oklch.c / 100).toFixed(3)} ${Math.round(f.oklch.h)} / ${roundAlpha(c.a ?? 1)})`

/**
 * Normalize a display string for the current color given the selected mode.
 * While editing, pass the raw string to avoid overwriting user input.
 * Auto mode preserves the last detected presentation to reduce flicker.
 */
export function normalizeDisplay(
  current: RGBA,
  formats: ColorFormats,
  mode: InputFormat,
  lastAuto: ResolvedFormat | null,
  raw?: string
): string {
  if (raw !== undefined) return raw

  if (mode === 'hex') return formats.hex
  if (mode === 'rgba') return formatRgbaPretty(current)
  if (mode === 'hsla') return formatHslaPretty(current, formats)
  if (mode === 'oklch') return formatOklchPretty(current, formats)

  switch (lastAuto) {
    case 'hex': return formats.hex
    case 'hsla': return formatHslaPretty(current, formats)
    case 'oklch': return formatOklchPretty(current, formats)
    case 'rgba':
    default: return formatRgbaPretty(current)
  }
}
