import { createUnit, unit } from 'mathjs'
import type { ConverterConfig } from '../../types/converter'
import { ConverterConstants } from '../../lib/constants'

class CssUnitsService {
  private baseFontSize: number = ConverterConstants.DEFAULT_BASE_FONT_SIZE
  private viewportWidth: number = 1920
  private viewportHeight: number = 1080

  setBaseFontSize(size: number): void {
    if (size <= 0) throw new Error('Base font size must be positive')
    this.baseFontSize = size
  }

  setViewportDimensions(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error('Viewport dimensions must be positive numbers')
    }
    this.viewportWidth = width
    this.viewportHeight = height
  }

  private getUnitToPx(value: number, unit: string): number {
    switch (unit) {
      case 'px': return value
      case 'rem': return value * this.baseFontSize
      case 'em': return value * this.baseFontSize
      case 'percent': return (value * this.baseFontSize) / 100
      case 'vw': return (value * this.viewportWidth) / 100
      case 'vh': return (value * this.viewportHeight) / 100
      case 'pt': return (value * 96) / 72
      case 'cm': return (value * 96) / 2.54
      case 'mm': return (value * 96) / 25.4
      case 'in': return value * 96
      default: throw new Error(`Unknown unit: ${unit}`)
    }
  }

  private getPxToUnit(px: number, unit: string): number {
    switch (unit) {
      case 'px': return px
      case 'rem': return px / this.baseFontSize
      case 'em': return px / this.baseFontSize
      case 'percent': return (px / this.baseFontSize) * 100
      case 'vw': return (px / this.viewportWidth) * 100
      case 'vh': return (px / this.viewportHeight) * 100
      case 'pt': return px / (96 / 72)
      case 'cm': return px / (96 / 2.54)
      case 'mm': return px / (96 / 25.4)
      case 'in': return px / 96
      default: throw new Error(`Unknown unit: ${unit}`)
    }
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    const absoluteUnits = ['px', 'pt', 'cm', 'mm', 'in']

    if (absoluteUnits.includes(fromUnit) && absoluteUnits.includes(toUnit)) {
      const mathUnit = unit(value, fromUnit === 'pt' ? 'csspt' : fromUnit)
      return mathUnit.to(toUnit === 'pt' ? 'csspt' : toUnit).toNumber()
    }

    return this.getPxToUnit(this.getUnitToPx(value, fromUnit), toUnit)
  }
}

// Initialize Math.js units once
let unitsInitialized = false
function initializeCssUnits() {
  if (unitsInitialized) return

  createUnit('px', { definition: '0.0104166667 inch' })
  createUnit('csspt', { definition: '1.3333333333 px' })

  unitsInitialized = true
}
initializeCssUnits()

// Create service instance
const cssUnitsService = new CssUnitsService()

// Export setter for backward compatibility and service updates
export function setBaseFontSize(size: number): void {
  cssUnitsService.setBaseFontSize(size)
}

export function setViewportDimensions(width: number, height: number): void {
  cssUnitsService.setViewportDimensions(width, height)
}

// Custom converter function
const customConverter = (value: number, fromUnit: string, toUnit: string): number => {
  return cssUnitsService.convert(value, fromUnit, toUnit)
}

export const cssUnitsConfig: ConverterConfig = {
  id: 'css-units',
  name: 'CSS Units Converter',
  description: 'Convert between CSS length units (px, rem, em, vh, vw, etc.)',
  icon: 'code',
  useMathJs: false,
  customConverter,
  defaultFromUnit: 'px',
  defaultToUnit: 'rem',
  units: [
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
}

export { cssUnitsService }