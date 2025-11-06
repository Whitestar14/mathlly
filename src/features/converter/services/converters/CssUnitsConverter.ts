import { unit } from 'mathjs'
import { BaseConverter } from './BaseConverter'
import { ConversionUnit, ConverterType } from '../../types'
import { ConverterConstants } from '../../lib/constants'
import { getMathJsUnitName } from '../../utils/unitHelpers'

export class CssUnitsConverter extends BaseConverter {
    readonly id: ConverterType = 'css-units'
    readonly name = 'CSS Units Converter'
    readonly description = 'Convert between CSS length units including relative units'
    readonly icon = 'code'
    readonly defaultFromUnit = 'px'
    readonly defaultToUnit = 'rem'

    private baseFontSize = ConverterConstants.DEFAULT_BASE_FONT_SIZE

    readonly units: ConversionUnit[] = [
        { id: 'px', symbol: 'px', name: 'Pixels', category: 'css-units' },
        { id: 'pt', symbol: 'pt', name: 'Points', category: 'css-units' },
        { id: 'cm', symbol: 'cm', name: 'Centimeters', category: 'css-units' },
        { id: 'mm', symbol: 'mm', name: 'Millimeters', category: 'css-units' },
        { id: 'in', symbol: 'in', name: 'Inches', category: 'css-units' },
        { id: 'rem', symbol: 'rem', name: 'Root EM', category: 'css-units' },
        { id: 'em', symbol: 'em', name: 'EM', category: 'css-units' },
        { id: 'vh', symbol: 'vh', name: 'Viewport Height', category: 'css-units' },
        { id: 'vw', symbol: 'vw', name: 'Viewport Width', category: 'css-units' }
    ]

    setBaseFontSize(size: number): void {
        this.baseFontSize = Math.max(
            ConverterConstants.MIN_BASE_FONT_SIZE,
            Math.min(ConverterConstants.MAX_BASE_FONT_SIZE, size)
        )
    }

    convert(value: number, fromUnit: string, toUnit: string): number {
        // Handle relative units (rem, em) and viewport units (vh, vw)
        if (['rem', 'em', 'vh', 'vw'].includes(fromUnit) || ['rem', 'em', 'vh', 'vw'].includes(toUnit)) {
            return this.convertRelativeUnits(value, fromUnit, toUnit)
        }

        // Use math.js for absolute units
        const mathJsFromUnit = getMathJsUnitName(fromUnit, this.id)
        const mathJsToUnit = getMathJsUnitName(toUnit, this.id)

        const mathUnit = unit(value, mathJsFromUnit)
        return mathUnit.to(mathJsToUnit).toNumber()
    }

    private convertRelativeUnits(value: number, fromUnit: string, toUnit: string): number {
        // Convert to pixels first, then to target unit
        let pixels: number

        switch (fromUnit) {
            case 'rem':
                pixels = value * this.baseFontSize
                break
            case 'em':
                pixels = value * this.baseFontSize // Assuming 1em = base font size for simplicity
                break
            case 'vh':
                pixels = (value / 100) * ConverterConstants.DEFAULT_VIEWPORT_HEIGHT
                break
            case 'vw':
                pixels = (value / 100) * ConverterConstants.DEFAULT_VIEWPORT_WIDTH
                break
            default:
                pixels = value
        }

        // Convert from pixels to target unit
        switch (toUnit) {
            case 'rem':
                return pixels / this.baseFontSize
            case 'em':
                return pixels / this.baseFontSize
            case 'vh':
                return (pixels / ConverterConstants.DEFAULT_VIEWPORT_HEIGHT) * 100
            case 'vw':
                return (pixels / ConverterConstants.DEFAULT_VIEWPORT_WIDTH) * 100
            default:
                return pixels
        }
    }

    validateUnits(fromUnit: string, toUnit: string): boolean {
        return this.units.some(u => u.id === fromUnit) &&
            this.units.some(u => u.id === toUnit)
    }
}
