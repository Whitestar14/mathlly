// src/composables/useConversionVisualization.ts
export const SupportedTypes = ['temperature', 'length', 'weight', 'volume', 'data', 'area'] as const
export type SupportedType = typeof SupportedTypes[number]

export interface VisualizationItem {
  key: string
  type: 'reference' | 'scientific'
  formattedValue: string
  prefix?: string
  unit?: string
  label?: string
  value?: number
}

/** Symbolized unit display labels */
const UNIT_DISPLAY: Record<string, string> = {
  // temperature
  celsius: '°C', fahrenheit: '°F', kelvin: 'K',
  // length
  meter: 'm', kilometer: 'km', centimeter: 'cm', millimeter: 'mm',
  mile: 'mi', yard: 'yd', foot: 'ft', inch: 'in',
  // area
  squareMeter: 'm²', squareKilometer: 'km²', squareCentimeter: 'cm²',
  squareFoot: 'ft²', squareYard: 'yd²', squareInch: 'in²', acre: 'ac', hectare: 'ha',
  // weight
  kilogram: 'kg', gram: 'g', milligram: 'mg', tonne: 't', pound: 'lb', ounce: 'oz',
  // volume
  liter: 'L', milliliter: 'mL', cubicMeter: 'm³', gallon: 'gal', quart: 'qt', pint: 'pt', cup: 'cup', tablespoon: 'tbsp', teaspoon: 'tsp',
  // data (binary prefixes)
  byte: 'B', kilobyte: 'KB', megabyte: 'MB', gigabyte: 'GB', terabyte: 'TB', petabyte: 'PB'
}

type FactorTypes = Exclude<SupportedType, 'temperature'>

const CONVERSION_FACTORS: Record<FactorTypes, Record<string, number>> = {
  length: {
    meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
    mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254
  },
  weight: {
    kilogram: 1, gram: 0.001, milligram: 1e-6, tonne: 1000,
    pound: 0.45359237, ounce: 0.028349523125
  },
  volume: {
    liter: 1, milliliter: 0.001, cubicMeter: 1000,
    gallon: 3.785, quart: 0.946, pint: 0.473, cup: 0.24,
    tablespoon: 0.015, teaspoon: 0.005
  },
  data: {
    byte: 1,
    kilobyte: 1000,
    megabyte: 1000 ** 2,
    gigabyte: 1000 ** 3,
    terabyte: 1000 ** 4,
    petabyte: 1000 ** 5
  },
  area: {
    squareMeter: 1,
    squareKilometer: 1_000_000,
    squareCentimeter: 0.0001,
    hectare: 10_000,
    acre: 4046.8564224,
    squareFoot: 0.09290304,
    squareYard: 0.83612736,
    squareInch: 0.00064516
  }
}

/** Temperature (affine) */
function convertTemperature(value: number, from: string, to: string): number {
  const toC = (v: number, u: string): number => {
    switch (u) {
      case 'celsius': return v
      case 'kelvin': return v - 273.15
      case 'fahrenheit': return (v - 32) * (5 / 9)
      default: return v
    }
  }
  const c = toC(value, from)
  switch (to) {
    case 'celsius': return c
    case 'kelvin': return c + 273.15
    case 'fahrenheit': return c * (9 / 5) + 32
    default: return c
  }
}

function convert(value: number, from: string, to: string, type: SupportedType): number {
  if (type === 'temperature') return convertTemperature(value, from, to)
  const factors = CONVERSION_FACTORS[type as FactorTypes]
  const fromFactor = factors?.[from]
  const toFactor = factors?.[to]
  if (fromFactor == null || toFactor == null) return value
  return value * fromFactor / toFactor
}

