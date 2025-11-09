import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { ConverterConstants } from '../../lib/constants'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class CssUnitsConverter extends BaseConverter {
  readonly id: ConverterType = 'css-units'
  readonly name = 'CSS Units Converter'
  readonly description = 'Convert between CSS length units including relative and advanced units'
  readonly icon = 'code'
  readonly defaultFromUnit = 'px'
  readonly defaultToUnit = 'rem'
  readonly canonicalUnit = 'rem'

  private baseFontSize: number = ConverterConstants.DEFAULT_BASE_FONT_SIZE

  private readonly toPixelsFactors: Record<string, () => number> = {

    rem: () => this.baseFontSize,
    em: () => this.baseFontSize,
    ex: () => this.baseFontSize * 0.5,
    ch: () => this.baseFontSize * 0.6,
    lh: () => this.baseFontSize * 1.2,
    rlh: () => this.baseFontSize * 1.2,
    cap: () => this.baseFontSize * 0.7,
    ic: () => this.baseFontSize,
    ric: () => this.baseFontSize,

    vh: () => ConverterConstants.DEFAULT_VIEWPORT_HEIGHT / 100,
    vw: () => ConverterConstants.DEFAULT_VIEWPORT_WIDTH / 100,
    vmin: () => Math.min(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,
    vmax: () => Math.max(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,
    vb: () => ConverterConstants.DEFAULT_VIEWPORT_HEIGHT / 100,
    vi: () => ConverterConstants.DEFAULT_VIEWPORT_WIDTH / 100,

    svh: () => ConverterConstants.DEFAULT_VIEWPORT_HEIGHT / 100,
    svw: () => ConverterConstants.DEFAULT_VIEWPORT_WIDTH / 100,
    svmin: () => Math.min(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,
    svmax: () => Math.max(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,

    lvh: () => ConverterConstants.DEFAULT_VIEWPORT_HEIGHT / 100,
    lvw: () => ConverterConstants.DEFAULT_VIEWPORT_WIDTH / 100,
    lvmin: () => Math.min(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,
    lvmax: () => Math.max(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,

    dvh: () => ConverterConstants.DEFAULT_VIEWPORT_HEIGHT / 100,
    dvw: () => ConverterConstants.DEFAULT_VIEWPORT_WIDTH / 100,
    dvmin: () => Math.min(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100,
    dvmax: () => Math.max(ConverterConstants.DEFAULT_VIEWPORT_WIDTH, ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) / 100
  }

  readonly units: ConversionUnit[] = [

    { id: 'px', symbol: 'px', name: 'Pixels', category: 'css-units' },
    { id: 'pt', symbol: 'pt', name: 'Points', category: 'css-units' },
    { id: 'pc', symbol: 'pc', name: 'Picas', category: 'css-units' },
    { id: 'cm', symbol: 'cm', name: 'Centimeters', category: 'css-units' },
    { id: 'mm', symbol: 'mm', name: 'Millimeters', category: 'css-units' },
    { id: 'in', symbol: 'in', name: 'Inches', category: 'css-units' },

    { id: 'rem', symbol: 'rem', name: 'Root EM', category: 'css-units' },
    { id: 'em', symbol: 'em', name: 'EM', category: 'css-units' },
    { id: 'ex', symbol: 'ex', name: 'X-height', category: 'css-units' },
    { id: 'ch', symbol: 'ch', name: 'Character Width', category: 'css-units' },
    { id: 'lh', symbol: 'lh', name: 'Line Height', category: 'css-units' },
    { id: 'rlh', symbol: 'rlh', name: 'Root Line Height', category: 'css-units' },
    { id: 'cap', symbol: 'cap', name: 'Capital Letter Height', category: 'css-units' },
    { id: 'ic', symbol: 'ic', name: 'Ideographic Character', category: 'css-units' },
    { id: 'ric', symbol: 'ric', name: 'Root Ideographic Character', category: 'css-units' },

    { id: 'vh', symbol: 'vh', name: 'Viewport Height', category: 'css-units' },
    { id: 'vw', symbol: 'vw', name: 'Viewport Width', category: 'css-units' },
    { id: 'vmin', symbol: 'vmin', name: 'Viewport Minimum', category: 'css-units' },
    { id: 'vmax', symbol: 'vmax', name: 'Viewport Maximum', category: 'css-units' },
    { id: 'vb', symbol: 'vb', name: 'Viewport Block', category: 'css-units' },
    { id: 'vi', symbol: 'vi', name: 'Viewport Inline', category: 'css-units' },

    { id: 'svh', symbol: 'svh', name: 'Small Viewport Height', category: 'css-units' },
    { id: 'svw', symbol: 'svw', name: 'Small Viewport Width', category: 'css-units' },
    { id: 'svmin', symbol: 'svmin', name: 'Small Viewport Minimum', category: 'css-units' },
    { id: 'svmax', symbol: 'svmax', name: 'Small Viewport Maximum', category: 'css-units' },

    { id: 'lvh', symbol: 'lvh', name: 'Large Viewport Height', category: 'css-units' },
    { id: 'lvw', symbol: 'lvw', name: 'Large Viewport Width', category: 'css-units' },
    { id: 'lvmin', symbol: 'lvmin', name: 'Large Viewport Minimum', category: 'css-units' },
    { id: 'lvmax', symbol: 'lvmax', name: 'Large Viewport Maximum', category: 'css-units' },

    { id: 'dvh', symbol: 'dvh', name: 'Dynamic Viewport Height', category: 'css-units' },
    { id: 'dvw', symbol: 'dvw', name: 'Dynamic Viewport Width', category: 'css-units' },
    { id: 'dvmin', symbol: 'dvmin', name: 'Dynamic Viewport Minimum', category: 'css-units' },
    { id: 'dvmax', symbol: 'dvmax', name: 'Dynamic Viewport Maximum', category: 'css-units' }
  ]

  setBaseFontSize(size: number): void {
    this.baseFontSize = Math.max(
      ConverterConstants.MIN_BASE_FONT_SIZE,
      Math.min(ConverterConstants.MAX_BASE_FONT_SIZE, size)
    )
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (this.toPixelsFactors[fromUnit] || this.toPixelsFactors[toUnit]) {
      return this.convertRelativeUnits(value, fromUnit, toUnit)
    }

    const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
    const mathJsToUnit = getMathJsUnitName(toUnit, this.id)

    const mathUnit = unit(value, mathJsFromUnit)
    return mathUnit.to(mathJsToUnit).toNumber()
  }

  private convertRelativeUnits(value: number, fromUnit: string, toUnit: string): number {
    const toPixelsFactor = this.toPixelsFactors[fromUnit]
    const pixels = toPixelsFactor ? value * toPixelsFactor() : value

    const fromPixelsFactor = this.toPixelsFactors[toUnit]
    return fromPixelsFactor ? pixels / fromPixelsFactor() : pixels
  }
}
