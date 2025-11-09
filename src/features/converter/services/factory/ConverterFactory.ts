import type { ConverterType } from '@converter/types'
import { TemperatureConverter, LengthConverter, WeightConverter, CurrencyConverter, CssUnitsConverter, VolumeConverter, DataConverter, EnergyConverter, SpeedConverter, AngleConverter, AreaConverter, TimeConverter, PowerConverter, PressureConverter } from '../converters'
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
