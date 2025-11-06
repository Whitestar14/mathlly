import { ref, watch, computed, type ComputedRef } from 'vue'
import { ConverterFactory } from '../services/factory/ConverterFactory'
import { useConverterOptions } from './useConverterOptions'
import { useDisplayFormatter } from '@calculator/services/display/DisplayFormatter'
import { ConverterConstants } from '../lib/constants'
import type { ConverterType, ConversionResult, ConversionUnit } from '../types'
import type { UseConverterStateReturn } from './useConverterState'

export interface UseConverterControllerReturn {
    converter: ComputedRef<import('../services/converters/BaseConverter').BaseConverter | null>
    availableUnits: ComputedRef<ConversionUnit[]>
    availableTypes: ConverterType[]
    convert: () => Promise<void>
    setFromUnit: (unitId: string) => void
    setToUnit: (unitId: string) => void
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

    // Initialize converter and ensure it's imported
    const createConverter = (type: ConverterType) => {
        return ConverterFactory.create(type)
    }

    // Initialize default units when converter changes
    const initializeConverter = (type: ConverterType) => {
        converter.value = createConverter(type)
        if (converter.value) {
            updateState({
                fromUnit: state.fromUnit || converter.value.defaultFromUnit,
                toUnit: state.toUnit || converter.value.defaultToUnit
            })
        }
    }

    // Watch for converter type changes
    watch(() => state.activeConverter, (newType) => {
        initializeConverter(newType)
    }, { immediate: true })

    // Computed properties
    const availableUnits = computed(() => converter.value?.units || [])
    const availableTypes = ConverterFactory.getAvailableTypes()

    // Main conversion logic
    const convert = async (): Promise<void> => {
        if (!converter.value) return

        const numericValue = parseFloat(state.input) || 0

        if (!isFinite(numericValue)) {
            updateState({
                error: ConverterConstants.ERROR_MESSAGES.INVALID_VALUE,
                result: null,
                isConverting: false
            })
            return
        }

        // Validate units exist
        const fromUnitObj = converter.value.units.find(u => u.id === state.fromUnit)
        const toUnitObj = converter.value.units.find(u => u.id === state.toUnit)

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
            const convertedValue = await converter.value.convert(
                numericValue,
                state.fromUnit,
                state.toUnit
            )

            const precision = options.precision.value
            const formattedValue = formatDecimalNumber(convertedValue.toFixed(precision), true)

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

    // Unit management
    const setFromUnit = (unitId: string): void => {
        if (availableUnits.value.find(u => u.id === unitId)) {
            updateState({ fromUnit: unitId })
        }
    }

    const setToUnit = (unitId: string): void => {
        if (availableUnits.value.find(u => u.id === unitId)) {
            updateState({ toUnit: unitId })
        }
    }

    const flipUnits = (): void => {
        const temp = state.fromUnit
        updateState({
            fromUnit: state.toUnit,
            toUnit: temp
        })

        // Swap input/output values if there's a result
        if (state.result && options.swapUnitsOnFlip.value) {
            updateState({ input: state.result.formattedValue })
        }
    }

    const setInput = (value: string): void => {
        updateState({ input: value, error: '' })
    }

    const setActiveConverter = (type: ConverterType): void => {
        updateState({ activeConverter: type })
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