import type { RGB, RGBA } from '@color/lib/color'
import { rgbToHex } from '@color/lib/color'
import { exportJSON } from '@shared/utils/object/exportJSON'

/**
 * Union type for supported export formats. Extensible for future additions like CSS or SVG.
 */
type ExportFormat = 'json' | 'css' | 'svg'

/**
 * Interface for export options. Currently used for future extensibility.
 */
export interface ExportOptions {
  format: ExportFormat
  filename?: string
  data: any
  metadata?: Record<string, any>
}

/**
 * Function to export color harmony data as JSON.
 * @param harmonyType - The type of harmony (e.g., 'complementary').
 * @param baseColor - The base RGB color.
 * @param colors - Array of RGB colors in the harmony.
 */
function exportHarmonyColors(harmonyType: string, baseColor: RGB, colors: RGB[]) {
  const data = {
    harmonyType,
    baseColor: rgbToHex(baseColor),
    colors: colors.map(rgbToHex),
    count: colors.length,
  }
  const filename = `harmony-${harmonyType}-${Date.now()}.json`
  exportJSON(data, filename, { type: 'color-harmony' })
}

/**
 * Function to export gradient color data as JSON. For future use.
 * @param start - The starting RGB color of the gradient, with optional alpha.
 * @param end - The ending RGB color of the gradient, with optional alpha.
 * @param steps - The number of steps in the gradient.
 * @param angle - The angle of the gradient.
 * @param colors - Array of RGB colors in the gradient, each with optional alpha.
 */
function exportGradientColors(start: RGB & { a?: number }, end: RGB & { a?: number }, steps: number, angle: number, colors: (RGB & { a?: number })[]) {
  const data = {
    start: rgbToHex(start),
    end: rgbToHex(end),
    startAlpha: start.a ?? 1,
    endAlpha: end.a ?? 1,
    steps,
    angle,
    colors: colors.map(color => {
      const a = color.a ?? 1
      return a !== 1 ? `rgba(${color.r}, ${color.g}, ${color.b}, ${a})` : rgbToHex(color)
    }),
    count: colors.length,
  }
  const filename = `gradient-${Date.now()}.json`
  exportJSON(data, filename, { type: 'color-gradient' })
}

/**
 * Composable for color export functionality.
 * Provides functions for exporting colors in various formats.
 * Extensible to support additional formats like CSS or SVG in the future.
 * @returns Object containing export functions.
 */
export function useColorExport() {
  return {
    exportJSON,
    exportHarmonyColors,
    exportGradientColors,
  }
}
