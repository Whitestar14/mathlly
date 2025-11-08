import type { ConverterType } from '@converter/types'
import { TemperatureConverter } from '../converters/TemperatureConverter'
import { LengthConverter } from '../converters/LengthConverter'
import { WeightConverter } from '../converters/WeightConverter'
import { CurrencyConverter } from '../converters/CurrencyConverter'
import { CssUnitsConverter } from '../converters/CssUnitsConverter'
import { VolumeConverter } from '../converters/VolumeConverter'
import { DataConverter } from '../converters/DataConverter'
import { AreaConverter } from '../converters/AreaConverter'
import { EnergyConverter } from '../converters/EnergyConverter'
import { SpeedConverter } from '../converters/SpeedConverter'
import { TimeConverter } from '../converters/TimeConverter'
import { PowerConverter } from '../converters/PowerConverter'
import { PressureConverter } from '../converters/PressureConverter'
import { AngleConverter } from '../converters/AngleConverter'
import type { BaseConverter } from '../converters/BaseConverter'

export class ConverterFactory {
  private static readonly converterRegistry: Record<ConverterType, new () => BaseConverter> = {
    temperature: TemperatureConverter,
    length: LengthConverter,
    weight: WeightConverter,
    currency: CurrencyConverter,
    'css-units': CssUnitsConverter,
    volume: VolumeConverter,
    data: DataConverter,
    area: AreaConverter,
    energy: EnergyConverter,
    speed: SpeedConverter,
    time: TimeConverter,
    power: PowerConverter,
    pressure: PressureConverter,
    angle: AngleConverter
  }

  static create(type: ConverterType): BaseConverter {
    const ConverterClass = this.converterRegistry[type]
    if (!ConverterClass) {
      throw new Error(`Unsupported converter type: ${type}`)
    }
    return new ConverterClass()
  }

  static getAvailableTypes(): ConverterType[] {
    return Object.keys(this.converterRegistry) as ConverterType[]
  }

  static getConverterInfo(type: ConverterType) {
    const converter = this.create(type)
    return {
      id: converter.id,
      name: converter.name,
      description: converter.description,
      icon: converter.icon
    }
  }
}
