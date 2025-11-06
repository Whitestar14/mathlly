import { ref, computed, readonly, watch, type Ref, type ComputedRef } from 'vue'
import { ConversionService } from '@converter/services/ConversionService'
import { ConverterRegistry } from '@converter/services/ConverterRegistry'
import type { ConversionResult, ConversionUnit } from '@converter/types'
import { isValidNumber } from '@converter/utils/unitHelpers'
import { ConverterConstants } from '@converter/lib/constants'
import { setBaseFontSize } from '@converter/services/converters/cssUnits'
import { useConverterOptions } from './useConverterOptions'

export interface UseCssUnitsConverterReturn {
  // State (readonly)
  inputValue: Readonly<Ref<string>>
  fromUnit: Readonly<Ref<string>>
  toUnit: Readonly<Ref<string>>
  result: Readonly<Ref<ConversionResult | null>>
  error: Readonly<Ref<string>>
  isConverting: Readonly<Ref<boolean>>
  baseFontSize: Readonly<Ref<number>>

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
  updateBaseFontSize: (size: number) => void
  reset: () => void
}

export function useCssUnitsConverter(): UseCssUnitsConverterReturn {
  // Load options
  const converterOptions = useConverterOptions()

  // State
  const inputValue = ref<string>('16')
  const fromUnit = ref<string>('px')
  const toUnit = ref<string>('rem')
  const result = ref<ConversionResult | null>(null)
  const error = ref<string>('')
  const isConverting = ref<boolean>(false)
  const baseFontSize = ref<number>(converterOptions.baseFontSize.value)

  // Computed
  const availableUnits = computed<ConversionUnit[]>(() =>
    ConverterRegistry.getInstance().get('css-units')?.units || []
  )
  const numericValue = computed<number>(() => parseFloat(inputValue.value) || 0)
  const hasError = computed<boolean>(() => error.value !== '')
  const formattedResult = computed<string>(() => result.value?.formattedValue || '0')

  // Debounce timeout ref
  let debounceTimeout: NodeJS.Timeout | null = null

  // Methods
  const convert = (precision: number = ConverterConstants.DEFAULT_PRECISION): void => {
    if (!isValidNumber(numericValue.value)) {
      error.value = ConverterConstants.ERROR_MESSAGES.INVALID_VALUE
      result.value = null
      return
    }
    setBaseFontSize(baseFontSize.value)
    isConverting.value = true
    try {
      const conversionResult = ConversionService.getInstance().convert(
        numericValue.value,
        fromUnit.value,
        toUnit.value,
        'css-units'
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

  const updateBaseFontSize = (size: number): void => {
    if (size < ConverterConstants.MIN_BASE_FONT_SIZE || size > ConverterConstants.MAX_BASE_FONT_SIZE) {
      error.value = ConverterConstants.ERROR_MESSAGES.INVALID_BASE_FONT_SIZE
      return
    }
    baseFontSize.value = size
    if (inputValue.value.trim()) convert()
  }

  const reset = (): void => {
    inputValue.value = '16'
    fromUnit.value = 'px'
    toUnit.value = 'rem'
    result.value = null
    error.value = ''
    isConverting.value = false
    baseFontSize.value = ConverterConstants.DEFAULT_BASE_FONT_SIZE
  }

  // Watchers
  watch(inputValue, (newVal) => {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      if (newVal.trim()) convert()
    }, 300)
  })

  watch(baseFontSize, () => {
    if (inputValue.value.trim()) convert()
  })

  watch(() => converterOptions.baseFontSize.value, (newSize) => {
    baseFontSize.value = newSize
    if (inputValue.value.trim() && result.value) {
      convert()
    }
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
    baseFontSize: readonly(baseFontSize),

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
    updateBaseFontSize,
    reset
  }
}
