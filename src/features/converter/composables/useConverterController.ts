import { ref, watch, computed, type ComputedRef } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { ConverterFactory } from '../services/factory/ConverterFactory'
import { useConverterOptions } from './useConverterOptions'
import { useDisplayFormatter } from '@calculator/services/display/DisplayFormatter'
import { ConverterConstants } from '../lib/constants'
import type { ConverterType, ConversionResult, ConversionUnit } from '../types'
import type { UseConverterStateReturn } from './useConverterState'
import { isCssUnitConverter } from '../services/converters/BaseConverter'

export interface UseConverterControllerReturn {
    converter: ComputedRef<import('../services/converters/BaseConverter').BaseConverter | null>
    availableUnits: ComputedRef<ConversionUnit[]>
    availableTypes: ConverterType[]
    convert: () => Promise<void>
    setFromUnit: (unitId: string) => Promise<void>
    setToUnit: (unitId: string) => Promise<void>
    flipUnits: () => void
    setInput: (value: string) => void
    setActiveConverter: (type: ConverterType) => void
}

export function useConverterController(
    state: UseConverterStateReturn['state'],
    updateState: UseConverterStateReturn['updateState']
): UseConverterControllerReturn {
    const converter = ref<import('../services/converters/BaseConverter').BaseConverter | null>(null)
    const options = useConverterOptions()
    const { formatDecimalNumber } = useDisplayFormatter()

    const hasInput = () => state.input.trim().length > 0

    const formatWithPrecision = (value: number, precision: number): string => {
        const fixed = value.toFixed(precision)
        return fixed.replace(/(?:\.0+|(\.\d*?[1-9])0+)$/, '$1')
    }

    const createConverter = (type: ConverterType) => ConverterFactory.create(type)

    const initializeConverter = async (type: ConverterType) => {
        converter.value = createConverter(type)

        if (converter.value) {
            updateState({
                fromUnit: converter.value.defaultFromUnit,
                toUnit: converter.value.defaultToUnit
            })

            if (isCssUnitConverter(converter.value)) {
                converter.value.setBaseFontSize(options.baseFontSize.value)
            }
        }

        if (hasInput()) await convert()
    }

    const convert = async (): Promise<void> => {
        const conv = converter.value
        if (!conv) return

        const numericValue = parseFloat(state.input)
        if (!Number.isFinite(numericValue)) {
            updateState({
                error: ConverterConstants.ERROR_MESSAGES.INVALID_VALUE,
                result: null,
                isConverting: false
            })
            return
        }

        const fromUnitObj = conv.units.find(u => u.id === state.fromUnit)
        const toUnitObj = conv.units.find(u => u.id === state.toUnit)
        if (!fromUnitObj || !toUnitObj) {
            updateState({
                error: ConverterConstants.ERROR_MESSAGES.INVALID_UNIT,
                result: null,
                isConverting: false
            })
            return
        }

        updateState({ isConverting: true, error: '' })

        try {
            const convertedValue = await conv.convert(numericValue, state.fromUnit, state.toUnit)
            const precision = options.precision.value
            const useSeparators = options.showThousandSeparators.value
            const formattedValue = formatDecimalNumber(
                formatWithPrecision(convertedValue, precision),
                useSeparators
            )

            const result: ConversionResult = {
                value: convertedValue,
                formattedValue,
                fromUnit: fromUnitObj,
                toUnit: toUnitObj
            }

            updateState({ result, error: '' })
        } catch (error) {
            updateState({
                error: error instanceof Error ? error.message : ConverterConstants.ERROR_MESSAGES.CONVERSION_FAILED,
                result: null
            })
        } finally {
            updateState({ isConverting: false })
        }
    }

    watch(() => state.activeConverter, (newType) => {
        initializeConverter(newType)
    }, { immediate: true })

    watch(options.precision, async () => {
        if (hasInput() && state.result && !state.isConverting) {
            await convert()
        }
    })

    watch(options.baseFontSize, async (newSize) => {
        const conv = converter.value
        if (conv && state.activeConverter === 'css-units' && isCssUnitConverter(conv)) {
            conv.setBaseFontSize(newSize)
            if (hasInput() && state.result && !state.isConverting) {
                await convert()
            }
        }
    }, { immediate: true })

    watchDebounced(
        [options.autoConvert, () => state.input],
        async ([autoConvertEnabled, input]) => {
            if (!converter.value) return
            if (autoConvertEnabled && input.trim()) await convert()
        },
        { debounce: 300, immediate: true }
    )

    const availableUnits = computed(() => converter.value?.units ?? [])
    const availableTypes = ConverterFactory.getAvailableTypes()

    const setFromUnit = async (unitId: string): Promise<void> => {
        if (availableUnits.value.some(u => u.id === unitId)) {
            updateState({ fromUnit: unitId })
            if (hasInput()) await convert()
        }
    }

    const setToUnit = async (unitId: string): Promise<void> => {
        if (availableUnits.value.some(u => u.id === unitId)) {
            updateState({ toUnit: unitId })
            if (hasInput()) await convert()
        }
    }

    const flipUnits = (): void => {
        updateState({
            fromUnit: state.toUnit,
            toUnit: state.fromUnit
        })

        if (state.result && options.swapUnitsOnFlip.value) {
            updateState({ input: state.result.formattedValue })
        }

        if (hasInput()) {
            void convert()
        }
    }

    const setInput = (value: string): void => {
        updateState({ input: value, error: '' })
    }

    const setActiveConverter = (type: ConverterType): void => {
        updateState({
            activeConverter: type,
            input: '0',
            result: null,
            error: ''
        })
    }

    return {
        converter: computed(() => converter.value),
        availableUnits,
        availableTypes,
        convert,
        setFromUnit,
        setToUnit,
        flipUnits,
        setInput,
        setActiveConverter
    }
}
