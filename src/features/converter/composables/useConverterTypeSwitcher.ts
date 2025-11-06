import { ref, readonly } from 'vue'
import { ConverterRegistry } from '@converter/services/ConverterRegistry'
import type { ConverterType } from '@converter/types'
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
  const typeToUse = initialType || defaultConverterType.value

  currentConverterType.value = typeToUse
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
    if (availableConverterTypes.some(type => type.value === newType)) {
      if (ConverterRegistry.getInstance().isRegistered(newType)) {
        currentConverterType.value = newType
      } else {
        console.warn(`Converter type '${newType}' is not registered in ConverterRegistry`)
      }
    } else {
      console.warn(`Converter type '${newType}' is not available in availableConverterTypes`)
    }
  }

  return {
    currentConverterType: readonly(currentConverterType),
    availableConverterTypes,
    updateConverterType
  }
}

export { currentConverterType as converterType }
