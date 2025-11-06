import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { ConverterRegistry } from '@converter/services/ConverterRegistry'
import type { ConverterType, ConverterConfig } from '@converter/types'
import { useTemperatureConverter, type UseTemperatureConverterReturn } from './useTemperatureConverter'
import { useLengthConverter, type UseLengthConverterReturn } from './useLengthConverter'
import { useWeightConverter, type UseWeightConverterReturn } from './useWeightConverter'
import { useCssUnitsConverter, type UseCssUnitsConverterReturn } from './useCssUnitsConverter'
import { useConverterTypeSwitcher } from './useConverterTypeSwitcher'

export interface UseConverterStateReturn {
  activeConverterType: Readonly<Ref<ConverterType>>
  activeConverter: ComputedRef<UseTemperatureConverterReturn | UseLengthConverterReturn | UseWeightConverterReturn | UseCssUnitsConverterReturn>
  converterConfig: ComputedRef<ConverterConfig | undefined>
  setActiveConverterType: (type: ConverterType) => void
  resetActiveConverter: () => void
  getAllConverters: () => Record<string, any>
}

export function useConverterState(): UseConverterStateReturn {
  // State
  const { currentConverterType, updateConverterType } = useConverterTypeSwitcher()

  // Composable Instances
  const temperatureConverter = useTemperatureConverter()
  const lengthConverter = useLengthConverter()
  const weightConverter = useWeightConverter()
  const cssUnitsConverter = useCssUnitsConverter()

  // Computed Properties
  const activeConverter = computed(() => {
    switch (currentConverterType.value) {
      case 'temperature':
        return temperatureConverter
      case 'length':
        return lengthConverter
      case 'weight':
        return weightConverter
      case 'css-units':
        return cssUnitsConverter
      default:
        return temperatureConverter
    }
  })

  const converterConfig = computed(() =>
    ConverterRegistry.getInstance().get(currentConverterType.value)
  )

  // Methods
  const setActiveConverterType = (type: ConverterType): void => {
    updateConverterType(type)
    resetActiveConverter()
  }

  const resetActiveConverter = (): void => {
    activeConverter.value.reset()
  }

  const getAllConverters = (): Record<string, any> => ({
    temperature: temperatureConverter,
    length: lengthConverter,
    weight: weightConverter,
    'css-units': cssUnitsConverter
  })

  return {
    activeConverterType: currentConverterType,
    activeConverter,
    converterConfig,
    setActiveConverterType,
    resetActiveConverter,
    getAllConverters
  }
}
