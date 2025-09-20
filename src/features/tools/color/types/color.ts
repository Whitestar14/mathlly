export type RGB = { r: number; g: number; b: number };
export type CMYK = { c: number; m: number; y: number; k: number };
export type Hex = string;

export type ColorResult = {
  hex?: Hex;
  rgb?: RGB;
  cmyk?: CMYK;
  oklch?: { l: number; c: number; h: number } | null;
};
