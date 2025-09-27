import {
  converter, formatHex, random, interpolate,
  nearest, colorsNamed, parse,
  filterBrightness, filterSaturate, filterHueRotate, filterContrast,
  wcagContrast, wcagLuminance,
  filterDeficiencyProt, filterDeficiencyDeuter, filterDeficiencyTrit
} from "culori";

import { RGB, HSL, HSV, OKLCH, LAB, ColorFormats } from "../types/color";
export type { RGB, HSL, HSV, OKLCH, LAB, ColorFormats };

const toRgb = converter("rgb");
const toHsl = converter("hsl");
const toHsv = converter("hsv");
const toOklch = converter("oklch");
const toLab = converter("lab");

const BLACK_RGB: RGB = { r: 0, g: 0, b: 0 };

// ---------- Helpers and type guards ----------
const fromCuloriRgb = (c: any): RGB => ({
  r: Math.round((c?.r ?? 0) * 255),
  g: Math.round((c?.g ?? 0) * 255),
  b: Math.round((c?.b ?? 0) * 255),
});

const tcRgb = (rgb: RGB) => ({
  r: clamp01(rgb.r / 255),
  g: clamp01(rgb.g / 255),
  b: clamp01(rgb.b / 255),
  mode: "rgb" as const,
});

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object";

const isRGB = (v: unknown): v is RGB =>
  isObject(v) && typeof v.r === "number" && typeof v.g === "number" && typeof v.b === "number";

const isHSL = (v: unknown): v is HSL =>
  isObject(v) && typeof v.h === "number" && typeof v.s === "number" && typeof v.l === "number";

const isHSV = (v: unknown): v is HSV =>
  isObject(v) && typeof v.h === "number" && typeof v.s === "number" && typeof v.v === "number";

const isOKLCH = (v: unknown): v is OKLCH =>
  isObject(v) && typeof v.l === "number" && typeof v.c === "number" && typeof v.h === "number";

const isLAB = (v: unknown): v is LAB =>
  isObject(v) && typeof v.l === "number" && typeof v.a === "number" && typeof v.b === "number";

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

// ---------- Conversions ----------
export function hexToRgb(hex: string): RGB {
  if (!HEX6.test(hex)) return BLACK_RGB;
  const color = toRgb(hex);
  return color ? fromCuloriRgb(color) : BLACK_RGB;
}

export function rgbToHex(rgb: RGB): string {
  return formatHex(tcRgb(rgb)) || "#000000";
}

export function rgbToHsl(rgb: RGB): HSL {
  const color = toHsl(tcRgb(rgb));
  return color
    ? { h: color.h ?? 0, s: (color.s ?? 0) * 100, l: (color.l ?? 0) * 100 }
    : { h: 0, s: 0, l: 0 };
}

export function hslToRgb(hsl: HSL): RGB {
  const color = toRgb({ h: hsl.h, s: hsl.s / 100, l: hsl.l / 100, mode: "hsl" as const });
  return color ? fromCuloriRgb(color) : BLACK_RGB;
}

export function rgbToHsv(rgb: RGB): HSV {
  const color = toHsv(tcRgb(rgb));
  return color
    ? { h: color.h ?? 0, s: (color.s ?? 0) * 100, v: (color.v ?? 0) * 100 }
    : { h: 0, s: 0, v: 0 };
}

export function hsvToRgb(hsv: HSV): RGB {
  const color = toRgb({ h: hsv.h, s: hsv.s / 100, v: hsv.v / 100, mode: "hsv" as const });
  return color ? fromCuloriRgb(color) : BLACK_RGB;
}

export function rgbToOklch(rgb: RGB): OKLCH {
  const color = toOklch(tcRgb(rgb));
  return color
    ? { l: (color.l ?? 0) * 100, c: (color.c ?? 0) * 100, h: color.h ?? 0 }
    : { l: 0, c: 0, h: 0 };
}

