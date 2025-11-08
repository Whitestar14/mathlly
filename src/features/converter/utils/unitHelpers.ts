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
    'lb': 'pound',
    'weeks': 'week'
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

      // Imperial/US Units
      foot: 'ft',
      inch: 'inch',
      'nautical-mile': 'nauticalmile'

    },
    weight: {
      // SI Units
      kilogram: 'kg',
      gram: 'g',
      milligram: 'mg',
      'metric-ton': 'tonne',

      // Imperial/US Units
      pound: 'lb',
      ounce: 'oz'

    },
    volume: {
      'cubic-meter': 'm3',
      liter: 'L',
      milliliter: 'mL',
      'cubic-centimeter': 'cm3',
      'cubic-millimeter': 'mm3',

      'cubic-inch': 'inch3',
      'cubic-foot': 'ft3',
      'cubic-yard': 'yard3'
    },
    data: {},
    area: {
      'square-meter': 'm2',
      'square-kilometer': 'km2',
      'square-centimeter': 'cm2',
      'square-millimeter': 'mm2',
      'square-micrometer': 'micrometer2',
      'square-nanometer': 'nanometer2',

      'square-mile': 'mile2',
      'square-yard': 'yard2',
      'square-foot': 'sqft',
      'square-inch': 'inch2'
    },
    'css-units': {
      pt: 'csspt'
    },
    currency: {},
    energy: {
      joule: 'J',
      kilojoule: 'kJ',
      megajoule: 'MJ',
      gigajoule: 'GJ',
      calorie: 'cal',
      kilocalorie: 'kcal',
      'watt-hour': 'Wh',
      'kilowatt-hour': 'kWh',
      'british-thermal-unit': 'BTU',
      'foot-pound': 'ftlb',
      erg: 'erg',
      electronvolt: 'eV'
    },
    speed: {
      'meter-per-second': 'm/s',
      'kilometer-per-hour': 'km/h',
      'mile-per-hour': 'mi/h',
      'foot-per-second': 'ft/s',
      'inch-per-second': 'inch/s'
    },
    time: {
      second: 's',
      millisecond: 'ms',
      microsecond: 'us',
      nanosecond: 'ns',
      minute: 'min',
      hour: 'h',
      day: 'day',
      week: 'week',
      month: 'month',
      year: 'year',
      decade: 'decade',
      century: 'century',
      millennium: 'millennium',
      'sidereal-day': 'siderealday',
      'sidereal-year': 'siderealyear'
    },
    power: {
      watt: 'W',
      kilowatt: 'kW',
      megawatt: 'MW',
      gigawatt: 'GW',
      horsepower: 'hp',
      'british-thermal-unit-per-hour': 'BTU/h',
      'british-thermal-unit-per-minute': 'BTU/min',
      'foot-pound-per-second': 'ft lbf / s',
      'joule-per-second': 'J/s'
    },
    pressure: {
      pascal: 'Pa',
      kilopascal: 'kPa',
      megapascal: 'MPa',
      bar: 'bar',
      atmosphere: 'atm',
      torr: 'torr',
      'millimeter-of-mercury': 'mmHg',
      'pound-per-square-inch': 'psi'
    },
    angle: {
      degree: 'deg',
      radian: 'rad',
      gradian: 'grad',
      arcminute: 'arcmin',
      arcsecond: 'arcsec',
      milliradian: 'mrad',
      turn: 'cycle'
    }
  }

  const typeMappings = mappings[converterType]
  return typeMappings ? typeMappings[unitId] || unitId : unitId
}
