import { ConverterType } from '@converter/types'

type SupportedType = 'temperature' | 'length' | 'weight' | 'volume'

export type ScientificViz = {
  type: 'scientific'
  value: number            // raw numeric after conversion
  formattedValue: string   // e.g., "274" or "8.5"
  prefix?: string          // "k" | "M" | "G" | "T" | undefined
  unit: string             // e.g., "K", "km"
  targetUnit: string       // e.g., "kelvin", "kilometer"
}

export type ReferenceViz = {
  type: 'reference'
  value: number            // ratio against anchor
  formattedValue: string   // "≈" | "<0.1" | "1.2" | "234"
  prefix?: string          // "×" | "k×" | "M×" | undefined
  label: string            // e.g., "freezing point of water"
  key: string              // slug for icons
}

export type VisualizationItem = ScientificViz | ReferenceViz

/**
 * Scientific candidates per type (agnostic).
 * Extend by adding entries; no logic changes needed.
 */
const SCIENTIFIC_CANDIDATES: Record<
  ConverterType,
  Array<{ unit: string; targetUnit: string; system: 'si' | 'imperial' }>
> = {
  temperature: [
    { unit: '°C', targetUnit: 'celsius', system: 'si' },
    { unit: 'K', targetUnit: 'kelvin', system: 'si' },
    { unit: '°F', targetUnit: 'fahrenheit', system: 'imperial' }
  ],
  length: [
    { unit: 'mm', targetUnit: 'millimeter', system: 'si' },
    { unit: 'cm', targetUnit: 'centimeter', system: 'si' },
    { unit: 'm', targetUnit: 'meter', system: 'si' },
    { unit: 'km', targetUnit: 'kilometer', system: 'si' },
    { unit: 'in', targetUnit: 'inch', system: 'imperial' },
    { unit: 'ft', targetUnit: 'foot', system: 'imperial' },
    { unit: 'mi', targetUnit: 'mile', system: 'imperial' }
  ],
  weight: [
    { unit: 'mg', targetUnit: 'milligram', system: 'si' },
    { unit: 'g', targetUnit: 'gram', system: 'si' },
    { unit: 'kg', targetUnit: 'kilogram', system: 'si' },
    { unit: 't', targetUnit: 'metric-ton', system: 'si' },
    { unit: 'oz', targetUnit: 'ounce', system: 'imperial' },
    { unit: 'lb', targetUnit: 'pound', system: 'imperial' }
  ],
  volume: [
    { unit: 'mL', targetUnit: 'milliliter', system: 'si' },
    { unit: 'L', targetUnit: 'liter', system: 'si' },
    { unit: 'm³', targetUnit: 'cubic-meter', system: 'si' },
    { unit: 'gal', targetUnit: 'us-gallon', system: 'imperial' },
    { unit: 'qt', targetUnit: 'us-quart', system: 'imperial' },
    { unit: 'cup', targetUnit: 'us-cup', system: 'imperial' }
  ],
  'css-units': [],
  currency: []
}

/**
 * Grounded references per type with explicit anchors.
 * Extend by adding entries; no logic changes needed.
 * - temperature anchors in °C (common intuition)
 * - length anchors in the output unit (we compare in toUnit)
 * - weight anchors in the output unit (we compare in toUnit)
 */
const VISUALIZATION_REFERENCES: Record<
  SupportedType,
  Array<{ min: number; max: number; name: string; anchor: number }>
