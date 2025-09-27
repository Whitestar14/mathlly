
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export interface ColorFormats {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  oklch: OKLCH;
  lab: LAB;
}
