import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class DataConverter extends BaseConverter {
  readonly id: ConverterType = 'data'
  readonly name = 'Data Size Converter'
  readonly description = 'Convert between data size units'
  readonly icon = 'hard-drive'
  readonly defaultFromUnit = 'megabyte'
  readonly defaultToUnit = 'gigabyte'

  private readonly customConversions: Record<string, number> = {

    bit: 0.125, // 1 bit = 0.125 bytes
    kilobit: 0.125 * 1000,
    megabit: 0.125 * 1000000, // 0.125 * 1000 * 1000
    gigabit: 0.125 * 1000000000, // 0.125 * 1000 * 1000 * 1000
    terabit: 0.125 * 1000000000000, // 0.125 * 1000 * 1000 * 1000 * 1000
    petabit: 0.125 * 1000000000000000, // 0.125 * 1000 * 1000 * 1000 * 1000 * 1000

    kibibyte: 1024,
    mebibyte: 1048576, // 1024 * 1024
    gibibyte: 1073741824, // 1024 * 1024 * 1024
    tebibyte: 1099511627776, // 1024 * 1024 * 1024 * 1024
    pebibyte: 1125899906842624, // 1024 * 1024 * 1024 * 1024 * 1024
    exbibyte: 1152921504606846976, // 1024 * 1024 * 1024 * 1024 * 1024 * 1024

    kibibit: 128, // 1024 bits = 128 bytes
    mebibit: 131072, // 128 * 1024
    gibibit: 134217728, // 128 * 1024 * 1024
    tebibit: 137438953472, // 128 * 1024 * 1024 * 1024
    pebibit: 140737488355328 // 128 * 1024 * 1024 * 1024 * 1024
  }

  readonly units: ConversionUnit[] = [

    { id: 'bit', symbol: 'bit', name: 'Bit', category: 'data' },
    { id: 'kilobit', symbol: 'kbit', name: 'Kilobit', category: 'data' },
    { id: 'megabit', symbol: 'Mbit', name: 'Megabit', category: 'data' },
    { id: 'gigabit', symbol: 'Gbit', name: 'Gigabit', category: 'data' },
    { id: 'terabit', symbol: 'Tbit', name: 'Terabit', category: 'data' },
    { id: 'petabit', symbol: 'Pbit', name: 'Petabit', category: 'data' },

    { id: 'byte', symbol: 'B', name: 'Byte', category: 'data' },
    { id: 'kilobyte', symbol: 'KB', name: 'Kilobyte', category: 'data' },
    { id: 'megabyte', symbol: 'MB', name: 'Megabyte', category: 'data' },
    { id: 'gigabyte', symbol: 'GB', name: 'Gigabyte', category: 'data' },
    { id: 'terabyte', symbol: 'TB', name: 'Terabyte', category: 'data' },
    { id: 'petabyte', symbol: 'PB', name: 'Petabyte', category: 'data' },
    { id: 'exabyte', symbol: 'EB', name: 'Exabyte', category: 'data' },

    { id: 'kibibyte', symbol: 'KiB', name: 'Kibibyte', category: 'data' },
    { id: 'mebibyte', symbol: 'MiB', name: 'Mebibyte', category: 'data' },
    { id: 'gibibyte', symbol: 'GiB', name: 'Gibibyte', category: 'data' },
    { id: 'tebibyte', symbol: 'TiB', name: 'Tebibyte', category: 'data' },
    { id: 'pebibyte', symbol: 'PiB', name: 'Pebibyte', category: 'data' },
    { id: 'exbibyte', symbol: 'EiB', name: 'Exbibyte', category: 'data' },

    { id: 'kibibit', symbol: 'Kibit', name: 'Kibibit', category: 'data' },
    { id: 'mebibit', symbol: 'Mibit', name: 'Mebibit', category: 'data' },
    { id: 'gibibit', symbol: 'Gibit', name: 'Gibibit', category: 'data' },
    { id: 'tebibit', symbol: 'Tibit', name: 'Tebibit', category: 'data' },
    { id: 'pebibit', symbol: 'Pibit', name: 'Pebibit', category: 'data' }
  ]

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (this.customConversions[fromUnit] || this.customConversions[toUnit]) {
      let bytes: number
      if (this.customConversions[fromUnit]) {
        bytes = value * this.customConversions[fromUnit]
      } else {
        const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
        bytes = unit(value, mathJsFromUnit).to('byte').toNumber()
      }

      if (this.customConversions[toUnit]) {
        return bytes / this.customConversions[toUnit]
      } else {
        const mathJsToUnit = getMathJsUnitName(toUnit, this.id)
        return unit(bytes, 'byte').to(mathJsToUnit).toNumber()
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