> = {
  temperature: [
    { min: -200, max: -50, name: 'Antarctic winter', anchor: -80 },
    { min: -50, max: -10, name: 'freezing cold', anchor: -20 },
    { min: -10, max: 5, name: 'freezing point of water', anchor: 0 },
    { min: 5, max: 25, name: 'room temperature', anchor: 22 },
    { min: 25, max: 40, name: 'body temperature', anchor: 37 },
    { min: 40, max: 120, name: 'boiling point of water', anchor: 100 },
    { min: 120, max: 1000, name: 'oven temperature', anchor: 180 },
    { min: 1000, max: 6000, name: "Sun's surface", anchor: 5500 },
    { min: 6000, max: 20000, name: 'lightning bolt', anchor: 15000 },
    { min: 20000, max: Infinity, name: 'nuclear fusion', anchor: 10_000_000 }
  ],
  length: [
    { min: 0, max: 0.001, name: 'grain of sand', anchor: 0.0005 },
    { min: 0.001, max: 0.01, name: 'sheet of paper', anchor: 0.005 },
    { min: 0.01, max: 0.1, name: 'pencil length', anchor: 0.05 },
    { min: 0.1, max: 1, name: 'ruler length', anchor: 0.5 },
    { min: 1, max: 2, name: 'human height', anchor: 1.7 },
    { min: 2, max: 5, name: 'car length', anchor: 4 },
    { min: 5, max: 20, name: 'school bus', anchor: 12 },
    { min: 20, max: 100, name: 'football field', anchor: 100 },
    { min: 100, max: 1000, name: 'skyscraper', anchor: 500 },
    { min: 1000, max: 10000, name: 'mountain', anchor: 3000 },
    { min: 10000, max: 100000, name: 'large lake', anchor: 50_000 },
    { min: 100000, max: 1_000_000, name: 'country', anchor: 500_000 },
    { min: 1_000_000, max: 10_000_000, name: 'continent', anchor: 5_000_000 },
    { min: 10_000_000, max: Infinity, name: 'Earth diameter', anchor: 12_742 } // km
  ],
  weight: [
    { min: 0, max: 0.001, name: 'grain of rice', anchor: 0.00003 },
    { min: 0.001, max: 0.01, name: 'apple', anchor: 0.2 },
    { min: 0.01, max: 0.1, name: 'watermelon', anchor: 5 },
    { min: 0.1, max: 1, name: 'bag of sugar', anchor: 1 },
    { min: 1, max: 5, name: 'house cat', anchor: 4 },
    { min: 5, max: 20, name: 'medium dog', anchor: 15 },
    { min: 20, max: 80, name: 'adult human', anchor: 70 },
    { min: 80, max: 500, name: 'grand piano', anchor: 300 },
    { min: 500, max: 2000, name: 'small car', anchor: 1200 },
    { min: 2000, max: 10000, name: 'elephant', anchor: 6000 },
    { min: 10000, max: 100000, name: 'blue whale', anchor: 100_000 },
    { min: 100000, max: 1_000_000, name: 'Boeing 747', anchor: 400_000 },
    { min: 1_000_000, max: Infinity, name: 'space shuttle', anchor: 2_000_000 }
  ],
  volume: [
    { min: 0, max: 0.001, name: 'drop of water', anchor: 0.05 },
    { min: 0.001, max: 0.01, name: 'teaspoon', anchor: 0.005 },
    { min: 0.01, max: 0.1, name: 'tablespoon', anchor: 0.015 },
    { min: 0.1, max: 1, name: 'cup', anchor: 0.24 },
    { min: 1, max: 5, name: 'water bottle', anchor: 0.5 },
    { min: 5, max: 20, name: 'bucket', anchor: 10 },
    { min: 20, max: 200, name: 'bathtub', anchor: 150 },
    { min: 200, max: 2000, name: 'small pool', anchor: 1000 },
    { min: 2000, max: 20000, name: 'swimming pool', anchor: 10000 },
    { min: 20000, max: 200000, name: 'large lake', anchor: 100000 },
    { min: 200000, max: 2_000_000, name: 'reservoir', anchor: 1_000_000 },
    { min: 2_000_000, max: 20_000_000, name: 'Great Lake', anchor: 10_000_000 },
    { min: 20_000_000, max: Infinity, name: 'ocean', anchor: 1_000_000_000 }
  ]
}

/**
 * Converters (pure functions)
 */
const tempConvert = (v: number, f: string, t: string): number => {
  if (f === t) return v
  let c: number
  if (f === 'celsius') c = v
  else if (f === 'fahrenheit') c = (v - 32) * 5 / 9
  else if (f === 'kelvin') c = v - 273.15
  else return v

  if (t === 'celsius') return c
  if (t === 'fahrenheit') return c * 9 / 5 + 32
  if (t === 'kelvin') return c + 273.15
  return v
}

const lengthConvert = (v: number, f: string, t: string): number => {
  const k: Record<string, number> = {
    meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
    mile: 1609.34, foot: 0.3048, inch: 0.0254
  }
  return v * (k[f] ?? 1) / (k[t] ?? 1)
}

