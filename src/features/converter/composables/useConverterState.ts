import { reactive, readonly, type DeepReadonly } from 'vue'
import type { ConverterType, ConversionResult } from '../types'

export interface ConverterState {
  input: string
  fromUnit: string
  toUnit: string
  result: ConversionResult | null
  error: string
  isConverting: boolean
  activeConverter: ConverterType
}

export interface UseConverterStateReturn {
  state: DeepReadonly<ConverterState>
  updateState: (updates: Partial<ConverterState>) => void
  reset: () => void
}

function createInitialState(initialType: ConverterType = 'temperature'): ConverterState {
  return {
    input: '0',
    fromUnit: '',
    toUnit: '',
    result: null,
    error: '',
    isConverting: false,
    activeConverter: initialType
  }
}

export function useConverterState(initialType?: ConverterType): UseConverterStateReturn {
  const state = reactive<ConverterState>(createInitialState(initialType))

  function updateState(updates: Partial<ConverterState>): void {
    Object.assign(state, updates)
  }

  function reset(): void {
    updateState({
      input: '0',
      result: null,
      error: '',
      isConverting: false
    })
  }

  return {
    state: readonly(state),
    updateState,
    reset
  }
}
