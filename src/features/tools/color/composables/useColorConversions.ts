import type { RGB, CMYK, Hex, ColorResult } from '../types/color';

function hexToRgb(hex: Hex): RGB | null {
  const cleaned = hex.replace(/^#/, '').trim();
  if (![3, 6].includes(cleaned.length)) return null;
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex({ r, g, b }: RGB): Hex {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 1 };

  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return { c, m, y, k };
}

function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return { r, g, b };
}

export function useColorConversions() {
  function parseHex(input: string): ColorResult {
    const rgb = hexToRgb(input);
    if (!rgb) return { hex: input };
    return {
      hex: rgbToHex(rgb),
      rgb,
      cmyk: rgbToCmyk(rgb),
      oklch: null,
    };
  }

  function fromRgb(rgb: RGB): ColorResult {
    return {
      rgb,
      hex: rgbToHex(rgb),
      cmyk: rgbToCmyk(rgb),
      oklch: null,
    };
  }

  return {
    hexToRgb,
    rgbToHex,
    rgbToCmyk,
    cmykToRgb,
    parseHex,
    fromRgb,
  };
}
