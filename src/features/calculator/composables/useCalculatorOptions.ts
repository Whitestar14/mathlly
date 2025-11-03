import { computed } from 'vue'
import { useToolOptions } from '@composables/ui/useToolOptions'
import { CalculatorOptions } from '../types/calculator'

const DEFAULT_CALCULATOR_OPTIONS: CalculatorOptions = {
  defaultMode: 'Standard',
  precision: 4,
  useFractions: false,
  syntaxHighlighting: true,
  useThousandsSeparator: true,
  formatProgrammerNumbers: true,
  angleUnit: 'degrees',
  notationMode: 'standard',
  hyperbolicMode: false,
  hapticFeedback: false
}

export function useCalculatorOptions() {
  const { options, isLoading } = useToolOptions<CalculatorOptions>(
    'calculator',
    'Calculator',
    DEFAULT_CALCULATOR_OPTIONS,
    options => [
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
        id: 'hapticFeedback',
        label: 'Haptic Feedback',
        description: 'Vibrate on button press (mobile devices only)',
        type: 'toggle',
        value: options,
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
        id: 'formatProgrammerNumbers',
        label: 'Format Programmer Numbers',
        description: 'Group digits in binary, hexadecimal, and octal numbers for better readability',
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

  const angleDisplayMode = computed(() => {
    const mapping = {
      'degrees': 'DEG',
      'radians': 'RAD',
      'gradians': 'GRAD'
    }
    return mapping[options.value.angleUnit] || 'DEG'
  })

  const notationDisplayMode = computed(() => {
    const mapping = {
      'standard': 'F-E',
      'scientific': 'SCI',
      'engineering': 'ENG'
    }
    return mapping[options.value.notationMode] || 'F-E'
  })

  function cycleOption<K extends keyof CalculatorOptions>(
    key: K,
    values: CalculatorOptions[K][]
  ) {
    const current = options.value[key]
    const index = values.indexOf(current)
    options.value[key] = values[(index + 1) % values.length]
  }

  const cycleNotationMode = () =>
    cycleOption('notationMode', ['standard', 'scientific', 'engineering'])

  const cycleAngleMode = () =>
    cycleOption('angleUnit', ['degrees', 'radians', 'gradians'])

  const toggleHyperbolicMode = () => {
    options.value.hyperbolicMode = !options.value.hyperbolicMode
  }

  return {

    options,

    defaultMode: computed(() => options.value.defaultMode),
    precision: computed(() => options.value.precision),
    useFractions: computed(() => options.value.useFractions),
    syntaxHighlighting: computed(() => options.value.syntaxHighlighting),
    useThousandsSeparator: computed(() => options.value.useThousandsSeparator),
    formatProgrammerNumbers: computed(() => options.value.formatProgrammerNumbers),
    angleUnit: computed(() => options.value.angleUnit),
    notationMode: computed(() => options.value.notationMode),
    hyperbolicMode: computed(() => options.value.hyperbolicMode),
    hapticFeedback: computed(() => options.value.hapticFeedback),

    angleDisplayMode,
    notationDisplayMode,

    cycleAngleMode,
    cycleNotationMode,
    toggleHyperbolicMode,

    isLoading
  }
}
