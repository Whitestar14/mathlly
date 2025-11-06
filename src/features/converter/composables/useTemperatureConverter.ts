import { ref, computed, readonly, watch, type Ref, type ComputedRef } from 'vue'
import { ConversionService } from '@converter/services/ConversionService'
import { ConverterRegistry } from '@converter/services/ConverterRegistry'
import type { ConversionResult, ConversionUnit } from '@converter/types'
import { isValidNumber } from '@converter/utils/unitHelpers'
import { ConverterConstants } from '@converter/lib/constants'
import { useConverterOptions } from './useConverterOptions'

export interface UseTemperatureConverterReturn {
  // State (readonly)
  inputValue: Readonly<Ref<string>>
  fromUnit: Readonly<Ref<string>>
  toUnit: Readonly<Ref<string>>
  result: Readonly<Ref<ConversionResult | null>>
  error: Readonly<Ref<string>>
  isConverting: Readonly<Ref<boolean>>

  // Computed
  availableUnits: ComputedRef<ConversionUnit[]>
  numericValue: ComputedRef<number>
  hasError: ComputedRef<boolean>
  formattedResult: ComputedRef<string>

  // Methods
  convert: (precision?: number) => void
  setFromUnit: (unitId: string) => void
  setToUnit: (unitId: string) => void
  flipUnits: () => void
  setInputValue: (value: string) => void
  reset: () => void
}

export function useTemperatureConverter(): UseTemperatureConverterReturn {
  // Load options
  const converterOptions = useConverterOptions()

  // State
  const inputValue = ref<string>('0')
  const fromUnit = ref<string>('celsius')
  const toUnit = ref<string>('fahrenheit')
  const result = ref<ConversionResult | null>(null)
  const error = ref<string>('')
  const isConverting = ref<boolean>(false)

  // Computed
  const availableUnits = computed<ConversionUnit[]>(() =>
    ConverterRegistry.getInstance().get('temperature')?.units || []
  )
  const numericValue = computed<number>(() => parseFloat(inputValue.value) || 0)
  const hasError = computed<boolean>(() => error.value !== '')
  const formattedResult = computed<string>(() => result.value?.formattedValue || '0')

  // Debounce timeout ref
  let debounceTimeout: NodeJS.Timeout | null = null

  // Methods
  const convert = (precision?: number): void => {
    const actualPrecision = precision ?? converterOptions.precision.value
    if (!isValidNumber(numericValue.value)) {
      error.value = ConverterConstants.ERROR_MESSAGES.INVALID_VALUE
      result.value = null
      return
    }
    isConverting.value = true
    try {
      const conversionResult = ConversionService.getInstance().convert(
        numericValue.value,
        fromUnit.value,
        toUnit.value,
        'temperature',
        actualPrecision
      )
      result.value = conversionResult
      error.value = ''
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Conversion failed'
      result.value = null
    } finally {
      isConverting.value = false
    }
  }

  const setFromUnit = (unitId: string): void => {
    if (!availableUnits.value.find(u => u.id === unitId)) return
    fromUnit.value = unitId
    if (inputValue.value.trim()) convert()
  }

  const setToUnit = (unitId: string): void => {
    if (!availableUnits.value.find(u => u.id === unitId)) return
    toUnit.value = unitId
    if (inputValue.value.trim()) convert()
  }

  const flipUnits = (): void => {
    const temp = fromUnit.value
    fromUnit.value = toUnit.value
    toUnit.value = temp
    if (result.value) {
      inputValue.value = result.value.value.toString()
      convert()
    }
  }

  const setInputValue = (value: string): void => {
    inputValue.value = value
    error.value = ''
    if (value.trim()) convert()
  }

  const reset = (): void => {
    inputValue.value = '0'
    fromUnit.value = 'celsius'
    toUnit.value = 'fahrenheit'
    result.value = null
    error.value = ''
    isConverting.value = false
  }

  // Watchers
  watch(inputValue, (newVal) => {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      if (newVal.trim()) convert()
    }, 300)
  })

  // Watch precision changes and reconvert
  watch(
    () => converterOptions.precision.value,
    (newPrecision) => {
      if (inputValue.value.trim() && result.value) {
        convert(newPrecision)
      }
    }
  )

  return {
    // State (readonly)
    inputValue: readonly(inputValue),
    fromUnit: readonly(fromUnit),
    toUnit: readonly(toUnit),
    result: readonly(result),
    error: readonly(error),
    isConverting: readonly(isConverting),

    // Computed
    availableUnits,
    numericValue,
    hasError,
    formattedResult,

    // Methods
    convert,
    setFromUnit,
    setToUnit,
    flipUnits,
    setInputValue,
    reset
  }
}
