import { ref, watch, nextTick, computed } from 'vue'
import { useToolSettingsStore } from '@/stores/toolSettings'
import type { ToolConfig } from '@/stores/toolSettings'

// Calculator-specific option types
export interface CalculatorOptions {
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
  const toolStore = useToolSettingsStore()
  
  // Create reactive refs for each option
  const precision = ref<number>(DEFAULT_CALCULATOR_OPTIONS.precision)
  const useFractions = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.useFractions)
  const syntaxHighlighting = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.syntaxHighlighting)
  const useThousandsSeparator = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.useThousandsSeparator)
  const formatBinary = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.formatBinary)
  const formatHexadecimal = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.formatHexadecimal)
  const formatOctal = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.formatOctal)
  const angleUnit = ref<'degrees' | 'radians' | 'gradians'>(DEFAULT_CALCULATOR_OPTIONS.angleUnit)
  const notationMode = ref<'standard' | 'scientific' | 'engineering'>(DEFAULT_CALCULATOR_OPTIONS.notationMode)
  const hyperbolicMode = ref<boolean>(DEFAULT_CALCULATOR_OPTIONS.hyperbolicMode)

  const isInitializing = ref(true)

  // Watch for settings changes and update refs
  watch(() => toolStore.currentToolSettings, (newSettings) => {
    if (toolStore.currentToolId !== 'calculator') return
    
    isInitializing.value = true
    
    precision.value = newSettings.precision ?? DEFAULT_CALCULATOR_OPTIONS.precision
    useFractions.value = newSettings.useFractions ?? DEFAULT_CALCULATOR_OPTIONS.useFractions
    syntaxHighlighting.value = newSettings.syntaxHighlighting ?? DEFAULT_CALCULATOR_OPTIONS.syntaxHighlighting
    useThousandsSeparator.value = newSettings.useThousandsSeparator ?? DEFAULT_CALCULATOR_OPTIONS.useThousandsSeparator
    formatBinary.value = newSettings.formatBinary ?? DEFAULT_CALCULATOR_OPTIONS.formatBinary
    formatHexadecimal.value = newSettings.formatHexadecimal ?? DEFAULT_CALCULATOR_OPTIONS.formatHexadecimal
    formatOctal.value = newSettings.formatOctal ?? DEFAULT_CALCULATOR_OPTIONS.formatOctal
    angleUnit.value = newSettings.angleUnit ?? DEFAULT_CALCULATOR_OPTIONS.angleUnit
    notationMode.value = newSettings.notationMode ?? DEFAULT_CALCULATOR_OPTIONS.notationMode
    hyperbolicMode.value = newSettings.hyperbolicMode ?? DEFAULT_CALCULATOR_OPTIONS.hyperbolicMode
    
    nextTick(() => {
      isInitializing.value = false
    })
  }, { immediate: true, deep: true })

  // Create watchers for all options
  const createWatcher = (ref: any, key: string) => {
    watch(ref, async (value) => {
      if (!isInitializing.value && toolStore.currentToolId === 'calculator') {
        await toolStore.updateCurrentToolSetting(key, value)
      }
    })
  }

  createWatcher(precision, 'precision')
  createWatcher(useFractions, 'useFractions')
  createWatcher(syntaxHighlighting, 'syntaxHighlighting')
  createWatcher(useThousandsSeparator, 'useThousandsSeparator')
  createWatcher(formatBinary, 'formatBinary')
  createWatcher(formatHexadecimal, 'formatHexadecimal')
  createWatcher(formatOctal, 'formatOctal')
  createWatcher(angleUnit, 'angleUnit')
  createWatcher(notationMode, 'notationMode')
  createWatcher(hyperbolicMode, 'hyperbolicMode')

  // Computed display modes for UI
  const angleDisplayMode = computed(() => {
    const mapping = {
      'degrees': 'DEG',
      'radians': 'RAD', 
      'gradians': 'GRAD'
    };
    return mapping[angleUnit.value] || 'DEG';
  });

  const notationDisplayMode = computed(() => {
    const mapping = {
      'standard': 'F-E',
      'scientific': 'SCI',
      'engineering': 'SCI'
    };
    return mapping[notationMode.value] || 'F-E';
  });

  // Helper methods for UI interactions
  const cycleAngleMode = async () => {
    const modes: Array<'degrees' | 'radians' | 'gradians'> = ['degrees', 'radians', 'gradians'];
    const currentIndex = modes.indexOf(angleUnit.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    angleUnit.value = modes[nextIndex];
  };

  const toggleNotationMode = async () => {
    notationMode.value = notationMode.value === 'standard' ? 'scientific' : 'standard';
  };

  const toggleHyperbolicMode = async () => {
    hyperbolicMode.value = !hyperbolicMode.value;
  };

  // Register calculator configuration
  const calculatorConfig: ToolConfig = {
    toolId: 'calculator',
    toolName: 'Calculator',
    defaultSettings: DEFAULT_CALCULATOR_OPTIONS,
    options: [
      {
        id: 'precision',
        label: 'Decimal Precision',
        description: 'Number of decimal places to display in results',
        type: 'select',
        value: precision,
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
        value: useFractions,
        section: 'Display'
      },
      {
        id: 'syntaxHighlighting',
        label: 'Syntax Highlighting',
        description: 'Highlight numbers, operators, and functions with colors',
        type: 'toggle',
        value: syntaxHighlighting,
        section: 'Display'
      },
      {
        id: 'useThousandsSeparator',
        label: 'Thousands Separator',
        description: 'Add commas to separate thousands in large numbers',
        type: 'toggle',
        value: useThousandsSeparator,
        section: 'Number Formatting'
      },
      {
        id: 'formatBinary',
        label: 'Format Binary Numbers',
        description: 'Format binary numbers for better readability',
        type: 'toggle',
        value: formatBinary,
        section: 'Number Formatting'
      },
      {
        id: 'formatHexadecimal',
        label: 'Format Hexadecimal Numbers',
        description: 'Format hexadecimal numbers for better readability',
        type: 'toggle',
        value: formatHexadecimal,
        section: 'Number Formatting'
      },
      {
        id: 'formatOctal',
        label: 'Format Octal Numbers',
        description: 'Format octal numbers for better readability',
        type: 'toggle',
        value: formatOctal,
        section: 'Number Formatting'
      },
      {
        id: 'angleUnit',
        label: 'Angle Unit',
        description: 'Unit for trigonometric functions',
        type: 'radio',
        value: angleUnit,
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
        value: notationMode,
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
        value: hyperbolicMode,
        section: 'Scientific'
      }
    ]
  }

  // Register with the store
  toolStore.registerTool(calculatorConfig)

  return {
    // Individual reactive refs
    precision,
    useFractions,
    syntaxHighlighting,
    useThousandsSeparator,
    formatBinary,
    formatHexadecimal,
    formatOctal,
    angleUnit,
    notationMode,
    hyperbolicMode,
    
    // Display modes for UI
    angleDisplayMode,
    notationDisplayMode,
    
    // Helper methods
    cycleAngleMode,
    toggleNotationMode,
    toggleHyperbolicMode,
    
    // Store state
    isLoading: toolStore.isLoading,
    
    // Computed getter for all options
    options: computed(() => ({
      precision: precision.value,
      useFractions: useFractions.value,
      syntaxHighlighting: syntaxHighlighting.value,
      useThousandsSeparator: useThousandsSeparator.value,
      formatBinary: formatBinary.value,
      formatHexadecimal: formatHexadecimal.value,
      formatOctal: formatOctal.value,
      angleUnit: angleUnit.value,
      notationMode: notationMode.value,
      hyperbolicMode: hyperbolicMode.value
    }))
  }
}