const weightConvert = (v: number, f: string, t: string): number => {
  const k: Record<string, number> = {
    kilogram: 1, gram: 0.001, milligram: 1e-6, microgram: 1e-9,
    'metric-ton': 1000, pound: 0.453592, ounce: 0.0283495
  }
  return v * (k[f] ?? 1) / (k[t] ?? 1)
}

const volumeConvert = (v: number, f: string, t: string): number => {
  const k: Record<string, number> = {
    liter: 1, milliliter: 0.001, microliter: 1e-6,
    'cubic-meter': 1000, 'cubic-centimeter': 0.001, 'cubic-millimeter': 1e-6,
    'us-gallon': 3.785411784, 'us-quart': 0.946352946, 'us-pint': 0.473176473,
    'us-cup': 0.2365882365, 'us-fluid-ounce': 0.0295735295625,
    'us-tablespoon': 0.01478676478125, 'us-teaspoon': 0.00492892159375
  }
  return v * (k[f] ?? 1) / (k[t] ?? 1)
}

/**
 * Formatting helpers: compact SI with minimal decimals
 */
const formatScientificParts = (n: number, unit: string) => {
  const abs = Math.abs(n)
  let prefix = ''
  let value = abs

  if (abs >= 1e12) { value = abs / 1e12; prefix = 'T' }
  else if (abs >= 1e9) { value = abs / 1e9; prefix = 'G' }
  else if (abs >= 1e6) { value = abs / 1e6; prefix = 'M' }
  else if (abs >= 1e3) { value = abs / 1e3; prefix = 'k' }

  const formattedValue = value >= 10 ? Math.round(value).toString() : value.toFixed(1)
  return { value, formattedValue, prefix, unit }
}

const formatRatioParts = (ratio: number) => {
  const abs = Math.abs(ratio)
  let prefix = ''
  let value = abs

  if (abs >= 1e6) { value = abs / 1e6; prefix = 'M×' }
  else if (abs >= 1e3) { value = abs / 1e3; prefix = 'k×' }
  else { prefix = '×' }

  const formattedValue =
    abs >= 10 ? Math.round(value).toString() :
      abs >= 1 ? value.toFixed(1) :
        abs >= 0.1 ? value.toFixed(2) : '<0.1'

  return { value, formattedValue, prefix }
}

const toReferenceKey = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * Magnitude score: prefer numeric in ~[0.1, 999]
 */
const scoreMagnitude = (n: number): number => {
  const a = Math.abs(n)
  if (a === 0) return -Infinity
  const log = Math.log10(a)
  const min = Math.log10(0.1) // -1
  const max = Math.log10(999) // ~2.999
  if (log < min) return log - min
  if (log > max) return max - log
  return 0
}

/**
 * Small vs large: based on magnitude in the output unit (toUnit)
 */
const isLargeMagnitude = (
  v: number, f: string, t: string, type: SupportedType
): boolean => {
  const conv = { temperature: tempConvert, length: lengthConvert, weight: weightConvert, volume: volumeConvert }[type]
  const out = conv(v, f, t)
  return scoreMagnitude(out) < -0.75
}

/**
 * Pick N scientific visualizations, excluding active units and respecting imperial options.
 */
const pickScientificUnits = (
  value: number,
  fromUnit: string,
  toUnit: string,
  type: SupportedType,
  maxItems: number,
  includeImperial: boolean
): ScientificViz[] => {
  const conv = { temperature: tempConvert, length: lengthConvert, weight: weightConvert, volume: volumeConvert }[type]
  const active = new Set([fromUnit.toLowerCase(), toUnit.toLowerCase()])

  const candidates = SCIENTIFIC_CANDIDATES[type]
    .filter(c => !active.has(c.targetUnit.toLowerCase()))
    .filter(c => includeImperial ? true : c.system === 'si')
    .map(c => {
      const converted = conv(value, fromUnit, c.targetUnit)
      return { ...c, converted, score: scoreMagnitude(converted) }
    })
    .filter(x => Math.abs(x.converted) >= 0.01)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(x => {
      const parts = formatScientificParts(x.converted, x.unit)
      return {
        type: 'scientific',
        value: x.converted,
        formattedValue: parts.formattedValue,
        prefix: parts.prefix,
        unit: parts.unit,
        targetUnit: x.targetUnit
      } as ScientificViz
    })

  return candidates
}

