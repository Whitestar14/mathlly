import { computed } from 'vue'
import { useToolOptions } from '@composables/ui/useToolOptions'
import { ConverterOptions, ConverterType } from '@converter/types'
import { ConverterConstants } from '@converter/lib/constants'

const DEFAULT_CONVERTER_OPTIONS: ConverterOptions = {
  defaultConverterType: 'temperature',
  precision: ConverterConstants.DEFAULT_PRECISION,
  autoConvert: true,
  showUnitAbbreviations: false,
  enableVisualizations: true,
  baseFontSize: ConverterConstants.DEFAULT_BASE_FONT_SIZE,
  swapUnitsOnFlip: true,
  showThousandSeparators: true,
  hapticFeedback: false
}

interface ConverterTypeOption {
  value: ConverterType
  label: string
}

export const availableConverterTypes: ConverterTypeOption[] = [
  { value: 'area', label: 'Area' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'length', label: 'Length' },
  { value: 'weight', label: 'Weight & Mass' },
  { value: 'css-units', label: 'CSS Units' },
  { value: 'volume', label: 'Volume' },
  { value: 'data', label: 'Data' },
  { value: 'currency', label: 'Currency' },
  { value: 'energy', label: 'Energy' },
  { value: 'speed', label: 'Speed' },
  { value: 'time', label: 'Time' },
  { value: 'power', label: 'Power' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'angle', label: 'Angle' }
]

export function useConverterOptions() {
  const { options, isLoading } = useToolOptions<ConverterOptions>(
    'converter',
    'Converter',
    DEFAULT_CONVERTER_OPTIONS,
    options => [
      {
        id: 'defaultConverterType',
        label: 'Default Converter Type',
        description: 'Which converter to load when opening the converter tool',
        type: 'select',
        value: options,
        options: availableConverterTypes,
        section: 'General'
      },
      {
        id: 'autoConvert',
        label: 'Auto Convert',
        description: 'Automatically convert values as you type',
        type: 'toggle',
        value: options,
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
        description: 'Number of decimal places to display in conversion results',
        type: 'select',
        value: options,
        options: Array.from({ length: 11 }, (_, i) => ({
          value: i,
          label: i.toString()
        })),
        section: 'Display'
      },
      {
        id: 'showUnitAbbreviations',
        label: 'Show Unit Abbreviations',
        description: 'Display unit symbols (°C, kg) instead of full names (Celsius, Kilogram)',
        type: 'toggle',
        value: options,
        section: 'Display'
      },
      {
        id: 'enableVisualizations',
        label: 'Enable Visualizations',
        description: 'Show contextual scale comparisons (e.g., "about 3 cheeseburgers") for conversions',
        type: 'toggle',
        value: options,
        section: 'Display'
      },
      {
        id: 'baseFontSize',
        label: 'Base Font Size',
        description: 'Root font size in pixels for rem/em conversions in CSS Units converter',
        type: 'range',
        value: options,
        min: ConverterConstants.MIN_BASE_FONT_SIZE,
        max: ConverterConstants.MAX_BASE_FONT_SIZE,
        step: 1,
        section: 'CSS Units'
      },
      {
        id: 'swapUnitsOnFlip',
        label: 'Swap Units on Flip',
        description: 'When flipping units, swap the input/output units and preserve converted values',
        type: 'toggle',
        value: options,
        section: 'Behavior'
      },
      {
        id: 'showThousandSeparators',
        label: 'Show Thousand Separators',
        description: 'Display commas in large numbers (e.g., 1,234.56 vs 1234.56)',
        type: 'toggle',
        value: options,
        section: 'Display'
      }
    ]
  )

  return {
    options,
    defaultConverterType: computed(() => options.value.defaultConverterType),
    precision: computed(() => options.value.precision),
    autoConvert: computed(() => options.value.autoConvert),
    showUnitAbbreviations: computed(() => options.value.showUnitAbbreviations),
    enableVisualizations: computed(() => options.value.enableVisualizations),
    baseFontSize: computed(() => options.value.baseFontSize),
    swapUnitsOnFlip: computed(() => options.value.swapUnitsOnFlip),
    showThousandSeparators: computed(() => options.value.showThousandSeparators),
    hapticFeedback: computed(() => options.value.hapticFeedback),
    isLoading
  }
}