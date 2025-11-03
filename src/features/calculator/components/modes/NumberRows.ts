import { markRaw } from 'vue'
import { Delete, ChevronsRightIcon, ChevronsLeftIcon } from 'lucide-vue-next'

export interface ButtonConfig {
  value: string;
  variant: 'number' | 'operator' | 'function' | 'memory';
  display?: string;
  icon?: any;
  checkMaxLength?: boolean;
}

export const numberRows = markRaw<ButtonConfig[][]>([

  [
    { value: '7', variant: 'number', checkMaxLength: true },
    { value: '8', variant: 'number', checkMaxLength: true },
    { value: '9', variant: 'number', checkMaxLength: true },
    { value: '×', variant: 'operator', checkMaxLength: true }
  ],

  [
    { value: '4', variant: 'number', checkMaxLength: true },
    { value: '5', variant: 'number', checkMaxLength: true },
    { value: '6', variant: 'number', checkMaxLength: true },
    { value: '-', variant: 'operator', checkMaxLength: true }
  ],

  [
    { value: '1', variant: 'number', checkMaxLength: true },
    { value: '2', variant: 'number', checkMaxLength: true },
    { value: '3', variant: 'number', checkMaxLength: true },
    { value: '+', variant: 'operator', checkMaxLength: true }
  ],

  [
    { value: '±', variant: 'function', checkMaxLength: true },
    { value: '0', variant: 'number', checkMaxLength: true },
    { value: '.', variant: 'number', checkMaxLength: true },
    { value: '=', variant: 'operator' } // = should never be disabled
  ]
])

export const standardFirstRow = markRaw<ButtonConfig[]>([
  { value: '%', variant: 'function', checkMaxLength: true },
  { value: 'CE', variant: 'function' },
  { value: 'C', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete }
])

export const standardSecondRow = markRaw<ButtonConfig[]>([
  { value: '1/x', variant: 'function', display: '¹⁄ₓ', checkMaxLength: true },
  { value: 'x²', variant: 'function', display: 'x²', checkMaxLength: true },
  { value: '√', variant: 'function', display: '√x', checkMaxLength: true },
  { value: '÷', variant: 'operator', checkMaxLength: true }
])

export const scientificSecondRow = markRaw<ButtonConfig[]>([
  { value: 'π', variant: 'function', checkMaxLength: true },
  { value: 'e', variant: 'function', checkMaxLength: true },
  { value: 'exp', variant: 'function', checkMaxLength: true },
  { value: 'backspace', variant: 'function', icon: Delete }
])

export const scientificThirdRow = markRaw<ButtonConfig[]>([
  { value: '1/x', variant: 'function', checkMaxLength: true },
  { value: '|x|', variant: 'function', checkMaxLength: true },
  { value: 'mod', variant: 'function', checkMaxLength: true },
  { value: '÷', variant: 'operator', checkMaxLength: true }
])

export const programmerFirstRow = markRaw<ButtonConfig[]>([
  { value: '<<', variant: 'function', icon: ChevronsLeftIcon, checkMaxLength: true },
  { value: '>>', variant: 'function', icon: ChevronsRightIcon, checkMaxLength: true },
  { value: 'CE', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete }
])

export const programmerSecondRow = markRaw<ButtonConfig[]>([
  { value: '(', variant: 'function', checkMaxLength: true },
  { value: ')', variant: 'function', checkMaxLength: true },
  { value: '%', variant: 'function', checkMaxLength: true },
  { value: '÷', variant: 'operator', checkMaxLength: true }
])

export const memoryOperations = markRaw<string[]>(['MC', 'MR', 'M+', 'M-', 'MS'])

export const hexLetters = markRaw<string[]>(['A', 'B', 'C', 'D', 'E', 'F'])

export const scientificFunctions = markRaw([
  {
    primary: 'x²',
    secondary: 'x³',
    primaryDisplay: 'x²',
    secondaryDisplay: 'x³',
    checkMaxLength: true
  },
  {
    primary: '√',
    secondary: '∛',
    primaryDisplay: '²√x',
    secondaryDisplay: '³√x',
    checkMaxLength: true
  },
  {
    primary: 'x^y',
    secondary: 'y√x',
    primaryDisplay: 'xʸ',
    secondaryDisplay: 'ʸ√x',
    checkMaxLength: true
  },
  {
    primary: '10^x',
    secondary: '2^x',
    primaryDisplay: '10ˣ',
    secondaryDisplay: '2ˣ',
    checkMaxLength: true
  },
  {
    primary: 'log',
    secondary: 'log2',
    primaryDisplay: 'log',
    secondaryDisplay: 'log₂',
    checkMaxLength: true
  },
  {
    primary: 'ln',
    secondary: 'e^x',
    primaryDisplay: 'ln',
    secondaryDisplay: 'eˣ',
    checkMaxLength: true
  }
])

export const primaryTrigFunctions = markRaw([
  { value: 'sin', display: 'sin', checkMaxLength: true },
  { value: 'cos', display: 'cos', checkMaxLength: true },
  { value: 'tan', display: 'tan', checkMaxLength: true },
  { value: 'asin', display: 'sin⁻¹', checkMaxLength: true },
  { value: 'acos', display: 'cos⁻¹', checkMaxLength: true },
  { value: 'atan', display: 'tan⁻¹', checkMaxLength: true }
])

export const secondaryTrigFunctions = markRaw([
  { value: 'csc', display: 'csc', checkMaxLength: true },
  { value: 'sec', display: 'sec', checkMaxLength: true },
  { value: 'cot', display: 'cot', checkMaxLength: true },
  { value: 'acsc', display: 'csc⁻¹', checkMaxLength: true },
  { value: 'asec', display: 'sec⁻¹', checkMaxLength: true },
  { value: 'acot', display: 'cot⁻¹', checkMaxLength: true }
])

export const primaryHyperbolicFunctions = markRaw([
  { value: 'sinh', display: 'sinh', checkMaxLength: true },
  { value: 'cosh', display: 'cosh', checkMaxLength: true },
  { value: 'tanh', display: 'tanh', checkMaxLength: true },
  { value: 'asinh', display: 'sinh⁻¹', checkMaxLength: true },
  { value: 'acosh', display: 'cosh⁻¹', checkMaxLength: true },
  { value: 'atanh', display: 'tanh⁻¹', checkMaxLength: true }
])

export const secondaryHyperbolicFunctions = markRaw([
  { value: 'csch', display: 'csch', checkMaxLength: true },
  { value: 'sech', display: 'sech', checkMaxLength: true },
  { value: 'coth', display: 'coth', checkMaxLength: true },
  { value: 'acsch', display: 'csch⁻¹', checkMaxLength: true },
  { value: 'asech', display: 'sech⁻¹', checkMaxLength: true },
  { value: 'acoth', display: 'coth⁻¹', checkMaxLength: true }
])

export const functionsList = markRaw([
  { value: 'abs', display: '|x|', checkMaxLength: true },
  { value: 'ceil', display: '⌈x⌉', checkMaxLength: true },
  { value: 'floor', display: '⌊x⌋', checkMaxLength: true },
  { value: 'round', display: 'round', checkMaxLength: true },
  { value: 'rand', display: 'rand', checkMaxLength: true },
  { value: 'dms', display: '→DMS', checkMaxLength: true },
  { value: 'deg', display: '→DEG', checkMaxLength: true },
  { value: 'gcd', display: 'gcd', checkMaxLength: true },
  { value: 'lcm', display: 'lcm', checkMaxLength: true }
])