/**
 * Build a grounded reference visualization (uniform logic for all types):
 * - Compare in an intuitive unit: °C for temperature, toUnit for others.
 * - Use explicit per-reference anchor, not ref.min or type-specific code.
 * - If within ±10% of anchor and inside range, show "≈ label" (formattedValue = "≈").
 * - Otherwise, show ratio against the anchor with compact prefix (k×, M×).
 */
const buildReferenceViz = (
  value: number,
  fromUnit: string,
  toUnit: string,
  type: SupportedType
): ReferenceViz | null => {
  const conv = { temperature: tempConvert, length: lengthConvert, weight: weightConvert, volume: volumeConvert }[type]
  const refs = VISUALIZATION_REFERENCES[type]
  if (!refs?.length) return null

  // Choose comparison unit (agnostic)
  const compareUnit = type === 'temperature' ? 'celsius' : toUnit
  const compareValue = conv(value, fromUnit, compareUnit)

  // Find reference bucket
  const ref =
    refs.find(r => compareValue >= r.min && compareValue < r.max) ??
    refs[refs.length - 1]

  const key = toReferenceKey(ref.name)

  // Use explicit anchor; guard against near-zero anchors
  const safeAnchor = Math.max(Math.abs(ref.anchor), 1e-6)
  const ratio = Math.abs(compareValue) / safeAnchor

  const withinRange = compareValue >= ref.min && compareValue < ref.max
  const closeToAnchor = ratio >= 0.9 && ratio <= 1.1

  if (withinRange && closeToAnchor) {
    return {
      type: 'reference',
      value: 1,
      formattedValue: '≈',
      prefix: '',
      label: ref.name,
      key
    }
  }

  const parts = formatRatioParts(ratio)
  return {
    type: 'reference',
    value: ratio,
    formattedValue: parts.formattedValue,
    prefix: parts.prefix || '×',
    label: ref.name,
    key
  }
}

/**
 * Public API
 */
export function useConversionVisualization(options?: {
  includeImperialLength?: boolean
  includeImperialWeight?: boolean
  includeImperialTemperature?: boolean
}) {
  const opts = {
    includeImperialLength: false,
    includeImperialWeight: true,
    includeImperialTemperature: true,
    ...(options ?? {})
  }

  const getVisualization = (
    value: number,
    fromUnit: string,
    toUnit: string,
    converterType: ConverterType
  ): VisualizationItem[] | undefined => {
    if (!['temperature', 'length', 'weight', 'volume'].includes(converterType)) return undefined

    const type = converterType as SupportedType
    const large = isLargeMagnitude(value, fromUnit, toUnit, type)
    const sciCount = large ? 1 : 2

    const includeImperial =
      (type === 'length' && opts.includeImperialLength) ||
      (type === 'weight' && opts.includeImperialWeight) ||
      (type === 'temperature' && opts.includeImperialTemperature) ||
      (type === 'volume' && true)

    const scientific = pickScientificUnits(value, fromUnit, toUnit, type, sciCount, includeImperial)
    const reference = buildReferenceViz(value, fromUnit, toUnit, type)

    const visuals: VisualizationItem[] = [
      ...scientific,
      ...(reference ? [reference] : [])
    ]

    return visuals.length ? visuals.slice(0, Math.min(visuals.length, sciCount + 1)) : undefined
  }

  const getAllVisualizationsForConverter = (
    converterType: ConverterType
  ): Array<{ min: number; max: number; name: string; anchor: number }> => {
    if (!['temperature', 'length', 'weight'].includes(converterType)) return []
    return VISUALIZATION_REFERENCES[converterType as SupportedType] ?? []
  }

  const hasVisualization = (
    _fromUnit: string,
    _toUnit: string,
    converterType: ConverterType
  ): boolean => {
    if (!['temperature', 'length', 'weight'].includes(converterType)) return false
    return (VISUALIZATION_REFERENCES[converterType as SupportedType]?.length ?? 0) > 0
  }

  return {
    getVisualization,
    getAllVisualizationsForConverter,
    hasVisualization
  }
}