export function oklchToRgb(oklch: OKLCH): RGB {
  const color = toRgb({ l: oklch.l / 100, c: oklch.c / 100, h: oklch.h, mode: "oklch" as const });
  return color ? fromCuloriRgb(color) : BLACK_RGB;
}

export function rgbToLab(rgb: RGB): LAB {
  const color = toLab(tcRgb(rgb));
  return color
    ? { l: (color.l ?? 0) * 100, a: (color.a ?? 0) * 100, b: (color.b ?? 0) * 100 }
    : { l: 0, a: 0, b: 0 };
}

export function labToRgb(lab: LAB): RGB {
  const color = toRgb({ l: lab.l / 100, a: lab.a / 100, b: lab.b / 100, mode: "lab" as const });
  return color ? fromCuloriRgb(color) : BLACK_RGB;
}

export function convertColor(input: string | RGB | HSL | HSV | OKLCH | LAB): ColorFormats {
  let culoriColor: any = null;

  if (typeof input === "string") {
    const parsed = parse(input);
    culoriColor = parsed ?? tcRgb(BLACK_RGB);
  } else if (isRGB(input)) {
    culoriColor = tcRgb(input);
  } else if (isHSL(input)) {
    culoriColor = { h: input.h, s: input.s / 100, l: input.l / 100, mode: "hsl" as const };
  } else if (isHSV(input)) {
    culoriColor = { h: input.h, s: input.s / 100, v: input.v / 100, mode: "hsv" as const };
  } else if (isOKLCH(input)) {
    culoriColor = { l: input.l / 100, c: input.c / 100, h: input.h, mode: "oklch" as const };
  } else if (isLAB(input)) {
    culoriColor = { l: input.l / 100, a: input.a / 100, b: input.b / 100, mode: "lab" as const };
  } else {
    culoriColor = tcRgb(BLACK_RGB);
  }

  const rgb = toRgb(culoriColor) ?? { r: 0, g: 0, b: 0 };
  const hsl = toHsl(culoriColor) ?? { h: 0, s: 0, l: 0 };
  const hsv = toHsv(culoriColor) ?? { h: 0, s: 0, v: 0 };
  const oklch = toOklch(culoriColor) ?? { l: 0, c: 0, h: 0 };
  const lab = toLab(culoriColor) ?? { l: 0, a: 0, b: 0 };

  return {
    hex: formatHex(tcRgb(fromCuloriRgb(rgb))) || "#000000",
    rgb: fromCuloriRgb(rgb),
    hsl: { h: hsl.h ?? 0, s: (hsl.s ?? 0) * 100, l: (hsl.l ?? 0) * 100 },
    hsv: { h: hsv.h ?? 0, s: (hsv.s ?? 0) * 100, v: (hsv.v ?? 0) * 100 },
    oklch: { l: (oklch.l ?? 0) * 100, c: (oklch.c ?? 0) * 100, h: oklch.h ?? 0 },
    lab: { l: (lab.l ?? 0) * 100, a: (lab.a ?? 0) * 100, b: (lab.b ?? 0) * 100 },
  };
}

// ---------- Adjustments ----------
export function adjustBrightness(rgb: RGB, amount: number): RGB {
  const out = filterBrightness(amount)(tcRgb(rgb));
  return fromCuloriRgb(out);
}

export function adjustSaturation(rgb: RGB, factor: number): RGB {
  const out = filterSaturate(factor)(tcRgb(rgb));
  return fromCuloriRgb(out);
}

export function adjustHue(rgb: RGB, degrees: number): RGB {
  const out = filterHueRotate(degrees)(tcRgb(rgb));
  return fromCuloriRgb(out);
}

export function adjustContrast(rgb: RGB, factor: number): RGB {
  const out = filterContrast(factor)(tcRgb(rgb));
  return fromCuloriRgb(out);
}

// ---------- Harmonies ----------
export function generateComplementary(rgb: RGB): RGB {
  return adjustHue(rgb, 180);
}

