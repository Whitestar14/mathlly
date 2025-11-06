import { ref, readonly } from 'vue'
import { ConverterFactory } from '../services/factory/ConverterFactory'
import type { ConverterType } from '../types'
import { useConverterOptions } from './useConverterOptions'

interface ConverterTypeOption {
  value: ConverterType
  label: string
  icon?: string
}

const currentConverterType = ref<ConverterType>('temperature')
const isInitialized = ref(false)

const availableConverterTypes: ConverterTypeOption[] = [
  { value: 'temperature', label: 'Temperature', icon: 'thermometer' },
  { value: 'length', label: 'Length', icon: 'ruler' },
  { value: 'weight', label: 'Weight & Mass', icon: 'weight' },
  { value: 'css-units', label: 'CSS Units', icon: 'code' },
  { value: 'currency', label: 'Currency', icon: 'banknote' }
]

/**
 * Initialize the converter type switcher
 */
export function initializeConverterTypeSwitcher(initialType?: ConverterType): void {
  if (isInitialized.value) return

  // Load default converter type from options
  const { defaultConverterType } = useConverterOptions()
  const availableTypes = ConverterFactory.getAvailableTypes()

  const typeToUse = initialType || defaultConverterType.value

  // Ensure the type is available
  currentConverterType.value = availableTypes.includes(typeToUse) ? typeToUse : 'temperature'
  isInitialized.value = true
}

/**
 * Main composable for converter type switching
 */
export function useConverterTypeSwitcher() {
  if (!isInitialized.value) {
    initializeConverterTypeSwitcher()
  }

  const updateConverterType = (newType: ConverterType): void => {
    if (availableConverterTypes.some(type => type.value === newType) &&
      ConverterFactory.getAvailableTypes().includes(newType)) {
      currentConverterType.value = newType
    } else {
      console.warn(`Converter type '${newType}' is not available`)
    }
  }

  return {
    currentConverterType: readonly(currentConverterType),
    availableConverterTypes: availableConverterTypes.filter(type =>
      ConverterFactory.getAvailableTypes().includes(type.value)
    ),
    updateConverterType
  }
}

export { currentConverterType as converterType }
