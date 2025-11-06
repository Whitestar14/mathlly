import { ref, computed, readonly, watch, type Ref, type ComputedRef } from 'vue'
import { ConversionService } from '@converter/services/ConversionService'
import { ConverterRegistry } from '@converter/services/ConverterRegistry'
import type { ConverterType, ConversionResult, ConversionUnit } from '@converter/types'
import { isValidNumber } from '@converter/utils/unitHelpers'
import { ConverterConstants } from '@converter/lib/constants'
import { useConverterOptions } from '@converter/composables/useConverterOptions'
import { setBaseFontSize } from '@converter/services/converters/cssUnits'

export interface ConverterInstance {
  // State properties (readonly refs)
  inputValue: Readonly<Ref<string>>
  fromUnit: Readonly<Ref<string>>
  toUnit: Readonly<Ref<string>>
  result: Readonly<Ref<ConversionResult | null>>
  error: Readonly<Ref<string>>
  isConverting: Readonly<Ref<boolean>>

  // Computed properties
  availableUnits: ComputedRef<ConversionUnit[]>
  numericValue: ComputedRef<number>
  hasError: ComputedRef<boolean>
  formattedResult: ComputedRef<string>

  // Options (reactive)
  options: ReturnType<typeof useConverterOptions>

  // Methods
  convert: (precision?: number) => Promise<void>
  setFromUnit: (unitId: string) => Promise<void>
  setToUnit: (unitId: string) => Promise<void>
  flipUnits: () => Promise<void>
  setInputValue: (value: string) => void
  reset: () => void
}

export class ConverterFactory {
  static create(
    converterType: ConverterType,
    converterOptions?: ReturnType<typeof useConverterOptions>
  ): ConverterInstance {
    // Get reactive options (passed in or from composable)
    const options = converterOptions || useConverterOptions()

    // Get converter config
    const config = ConverterRegistry.getInstance().get(converterType)
    if (!config) {
      throw new Error(`Unsupported converter type: ${converterType}`)
    }

    // Create reactive state
    const inputValue = ref<string>('0')
    const fromUnit = ref<string>(config.defaultFromUnit || '')
    const toUnit = ref<string>(config.defaultToUnit || '')
    const result = ref<ConversionResult | null>(null)
    const error = ref<string>('')
    const isConverting = ref<boolean>(false)

    // Computed properties
    const availableUnits = computed<ConversionUnit[]>(() => config.units || [])
    const numericValue = computed<number>(() => parseFloat(inputValue.value) || 0)
    const hasError = computed<boolean>(() => error.value !== '')
    const formattedResult = computed<string>(() => result.value?.formattedValue || '0')

    // Debounce timeout
    let debounceTimeout: NodeJS.Timeout | null = null

    // Convert method
    const convert = async (precision?: number): Promise<void> => {
      const actualPrecision = precision ?? options.precision.value

      if (!isValidNumber(numericValue.value)) {
        error.value = ConverterConstants.ERROR_MESSAGES.INVALID_VALUE
        result.value = null
        return
      }

      isConverting.value = true
      try {
        const conversionResult = await ConversionService.getInstance().convert(
          numericValue.value,
          fromUnit.value,
          toUnit.value,
          converterType,
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

    // Unit management methods
    const setFromUnit = async (unitId: string): Promise<void> => {
      if (!availableUnits.value.find(u => u.id === unitId)) return
      fromUnit.value = unitId
      if (inputValue.value.trim()) await convert()
    }

    const setToUnit = async (unitId: string): Promise<void> => {
      if (!availableUnits.value.find(u => u.id === unitId)) return
      toUnit.value = unitId
      if (inputValue.value.trim()) await convert()
    }

    const flipUnits = async (): Promise<void> => {
      const temp = fromUnit.value
      fromUnit.value = toUnit.value
      toUnit.value = temp
      if (result.value) {
        inputValue.value = result.value.value.toString()
        await convert()
      }
    }

    // Input management
    const setInputValue = (value: string): void => {
      inputValue.value = value
      error.value = ''
      // Conversion handled by autoConvert watcher
    }

    const reset = (): void => {
      inputValue.value = '0'
      fromUnit.value = config.defaultFromUnit || ''
      toUnit.value = config.defaultToUnit || ''
      result.value = null
      error.value = ''
      isConverting.value = false
    }

    // Auto-convert watcher
    let inputWatcherStop: (() => void) | null = null

    const setupAutoConvert = () => {
      if (inputWatcherStop) {
        inputWatcherStop()
        inputWatcherStop = null
      }

      if (options.autoConvert.value) {
        inputWatcherStop = watch(inputValue, (newVal) => {
          if (debounceTimeout) clearTimeout(debounceTimeout)
          debounceTimeout = setTimeout(async () => {
            if (newVal.trim()) await convert()
          }, 300)
        })
      }
    }

    // Watch autoConvert option changes
    watch(() => options.autoConvert.value, setupAutoConvert)
    setupAutoConvert()

    // Watch precision changes and reconvert if needed
    watch(
      () => options.precision.value,
      async (newPrecision) => {
        if (inputValue.value.trim() && result.value) {
          await convert(newPrecision)
        }
      }
    )

    // Special handling for CSS units
    if (converterType === 'css-units') {
      watch(() => options.baseFontSize.value, (newSize) => {
        setBaseFontSize(newSize)
      }, { immediate: true })
    }

    // Return converter instance
    return {
      // State
      inputValue: readonly(inputValue),
      fromUnit: readonly(fromUnit),
      toUnit: readonly(toUnit),
      result: readonly(result) as Readonly<Ref<ConversionResult | null>>,
      error: readonly(error),
      isConverting: readonly(isConverting),

      // Computed
      availableUnits,
      numericValue,
      hasError,
      formattedResult,

      // Options
      options,

      // Methods
      convert,
      setFromUnit,
      setToUnit,
      flipUnits,
      setInputValue,
      reset
    }
  }
}