export function generateTriadic(rgb: RGB): RGB[] {
  return [rgb, adjustHue(rgb, 120), adjustHue(rgb, 240)];
}

export function generateAnalogous(rgb: RGB): RGB[] {
  return [adjustHue(rgb, -30), rgb, adjustHue(rgb, 30)];
}

export function generateMonochromatic(rgb: RGB): RGB[] {
  const hsl = rgbToHsl(rgb);
  const variations = [
    Math.max(0, hsl.l - 40),
    Math.max(0, hsl.l - 20),
    hsl.l,
    Math.min(100, hsl.l + 20),
    Math.min(100, hsl.l + 40),
  ];
  return variations.map((l) => hslToRgb({ ...hsl, l }));
}

// ---------- Color blindness simulation ----------
export function simulateColorBlindness(
  rgb: RGB,
  type: "protanopia" | "deuteranopia" | "tritanopia"
): RGB {
  const base = tcRgb(rgb);
  let simulated: any;
  if (type === "protanopia") simulated = filterDeficiencyProt(1)(base);
  else if (type === "deuteranopia") simulated = filterDeficiencyDeuter(1)(base);
  else if (type === "tritanopia") simulated = filterDeficiencyTrit(1)(base);
  return simulated ? fromCuloriRgb(simulated) : rgb;
}

// ---------- Contrast and luminance ----------
export function getContrastRatio(color1: RGB, color2: RGB): number {
  return wcagContrast(tcRgb(color1), tcRgb(color2)) ?? 1;
}

export function getLuminance(rgb: RGB): number {
  return wcagLuminance(tcRgb(rgb)) ?? 0;
}

// ---------- Color name approximation (optimized, cached) ----------
type CuloriRgb = { r: number; g: number; b: number; mode: 'rgb' };

const NAMED_COLOR_ENTRIES: Array<[string, CuloriRgb]> = Object.entries(colorsNamed).map(
  ([name, value]) => {
    const hex = '#' + value.toString(16).padStart(6, '0');
    return [name, toRgb(hex) as CuloriRgb];
  }
);

const NAMED_COLOR_MAP = new Map<string, CuloriRgb>(NAMED_COLOR_ENTRIES);
const NAMED_COLOR_NAMES = NAMED_COLOR_ENTRIES.map(([name]) => name);

const resolveNearestName = nearest(
  NAMED_COLOR_NAMES,
  undefined,
  (name: string) => NAMED_COLOR_MAP.get(name)!
);

export function getColorName(rgb: RGB | undefined | null): string {
  if (!rgb) return 'Unknown';
  try {
    const result = resolveNearestName(tcRgb(rgb), 1);
    return result?.[0] ?? 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// ---------- Mixing ----------
export function mixColors(color1: RGB, color2: RGB, ratio: number): RGB {
  const t = Math.max(0, Math.min(1, ratio));
  const interpolator = interpolate([tcRgb(color1), tcRgb(color2)], "rgb");
  const mixed = interpolator(t);
  return mixed ? fromCuloriRgb(mixed) : color1;
}

// ---------- Temperature (simple hue shift) ----------
export function adjustTemperature(rgb: RGB, kelvinDelta: number): RGB {
  const hueShift = kelvinDelta > 0 ? 15 : -15;
  return adjustHue(rgb, hueShift);
}

// ---------- Random ----------
export function generateRandomColor(): RGB {
  return fromCuloriRgb(random());
}

// ---------- Invert / Grayscale ----------
export function invertColor(rgb: RGB): RGB {
  return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
}

export function toGrayscale(rgb: RGB): RGB {
  const lum = Math.round(rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
  return { r: lum, g: lum, b: lum };
}

// ---------- Utilities ----------
export function clampRgbValues(rgb: RGB): RGB {
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b))),
  };
}

export function isDarkColor(rgb: RGB): boolean {
  return getLuminance(rgb) < 0.5;
}

export function getReadableTextColor(backgroundColor: RGB): RGB {
  return isDarkColor(backgroundColor) ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
}