/** References with domains + anchors (add more mid-range entries for better matches) */
const REFERENCES: Record<SupportedType, Array<{
  min: number; max: number; name: string; anchor?: number; key: string; unit: string
}>> = {
  temperature: [
    { min: -60, max: -20, name: 'antarctic winter', anchor: -40, key: 'antarctic-winter', unit: 'celsius' },
    { min: -2, max: 5, name: 'freezing point of water', anchor: 0, key: 'freezing-point-of-water', unit: 'celsius' },
    { min: 19, max: 23, name: 'room temperature', anchor: 22, key: 'room-temperature', unit: 'celsius' },
    { min: 36.5, max: 37.5, name: 'body temperature', anchor: 37, key: 'body-temperature', unit: 'celsius' },
    { min: 90, max: 110, name: 'boiling point of water', anchor: 100, key: 'boiling-point-of-water', unit: 'celsius' },
    { min: 180, max: 260, name: 'oven temperature', anchor: 200, key: 'oven-temperature', unit: 'celsius' },
    { min: 5000, max: 7000, name: 'sun surface', anchor: 5778, key: 'sunsurface', unit: 'kelvin' },
    { min: 25000, max: 35000, name: 'lightning bolt', anchor: 30000, key: 'lightning-bolt', unit: 'kelvin' },
    { min: -273.15, max: -273.15, name: 'absolute zero', anchor: -273.15, key: 'absolute-zero', unit: 'celsius' }
  ],

  length: [
    { min: 1.5, max: 2.0, name: 'human height', anchor: 1.7, key: 'human-height', unit: 'meter' },
    { min: 90, max: 120, name: 'football field', anchor: 100, key: 'football-field', unit: 'meter' },
    { min: 200, max: 450, name: 'skyscraper', anchor: 350, key: 'skyscraper', unit: 'meter' },
    { min: 12_742_000, max: 12_742_000, name: 'earth diameter', anchor: 12_742_000, key: 'earth-diameter', unit: 'meter' },
    { min: 384_000_000, max: 384_000_000, name: 'earth to moon distance', anchor: 384_000_000, key: 'earth-moon-distance', unit: 'meter' }
  ],

  weight: [
    { min: 50_000, max: 100_000, name: 'adult human', anchor: 70_000, key: 'adult-human', unit: 'gram' },
    { min: 3_000_000, max: 7_000_000, name: 'elephant', anchor: 5_000_000, key: 'elephant', unit: 'gram' },
    { min: 100_000_000, max: 150_000_000, name: 'blue whale', anchor: 120_000_000, key: 'blue-whale', unit: 'gram' },
    { min: 5.97e27, max: 5.97e27, name: 'earth mass', anchor: 5.97e27, key: 'earth-mass', unit: 'gram' }
  ],

  volume: [
    { min: 0.004, max: 0.006, name: 'teaspoon', anchor: 0.005, key: 'teaspoon', unit: 'liter' },
    { min: 0.014, max: 0.016, name: 'tablespoon', anchor: 0.015, key: 'tablespoon', unit: 'liter' },
    { min: 0.23, max: 0.27, name: 'cup', anchor: 0.24, key: 'cup', unit: 'liter' },
    { min: 1.9, max: 5.1, name: '2-liter bottle', anchor: 2, key: 'two-liter-bottle', unit: 'liter' },
    { min: 10, max: 15, name: 'bucket', anchor: 12, key: 'bucket', unit: 'liter' },
    { min: 150, max: 200, name: 'bathtub', anchor: 180, key: 'bathtub', unit: 'liter' },
    { min: 200, max: 250, name: 'rain barrel', anchor: 220, key: 'rain-barrel', unit: 'liter' },
    { min: 5_000, max: 10_000, name: 'small pool', anchor: 7_500, key: 'small-pool', unit: 'liter' },
    { min: 2_400_000, max: 2_600_000, name: 'Olympic swimming pool', anchor: 2_500_000, key: 'olympic-pool', unit: 'liter' },
    { min: 1.3e21, max: 1.35e21, name: 'Ocean of Earth', anchor: 1.332e21, key: 'earth-ocean', unit: 'liter' }
  ],

  area: [
    { min: 7_140, max: 7_140, name: 'football field', anchor: 7_140, key: 'football-field', unit: 'squareMeter' },
    { min: 4_046, max: 4_046, name: 'acre', anchor: 4046, key: 'acre', unit: 'squareMeter' },
    { min: 10_000, max: 10_000, name: 'hectare', anchor: 10_000, key: 'hectare', unit: 'squareMeter' },
    { min: 510_000_000_000_000, max: 510_000_000_000_000, name: 'earth surface area', anchor: 510_000_000_000_000, key: 'earth-surface-area', unit: 'squareMeter' }
  ],

  data: [
    { min: 1400, max: 1500, name: '3.5\" floppy disk', anchor: 1440, key: '3-5-floppy-disk', unit: 'kilobyte' },
    { min: 4600, max: 5000, name: 'DVD', anchor: 4700, key: 'dvd', unit: 'megabyte' },
    { min: 25_000, max: 50_000, name: 'Blu-ray disc', anchor: 25_000, key: 'blu-ray', unit: 'megabyte' },
    { min: 1, max: 8, name: 'SSD', anchor: 4, key: 'ssd', unit: 'terabyte' },
    { min: 20, max: 80, name: 'internet archive', anchor: 70, key: 'internet-archive', unit: 'petabyte' },
    { min: 1000, max: 2000, name: 'smartphone storage', anchor: 128, key: 'smartphone-storage', unit: 'gigabyte' },
    { min: 1e6, max: 2e6, name: 'large data center', anchor: 1.5e6, key: 'data-center', unit: 'terabyte' }
  ]
};

/** Scientific formatter and unit picker */
function formatScientificParts(value: number, unit: string, prefix?: string): VisualizationItem {
  return {
    type: 'scientific',
    formattedValue: formatNumber(value),
    prefix,
    unit: UNIT_DISPLAY[unit] ?? unit,
    value,
    key: `sci-${unit}`
  }
}

