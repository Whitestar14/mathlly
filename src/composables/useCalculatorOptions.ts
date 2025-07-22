import { computed } from 'vue'
import { createToolOptions } from '@/composables/useToolOptions'

// Calculator-specific option types
export interface CalculatorOptions {
  defaultMode: 'Standard' | 'Scientific' | 'Programmer'
  precision: number
  useFractions: boolean
  syntaxHighlighting: boolean
  useThousandsSeparator: boolean
  formatBinary: boolean
  formatHexadecimal: boolean
  formatOctal: boolean
  angleUnit: 'degrees' | 'radians' | 'gradians'
  notationMode: 'standard' | 'scientific' | 'engineering'
  hyperbolicMode: boolean
}

// Default calculator options
const DEFAULT_CALCULATOR_OPTIONS: CalculatorOptions = {
  defaultMode: 'Standard',
  precision: 4,
  useFractions: false,
  syntaxHighlighting: true,
  useThousandsSeparator: true,
  formatBinary: true,
  formatHexadecimal: true,
  formatOctal: true,
  angleUnit: 'degrees',
  notationMode: 'standard',
  hyperbolicMode: false
}

export function useCalculatorOptions() {
  const { options, isLoading } = createToolOptions<CalculatorOptions>(
    'calculator',
    'Calculator',
    DEFAULT_CALCULATOR_OPTIONS,
    (options) => [
      {
        id: 'defaultMode',
        label: 'Default Calculator Mode',
        description: 'Which calculator mode to load when the app starts',
        type: 'select',
        value: options,
        options: [
          { value: 'Standard', label: 'Standard' },
          { value: 'Scientific', label: 'Scientific' },
          { value: 'Programmer', label: 'Programmer' }
        ],
        section: 'General'
      },
      {
        id: 'precision',
        label: 'Decimal Precision',
        description: 'Number of decimal places to display in results',
        type: 'select',
        value: options,
        options: Array.from({ length: 11 }, (_, i) => ({
          value: i,
          label: i.toString()
        })),
        section: 'Display'
      },
      {
        id: 'useFractions',
        label: 'Use Fractions',
        description: 'Display results as fractions when possible',
        type: 'toggle',
        value: options,
        section: 'Display'
      },
      {
        id: 'syntaxHighlighting',
        label: 'Syntax Highlighting',
        description: 'Highlight numbers, operators, and functions with colors',
        type: 'toggle',
        value: options,
        section: 'Display'
      },
      {
        id: 'useThousandsSeparator',
        label: 'Thousands Separator',
        description: 'Add commas to separate thousands in large numbers',
        type: 'toggle',
        value: options,
        section: 'Number Formatting'
      },
      {
        id: 'formatBinary',
        label: 'Format Binary Numbers',
        description: 'Format binary numbers for better readability',
        type: 'toggle',
        value: options,
        section: 'Number Formatting'
      },
      {
        id: 'formatHexadecimal',
        label: 'Format Hexadecimal Numbers',
        description: 'Format hexadecimal numbers for better readability',
        type: 'toggle',
        value: options,
        section: 'Number Formatting'
      },
      {
        id: 'formatOctal',
        label: 'Format Octal Numbers',
        description: 'Format octal numbers for better readability',
        type: 'toggle',
        value: options,
        section: 'Number Formatting'
      },
      {
        id: 'angleUnit',
        label: 'Angle Unit',
        description: 'Unit for trigonometric functions',
        type: 'radio',
        value: options,
        options: [
          { value: 'degrees', label: 'Degrees' },
          { value: 'radians', label: 'Radians' },
          { value: 'gradians', label: 'Gradians' }
        ],
        section: 'Scientific'
      },
      {
        id: 'notationMode',
        label: 'Notation Mode',
        description: 'How to display large or small numbers',
        type: 'select',
        value: options,
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'scientific', label: 'Scientific' },
          { value: 'engineering', label: 'Engineering' }
        ],
        section: 'Scientific'
      },
      {
        id: 'hyperbolicMode',
        label: 'Hyperbolic Mode',
        description: 'Enable hyperbolic trigonometric functions',
        type: 'toggle',
        value: options,
        section: 'Scientific'
      }
    ]
  )

  // Computed display modes for UI
  const angleDisplayMode = computed(() => {
    const mapping = {
      'degrees': 'DEG',
      'radians': 'RAD', 
      'gradians': 'GRAD'
    };
    return mapping[options.value.angleUnit] || 'DEG';
  });

  const notationDisplayMode = computed(() => {
    const mapping = {
      'standard': 'F-E',
      'scientific': 'SCI',
      'engineering': 'SCI'
    };
    return mapping[options.value.notationMode] || 'F-E';
  });

  // Helper methods for UI interactions
  const cycleAngleMode = () => {
    const modes: Array<'degrees' | 'radians' | 'gradians'> = ['degrees', 'radians', 'gradians'];
    const currentIndex = modes.indexOf(options.value.angleUnit);
    options.value.angleUnit = modes[(currentIndex + 1) % modes.length];
  };

  const toggleNotationMode = () => {
    options.value.notationMode = options.value.notationMode === 'standard' ? 'scientific' : 'standard';
  };

  const toggleHyperbolicMode = () => {
    options.value.hyperbolicMode = !options.value.hyperbolicMode;
  };

  return {
    // The entire options object
    options,
    
    // Individual options (for convenience)
    defaultMode: computed(() => options.value.defaultMode),
    precision: computed(() => options.value.precision),
    useFractions: computed(() => options.value.useFractions),
    syntaxHighlighting: computed(() => options.value.syntaxHighlighting),
    useThousandsSeparator: computed(() => options.value.useThousandsSeparator),
    formatBinary: computed(() => options.value.formatBinary),
    formatHexadecimal: computed(() => options.value.formatHexadecimal),
    formatOctal: computed(() => options.value.formatOctal),
    angleUnit: computed(() => options.value.angleUnit),
    notationMode: computed(() => options.value.notationMode),
    hyperbolicMode: computed(() => options.value.hyperbolicMode),
    
    // Display modes for UI
    angleDisplayMode,
    notationDisplayMode,
    
    // Helper methods
    cycleAngleMode,
    toggleNotationMode,
    toggleHyperbolicMode,
    
    // Store state
    isLoading,
  }
}
