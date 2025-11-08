// customConversionHelpers.ts
import { unit } from 'mathjs'
import { getMathJsUnitName } from './unitHelpers'
import { ConverterType } from '../types'

export function convertWithCustom(
  type: ConverterType,
  value: number,
  fromUnit: string,
  toUnit: string,
  customConversions: Record<string, number>,
  canonical: string // e.g. 'm/s' for speed, 'rad' for angle
): number {
  let baseValue: number

  // Step 1: normalize to canonical
  if (customConversions[fromUnit]) {
    baseValue = value * customConversions[fromUnit]
  } else {
    const mathJsFromUnit = getMathJsUnitName(fromUnit, type)
    baseValue = unit(value, mathJsFromUnit).to(canonical).toNumber()
  }

  // Step 2: convert from canonical to target
  if (customConversions[toUnit]) {
    return baseValue / customConversions[toUnit]
  } else {
    const mathJsToUnit = getMathJsUnitName(toUnit, type)
    return unit(baseValue, canonical).to(mathJsToUnit).toNumber()
  }
}
