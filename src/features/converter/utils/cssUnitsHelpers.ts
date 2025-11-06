/**
 * Utility functions specific to CSS units conversion.
 */

/**
 * Validates that base font size is within reasonable bounds (4-128 pixels).
 * @param size - The base font size in pixels.
 * @returns True if valid, false otherwise.
 */
export function validateBaseFontSize(size: number): boolean {
  return size >= 4 && size <= 128;
}

/**
 * Returns an array of common base font sizes for quick selection in UI.
 * @returns Array of common base font sizes.
 */
export function getCommonBaseFontSizes(): number[] {
  return [12, 14, 16, 18, 20, 24];
}

/**
 * Formats a CSS value with its unit for display.
 * Handles special formatting for percent (adds '%' symbol).
 * @param value - The numeric value.
 * @param unit - The unit string (e.g., 'px', 'rem', 'percent').
 * @returns Formatted string like '16px', '1rem', '100%'.
 */
export function formatCssValue(value: number, unit: string): string {
  if (unit === 'percent') {
    return `${value}%`;
  }
  return `${value}${unit}`;
}

/**
 * Parses CSS value strings like '16px', '1.5rem', '100%'.
 * Returns object with value and unit, or null if parsing fails.
 * Handles percent symbol by converting to 'percent' unit ID.
 * @param input - The input string to parse.
 * @returns Object with value and unit, or null.
 */
export function parseCssValue(input: string): { value: number; unit: string } | null {
  const trimmed = input.trim();
  // Match number followed by optional space and unit, or % for percent
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(%|px|rem|em|vh|vw|pt|cm|mm|in)?$/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (isNaN(value)) return null;
  const unitSymbol = match[2];
  let unit = unitSymbol;
  if (unitSymbol === '%') {
    unit = 'percent';
  }
  return { value, unit: unit || 'px' }; // Default to px if no unit
}

/**
 * Returns current viewport dimensions using window.innerWidth and window.innerHeight.
 * Falls back to default dimensions (1920×1080) if window is not available (SSR).
 * @returns Object with width and height.
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return {
    width: 1920,
    height: 1080,
  };
}

/**
 * Checks if a unit is relative (rem, em, percent).
 * @param unitId - The unit ID to check.
 * @returns True if relative, false otherwise.
 */
export function isRelativeUnit(unitId: string): boolean {
  return ['rem', 'em', 'percent'].includes(unitId);
}

/**
 * Checks if a unit is viewport-based (vh, vw).
 * @param unitId - The unit ID to check.
 * @returns True if viewport-based, false otherwise.
 */
export function isViewportUnit(unitId: string): boolean {
  return ['vh', 'vw'].includes(unitId);
}