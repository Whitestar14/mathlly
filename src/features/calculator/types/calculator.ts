// Calculator-specific option types
export interface CalculatorOptions {
  defaultMode: 'Standard' | 'Scientific' | 'Programmer';
  precision: number;
  useFractions: boolean;
  syntaxHighlighting: boolean;
  useThousandsSeparator: boolean;
  formatBinary: boolean;
  formatHexadecimal: boolean;
  formatOctal: boolean;
  angleUnit: 'degrees' | 'radians' | 'gradians';
  notationMode: 'standard' | 'scientific' | 'engineering';
  hyperbolicMode: boolean;
}
