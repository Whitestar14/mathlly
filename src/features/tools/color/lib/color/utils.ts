// src/features/tools/color/composables/utils.ts
import { RGB, RGBA } from "./types"
import { clamp255 } from "./converters"

export function invertColor(rgb: RGB): RGB {
  return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b }
}
export function toGrayscale(rgb: RGB): RGB {
  const lum = Math.round(rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114)
  return { r: lum, g: lum, b: lum }
}
export function clampRgbaValues<T extends RGB | RGBA>(rgba: T): T {
    const clampedRgb: RGB = {
        r: clamp255(rgba.r),
        g: clamp255(rgba.g),
        b: clamp255(rgba.b),
    };

    if ('a' in rgba) {
        return {
            ...clampedRgb,
            a: clamp255(rgba.a),
        } as T;
    }

    return clampedRgb as T;
}
export function isValidRGBA(color: any): color is RGBA {
  return (
    typeof color === 'object' &&
    color !== null &&
    typeof color.r === 'number' && color.r >= 0 && color.r <= 255 &&
    typeof color.g === 'number' && color.g >= 0 && color.g <= 255 &&
    typeof color.b === 'number' && color.b >= 0 && color.b <= 255 &&
    (color.a === undefined || (typeof color.a === 'number' && color.a >= 0 && color.a <= 1))
  );
};
