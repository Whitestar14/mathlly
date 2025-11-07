import { ConversionUnit, ConverterType } from '../types'
import { ConverterConstants } from '../lib/constants'

/**
 * Parses user input like '100 cm' into value and unit components.
 * Returns null if parsing fails.
 */
export function parseUnitInput(input: string): { value: number; unit: string } | null {
  const trimmed = input.trim()
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
  if (!match) return null
  const value = parseFloat(match[1])
  const unit = match[2].trim()
  if (isNaN(value)) return null
  return { value, unit }
}

/**
 * Formats a value with its unit for display, choosing between symbol and full name based on the flag.
 */
export function formatUnitDisplay(value: number, unit: ConversionUnit, showAbbreviation: boolean): string {
  const displayUnit = showAbbreviation ? unit.symbol : unit.name
  return `${value} ${displayUnit}`
}

/**
 * Validates if a value is a valid number for conversion (not NaN, not Infinity, within reasonable bounds).
 */
export function isValidNumber(value: any): boolean {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return false
  return value >= ConverterConstants.MIN_CONVERSION_VALUE && value <= ConverterConstants.MAX_CONVERSION_VALUE
}

/**
 * Normalizes unit identifiers to lowercase and handles common aliases (e.g., 'metres' -> 'meter', 'lbs' -> 'pound').
 */
export function normalizeUnitId(unitId: string): string {
  const unitAliases: Record<string, string> = {
    'metres': 'meter',
    'meters': 'meter',
    'lbs': 'pound',
    'lb': 'pound'
  }
  const lower = unitId.toLowerCase()
  return unitAliases[lower] || lower
}

/**
 * Filters units by converter type.
 */
export function getUnitsByCategory(units: ConversionUnit[], category: ConverterType): ConversionUnit[] {
  return units.filter(u => u.category === category)
}

/**
 * Maps user-friendly unit IDs to math.js-compatible unit names based on converter type.
 * Returns the original unitId if no mapping is found (e.g., for CSS units or future custom converters).
 */
export function getMathJsUnitName(unitId: string, converterType: ConverterType): string {
  const mappings: Record<ConverterType, Record<string, string>> = {
    temperature: {
      celsius: 'degC',
      fahrenheit: 'degF',
      kelvin: 'K',
      rankine: 'degR'
    },
    length: {
      // SI Units
      meter: 'm',
      kilometer: 'km',
      centimeter: 'cm',
      millimeter: 'mm',
      micrometer: 'micrometer',
      nanometer: 'nanometer',

      // Imperial/US Units
      mile: 'mile',
      yard: 'yard',
      foot: 'ft',
      inch: 'inch',
      'nautical-mile': 'nauticalmile'

    },
    weight: {
      // SI Units
      kilogram: 'kg',
      gram: 'g',
      milligram: 'mg',
      microgram: 'microgram',
      'metric-ton': 'tonne',

      // Imperial/US Units
      pound: 'lb',
      ounce: 'oz'

    },
    'css-units': {
      px: 'px',
      pt: 'csspt',
      cm: 'cm',
      mm: 'mm',
      in: 'inch',
      rem: 'rem',
      em: 'em',
      vh: 'vh',
      vw: 'vw'
    },
    currency: {}
  }

  const typeMappings = mappings[converterType]
  return typeMappings ? typeMappings[unitId] || unitId : unitId
}