/** Avoid extreme candidates that produce unreadable tiny numbers */
function pickScientificUnits(value: number, type: SupportedType, from: string, to: string, topN = 3): VisualizationItem[] {
  const baseUnits = type === 'temperature'
    ? ['celsius', 'fahrenheit', 'kelvin']
    : Object.keys(CONVERSION_FACTORS[type as FactorTypes] ?? {})

  const candidates = baseUnits.filter(u => u !== from && u !== to).map(u => {
    const v = convert(value, from, u, type)
    return { unit: u, v, score: readabilityScore(v) }
  }).sort((a, b) => a.score - b.score)

  // Prefer values in 0.01–100000 range
  const preferred = candidates.filter(c => Math.abs(c.v) >= 0.01 && Math.abs(c.v) <= 100000)

  const chosen = (preferred.length > 0 ? preferred : candidates).slice(0, topN)
  return chosen.map(({ v, unit }) => formatScientificParts(v, unit))
}

function buildReferenceViz(value: number, type: SupportedType, from: string, maxRefs = 1): VisualizationItem[] {
  const refs = REFERENCES[type] ?? []
  if (!refs.length) return []

  const scored = refs.map(ref => {
    const anchor = ref.anchor ?? (ref.min + ref.max) / 2
    const valInRefUnit = convert(value, from, ref.unit, type)
    const multiplier = valInRefUnit / (anchor || 1)
    const approx = isApproximately(valInRefUnit, anchor, ref)
    return { ref, valInRefUnit, multiplier, approx, distanceToOne: Math.abs(multiplier - 1) }
  }).sort((a, b) => a.distanceToOne - b.distanceToOne)

  // Prefer multipliers in 0.01–1000 range
  const preferred = scored.filter(r => r.multiplier >= 0.01 && r.multiplier <= 1000)

  const chosen = (preferred.length > 0 ? preferred : scored).slice(0, maxRefs)
  return chosen.map(best => ({
    type: 'reference',
    formattedValue: best.approx ? '≈' : formatMultiplier(best.multiplier),
    label: best.ref.name,
    key: best.ref.key,
    value: best.valInRefUnit
  }))
}

/** Formatting and heuristics */
function formatNumber(n: number): string {
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 1000 || abs < 0.01) return n.toExponential(2)
  if (abs >= 100) return n.toFixed(0)
  if (abs >= 10) return n.toFixed(1)
  if (abs >= 1) return n.toFixed(2)
  return n.toPrecision(3)
}

function formatMultiplier(k: number): string {
  const abs = Math.abs(k)
  let text: string
  if (abs >= 1000 || abs < 0.01) text = k.toExponential(1)
  else if (abs >= 100) text = k.toFixed(0)
  else if (abs >= 10) text = k.toFixed(1)
  else if (abs >= 1) text = k.toFixed(2)
  else if (abs >= 0.1) text = k.toFixed(2)
  else text = k.toPrecision(2)
  return `${text}×`
}

function readabilityScore(v: number): number {
  const abs = Math.abs(v)
  if (abs === 0) return 10
  if (abs >= 1 && abs < 1000) return Math.abs(Math.log10(abs) - 2)
  return Math.abs(Math.log10(abs)) + 3
}

function isApproximately(val: number, anchor: number, ref: { min: number; max: number }): boolean {
  const width = Math.max(1, Math.abs(ref.max - ref.min))
  const baseTol = width * 0.05
  const absVal = Math.abs(val)
  const tol = Math.max(baseTol, absVal > 1 ? absVal * 0.03 : 0.03)
  return Math.abs(val - anchor) <= tol
}

/** Public API with caps: small shows 2 scientific + 1 reference; large shows 1 + 1 */
export function useConversionVisualization() {
  function getVisualization(value: number, from: string, to: string, type: SupportedType): VisualizationItem[] {
    const sciCandidates = pickScientificUnits(value, type, from, to, 3)
    const refCandidates = buildReferenceViz(value, type, from, 1)

    const magnitude = sciCandidates[0]?.value ?? value
    const isSmall = Math.abs(magnitude) >= 1 && Math.abs(magnitude) < 1000

    const sciCap = isSmall ? 2 : 1
    const refCap = 1

    // Take up to sciCap scientific
    const sci = sciCandidates.slice(0, sciCap)
    // Take up to refCap references
    const refs = refCandidates.slice(0, refCap)

    let merged: VisualizationItem[] = [...sci, ...refs]

    // If we didn’t fill the expected slots, backfill
    const expectedCount = isSmall ? 3 : 2
    if (merged.length < expectedCount) {
      const extras = [...sciCandidates.slice(sci.length), ...refCandidates.slice(refs.length)]
      merged = [...merged, ...extras.slice(0, expectedCount - merged.length)]
    }

    // Deduplicate
    const out: VisualizationItem[] = []
    const seen = new Set<string>()
    for (const item of merged) {
      const k = `${item.type}:${item.unit ?? ''}:${item.label ?? ''}:${item.key ?? ''}`
      if (!seen.has(k)) {
        seen.add(k)
        out.push(item)
      }
    }
    return out
  }

  return { getVisualization }
}

