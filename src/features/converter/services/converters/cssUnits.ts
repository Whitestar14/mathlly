import { createUnit, unit } from 'mathjs'
import type { ConverterConfig, ConversionUnit } from '../../types/converter'
import { ConverterConstants } from '../../lib/constants'

// Module-level variables for configurable context
let baseFontSize: number = ConverterConstants.DEFAULT_BASE_FONT_SIZE
let viewportWidth: number = 1920
let viewportHeight: number = 1080

// Setter functions for updating context
export function setBaseFontSize(size: number): void {
  if (size <= 0) throw new Error('Base font size must be positive')
  baseFontSize = size
}

export function setViewportDimensions(width: number, height: number): void {
  if (width <= 0 || height <= 0) {
    throw new Error('Viewport dimensions must be positive numbers')
  }
  viewportWidth = width
  viewportHeight = height
}

// Initialize CSS-specific units once
let unitsInitialized = false
function initializeCssUnits() {
  if (unitsInitialized) return

  // exact 1/72 inch
  createUnit('px', { definition: '0.0104167 inch' })

  // then define csspt in terms of px
  createUnit('csspt', { definition: '1.333333 px' })

  unitsInitialized = true
}
initializeCssUnits()

// Centralized conversion factors relative to px
const unitToPx: Record<string, (value: number) => number> = {
  px: v => v,
  rem: v => v * baseFontSize,
  em: v => v * baseFontSize,
  percent: v => (v * baseFontSize) / 100,
  vw: v => (v * viewportWidth) / 100,
  vh: v => (v * viewportHeight) / 100,
  pt: v => (v * 96) / 72,
  cm: v => (v * 96) / 2.54,
  mm: v => (v * 96) / 25.4,
  in: v => v * 96
}

const pxToUnit: Record<string, (px: number) => number> = {
  px: v => v,
  rem: v => v / baseFontSize,
  em: v => v / baseFontSize,
  percent: v => (v / baseFontSize) * 100,
  vw: v => (v / viewportWidth) * 100,
  vh: v => (v / viewportHeight) * 100,
  pt: v => v / (96 / 72),
  cm: v => v / (96 / 2.54),
  mm: v => v / (96 / 25.4),
  in: v => v / 96
}

function toPixels(value: number, u: string): number {
  const fn = unitToPx[u]
  if (!fn) throw new Error(`Unknown unit: ${u}`)
  return fn(value)
}

function fromPixels(px: number, u: string): number {
  const fn = pxToUnit[u]
  if (!fn) throw new Error(`Unknown unit: ${u}`)
  return fn(px)
}

// Custom converter function
const customConverter = (value: number, fromUnit: string, toUnit: string): number => {
  const absoluteUnits = ['px', 'pt', 'cm', 'mm', 'in']

  if (absoluteUnits.includes(fromUnit) && absoluteUnits.includes(toUnit)) {
    const mathUnit = unit(value, fromUnit === 'pt' ? 'csspt' : fromUnit)
    return mathUnit.to(toUnit === 'pt' ? 'csspt' : toUnit).toNumber()
  }

  return fromPixels(toPixels(value, fromUnit), toUnit)
}

// Units array
const units: ConversionUnit[] = [
  { id: 'px', symbol: 'px', name: 'Pixel', category: 'css-units' },
  { id: 'rem', symbol: 'rem', name: 'Root Em', category: 'css-units' },
  { id: 'em', symbol: 'em', name: 'Em', category: 'css-units' },
  { id: 'percent', symbol: '%', name: 'Percent', category: 'css-units' },
  { id: 'vw', symbol: 'vw', name: 'Viewport Width', category: 'css-units' },
  { id: 'vh', symbol: 'vh', name: 'Viewport Height', category: 'css-units' },
  { id: 'pt', symbol: 'pt', name: 'Point', category: 'css-units' },
  { id: 'cm', symbol: 'cm', name: 'Centimeter', category: 'css-units' },
  { id: 'mm', symbol: 'mm', name: 'Millimeter', category: 'css-units' },
  { id: 'in', symbol: 'in', name: 'Inch', category: 'css-units' }
]

// Converter configuration
export const cssUnitsConfig: ConverterConfig = {
  id: 'css-units',
  name: 'CSS Units Converter',
  description: 'Convert between CSS length units (px, rem, em, vh, vw, etc.)',
  icon: 'code',
  useMathJs: false,
  customConverter,
  defaultFromUnit: 'px',
  defaultToUnit: 'rem',
  units
}
