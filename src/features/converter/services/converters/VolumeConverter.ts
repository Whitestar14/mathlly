import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class VolumeConverter extends BaseConverter {
  readonly id: ConverterType = 'volume'
  readonly name = 'Volume Converter'
  readonly description = 'Convert between volume and capacity units'
  readonly icon = 'droplets'
  readonly defaultFromUnit = 'liter'
  readonly defaultToUnit = 'us-gallon'

  private readonly customConversions: Record<string, number> = {
    'us-gallon': 3.785411784,
    'us-quart': 0.946352946,
    'us-pint': 0.473176473,
    'us-cup': 0.2365882365,
    'us-fluid-ounce': 0.0295735295625,
    'us-tablespoon': 0.01478676478125,
    'us-teaspoon': 0.00492892159375,
    'imperial-gallon': 4.54609,
    'imperial-quart': 1.1365225,
    'imperial-pint': 0.56826125,
    'imperial-fluid-ounce': 0.0284130625,
    'imperial-tablespoon': 0.0177581640625,
    'imperial-teaspoon': 0.00591938802083,
    'cubic-inch': 0.016387064,
    'cubic-foot': 28.316846592,
    'cubic-yard': 764.554857984,
    'barrel-oil': 158.987294928,
    'barrel-us': 119.240471196,
    'barrel-uk': 163.65924,
    'hectoliter': 100,
    'decaliter': 10,
    'deciliter': 0.1,
    'centiliter': 0.01
  }

  readonly units: ConversionUnit[] = [

    { id: 'cubic-meter', symbol: 'm³', name: 'Cubic Meter', category: 'volume' },
    { id: 'liter', symbol: 'L', name: 'Liter', category: 'volume' },
    { id: 'milliliter', symbol: 'mL', name: 'Milliliter', category: 'volume' },
    { id: 'microliter', symbol: 'µL', name: 'Microliter', category: 'volume' },
    { id: 'cubic-centimeter', symbol: 'cm³', name: 'Cubic Centimeter', category: 'volume' },
    { id: 'cubic-millimeter', symbol: 'mm³', name: 'Cubic Millimeter', category: 'volume' },

    { id: 'us-gallon', symbol: 'gal', name: 'US Gallon', category: 'volume' },
    { id: 'us-quart', symbol: 'qt', name: 'US Quart', category: 'volume' },
    { id: 'us-pint', symbol: 'pt', name: 'US Pint', category: 'volume' },
    { id: 'us-cup', symbol: 'cup', name: 'US Cup', category: 'volume' },
    { id: 'us-fluid-ounce', symbol: 'fl oz', name: 'US Fluid Ounce', category: 'volume' },
    { id: 'us-tablespoon', symbol: 'tbsp', name: 'US Tablespoon', category: 'volume' },
    { id: 'us-teaspoon', symbol: 'tsp', name: 'US Teaspoon', category: 'volume' },

    { id: 'imperial-gallon', symbol: 'gal', name: 'Imperial Gallon', category: 'volume' },
    { id: 'imperial-quart', symbol: 'qt', name: 'Imperial Quart', category: 'volume' },
    { id: 'imperial-pint', symbol: 'pt', name: 'Imperial Pint', category: 'volume' },
    { id: 'imperial-fluid-ounce', symbol: 'fl oz', name: 'Imperial Fluid Ounce', category: 'volume' },
    { id: 'imperial-tablespoon', symbol: 'tbsp', name: 'Imperial Tablespoon', category: 'volume' },
    { id: 'imperial-teaspoon', symbol: 'tsp', name: 'Imperial Teaspoon', category: 'volume' },

    { id: 'cubic-inch', symbol: 'in³', name: 'Cubic Inch', category: 'volume' },
    { id: 'cubic-foot', symbol: 'ft³', name: 'Cubic Foot', category: 'volume' },
    { id: 'cubic-yard', symbol: 'yd³', name: 'Cubic Yard', category: 'volume' },

    { id: 'barrel-oil', symbol: 'bbl', name: 'Oil Barrel', category: 'volume' },
    { id: 'barrel-us', symbol: 'bbl', name: 'US Barrel', category: 'volume' },
    { id: 'barrel-uk', symbol: 'bbl', name: 'UK Barrel', category: 'volume' },

    { id: 'hectoliter', symbol: 'hL', name: 'Hectoliter', category: 'volume' },
    { id: 'decaliter', symbol: 'daL', name: 'Decaliter', category: 'volume' },
    { id: 'deciliter', symbol: 'dL', name: 'Deciliter', category: 'volume' },
    { id: 'centiliter', symbol: 'cL', name: 'Centiliter', category: 'volume' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
      let liters: number
      if (this.customConversions[fromUnit]) {
        liters = value * this.customConversions[fromUnit]
      } else {
        const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
        liters = unit(value, mathJsFromUnit).to('L').toNumber()
      }

      if (this.customConversions[toUnit]) {
        return liters / this.customConversions[toUnit]
      } else {
        const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
        return unit(liters, 'L').to(mathJsToUnit).toNumber()
      }
    }

    const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
    const mathJsToUnit = getMathJsUnitName(toUnit, this.id)

    const mathUnit = unit(value, mathJsFromUnit)
    return mathUnit.to(mathJsToUnit).toNumber()
  }

  validateUnits(fromUnit: string, toUnit: string): boolean {
    return this.units.some(u => u.id === fromUnit) &&
            this.units.some(u => u.id === toUnit)
  }
}
