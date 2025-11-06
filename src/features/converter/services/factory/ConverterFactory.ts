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

  // Methods
  convert: (precision?: number) => Promise<void>
  setFromUnit: (unitId: string) => Promise<void>
  setToUnit: (unitId: string) => Promise<void>
  flipUnits: () => Promise<void>
  setInputValue: (value: string) => void
  reset: () => void
}

export interface CssUnitsConverterInstance extends ConverterInstance {
  baseFontSize: Readonly<Ref<number>>
  updateBaseFontSize: (size: number) => Promise<void>
}

export function isCssUnitsConverter(converter: ConverterInstance): converter is CssUnitsConverterInstance {
  return 'baseFontSize' in converter
}

export class ConverterFactory {
  static create(converterType: ConverterType): ConverterInstance {
    // 1. Get converter options via useConverterOptions()
    const converterOptions = useConverterOptions()

    // 2. Get converter config from registry via ConverterRegistry.getInstance().get(converterType)
    const config = ConverterRegistry.getInstance().get(converterType)
    if (!config) {
      throw new Error(`Unsupported converter type: ${converterType}`)
    }

    // 3. Create reactive state refs based on config defaults
    const inputValue = ref<string>('0')
    const fromUnit = ref<string>(config.defaultFromUnit || '')
    const toUnit = ref<string>(config.defaultToUnit || '')
    const result = ref<ConversionResult | null>(null)
    const error = ref<string>('')
    const isConverting = ref<boolean>(false)

    // 4. Create computed properties for availableUnits, numericValue, hasError, formattedResult
    const availableUnits = computed<ConversionUnit[]>(() => config.units || [])
    const numericValue = computed<number>(() => parseFloat(inputValue.value) || 0)
    const hasError = computed<boolean>(() => error.value !== '')
    const formattedResult = computed<string>(() => result.value?.formattedValue || '0')

    // Debounce timeout ref
    let debounceTimeout: NodeJS.Timeout | null = null

    // 5. Implement convert method (async) that calls ConversionService.getInstance().convert()
    const convert = async (precision?: number): Promise<void> => {
      const actualPrecision = precision ?? converterOptions.precision.value
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

    // 6. Implement setFromUnit, setToUnit, flipUnits, setInputValue, reset methods
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

    const setInputValue = (value: string): void => {
      inputValue.value = value
      error.value = ''
      // Conversion handled by watcher if autoConvert is true
    }

    const reset = (): void => {
      inputValue.value = '0'
      fromUnit.value = config.defaultFromUnit || ''
      toUnit.value = config.defaultToUnit || ''
      result.value = null
      error.value = ''
      isConverting.value = false
    }

    // 7. Setup autoConvert watcher conditionally based on converterOptions.autoConvert.value
    let inputWatcherStop: (() => void) | null = null

    const setupAutoConvert = () => {
      if (inputWatcherStop) {
        inputWatcherStop()
        inputWatcherStop = null
      }
      if (converterOptions.autoConvert.value) {
        inputWatcherStop = watch(inputValue, (newVal) => {
          if (debounceTimeout) clearTimeout(debounceTimeout)
          debounceTimeout = setTimeout(async () => {
            if (newVal.trim()) await convert()
          }, 300)
        })
      }
    }

    // Watch autoConvert option and setup watcher dynamically
    watch(() => converterOptions.autoConvert.value, setupAutoConvert)
    // Initial setup
    setupAutoConvert()

    // 8. Setup precision watcher to reconvert when precision changes
    watch(
      () => converterOptions.precision.value,
      async (newPrecision) => {
        if (inputValue.value.trim() && result.value) {
          await convert(newPrecision)
        }
      }
    )

    // 9. Special case for CSS units
    if (converterType === 'css-units') {
      const baseFontSize = ref<number>(converterOptions.baseFontSize.value)

      const updateBaseFontSize = async (size: number): Promise<void> => {
        baseFontSize.value = size
        await setBaseFontSize(size)
        if (inputValue.value.trim()) await convert()
      }

      // Add watcher on baseFontSize that triggers reconversion
      watch(baseFontSize, async () => {
        if (inputValue.value.trim()) await convert()
      })

      // 10. Return typed converter instance (extended for CSS units)
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
        reset,

        // CSS units specific
        baseFontSize: readonly(baseFontSize),
        updateBaseFontSize
      } as CssUnitsConverterInstance
    }

    // 10. Return typed converter instance (standard)
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
}