
export interface CalculatorOptions {
  defaultMode: 'Standard' | 'Scientific' | 'Programmer';
  precision: number;
  useFractions: boolean;
  syntaxHighlighting: boolean;
  hapticFeedback: boolean;
  useThousandsSeparator: boolean;
  formatProgrammerNumbers: boolean;
  angleUnit: 'degrees' | 'radians' | 'gradians';
  notationMode: 'standard' | 'scientific' | 'engineering';
  hyperbolicMode: boolean;
}
