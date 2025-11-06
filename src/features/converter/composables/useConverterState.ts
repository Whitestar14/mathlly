import { computed, type Ref, type ComputedRef } from 'vue'
import { ConverterRegistry } from '@converter/services/ConverterRegistry'
import type { ConverterType, ConverterConfig } from '@converter/types'
import { ConverterFactory, type ConverterInstance } from '@converter/services/factory/ConverterFactory'
import { useConverterTypeSwitcher } from './useConverterTypeSwitcher'

export interface UseConverterStateReturn {
  activeConverterType: Readonly<Ref<ConverterType>>
  activeConverter: ComputedRef<ConverterInstance>
  converterConfig: ComputedRef<ConverterConfig | undefined>
  setActiveConverterType: (type: ConverterType) => void
  resetActiveConverter: () => void
}

export function useConverterState(): UseConverterStateReturn {
  // State
  const { currentConverterType, updateConverterType } = useConverterTypeSwitcher()

  // Converters are created on-demand via factory in activeConverter computed

  // Computed Properties
  const activeConverter = computed(() => {
    return ConverterFactory.create(currentConverterType.value)
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

  return {
    activeConverterType: currentConverterType,
    activeConverter,
    converterConfig,
    setActiveConverterType,
    resetActiveConverter,
  }
}
