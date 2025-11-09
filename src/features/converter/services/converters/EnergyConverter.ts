import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'

export class EnergyConverter extends BaseConverter {
  readonly id: ConverterType = 'energy'
  readonly name = 'Energy Converter'
  readonly description = 'Convert between energy and work units'
  readonly icon = 'zap'
  readonly defaultFromUnit = 'joule'
  readonly defaultToUnit = 'kilocalorie'
  protected readonly canonicalUnit: string = 'J'

  protected readonly customConversions: Record<string, number> = {
    'megawatt-hour': 3_600_000_000
  }

  readonly units: ConversionUnit[] = [
    { id: 'joule', symbol: 'J', name: 'Joule', category: 'energy' },
    { id: 'kilojoule', symbol: 'kJ', name: 'Kilojoule', category: 'energy' },
    { id: 'megajoule', symbol: 'MJ', name: 'Megajoule', category: 'energy' },
    { id: 'gigajoule', symbol: 'GJ', name: 'Gigajoule', category: 'energy' },

    { id: 'calorie', symbol: 'cal', name: 'Calorie', category: 'energy' },
    { id: 'kilocalorie', symbol: 'kcal', name: 'Kilocalorie', category: 'energy' },

    { id: 'watt-hour', symbol: 'Wh', name: 'Watt Hour', category: 'energy' },
    { id: 'kilowatt-hour', symbol: 'kWh', name: 'Kilowatt Hour', category: 'energy' },
    { id: 'megawatt-hour', symbol: 'MWh', name: 'Megawatt Hour', category: 'energy' },

    { id: 'british-thermal-unit', symbol: 'BTU', name: 'British Thermal Unit', category: 'energy' },
    { id: 'foot-pound', symbol: 'ft⋅lb', name: 'Foot Pound', category: 'energy' },
    { id: 'erg', symbol: 'erg', name: 'Erg', category: 'energy' },
    { id: 'electronvolt', symbol: 'eV', name: 'Electronvolt', category: 'energy' }
  ]
}
