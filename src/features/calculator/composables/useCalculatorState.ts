import { reactive, readonly, ref, type Ref, type DeepReadonly } from 'vue'

const ANIMATION_DURATION = 500
const DEFAULT_BASE = 'DEC'
const DEFAULT_MODE = 'Standard'
const BASES = ['DEC', 'BIN', 'HEX', 'OCT'] as const

export type Base = typeof BASES[number]
export type CalculatorMode = 'Standard' | 'Scientific' | 'Programmer'

/**
 * Display values for different bases
 */
export interface BaseDisplayValues {
  input: string
  display: string
}

/**
 * Calculator state interface
 */
export interface CalculatorState {
  input: string
  error: string
  isAnimating: boolean
  animatedResult: string
  activeBase: Base
  displayValues: Record<Base, BaseDisplayValues>
  mode: CalculatorMode
}

/**
 * Partial state updates interface
 */
export type StateUpdates = Partial<CalculatorState>

/**
 * Calculator state composable return type
 */
export interface UseCalculatorStateReturn {
  state: DeepReadonly<CalculatorState>
  updateState: (updates: StateUpdates) => void
  resetState: (mode?: CalculatorMode) => void
  setAnimation: (result: string) => void
  updateDisplayValues: (values: Partial<Record<Base, BaseDisplayValues>>) => void
  setActiveBase: (base: Base) => void
}

/**
 * Creates initial state for calculator
 * @param mode - Calculator mode
 * @returns Initial state
 */
function createInitialState(mode: CalculatorMode = DEFAULT_MODE as CalculatorMode): CalculatorState {
  const initialDisplayValues: Record<Base, BaseDisplayValues> = {} as Record<Base, BaseDisplayValues>

  BASES.forEach(base => {
    initialDisplayValues[base] = { input: '0', display: '0' }
  })

  return {
    input: '0',
    error: '',
    isAnimating: false,
    animatedResult: '',
    activeBase: DEFAULT_BASE as Base,
    displayValues: initialDisplayValues,
    mode: mode
  }
}

/**
 * Provides unified state management for calculator
 * @param initialMode - Initial calculator mode
 * @returns Calculator state and methods
 */
export function useCalculatorState(initialMode?: CalculatorMode): UseCalculatorStateReturn {
  const state = reactive<CalculatorState>(createInitialState(initialMode))

  const animationTimeout: Ref<ReturnType<typeof setTimeout> | null> = ref(null)

  /**
   * Update state with partial updates
   * @param updates - Partial state updates
   */
  function updateState(updates: StateUpdates): void {
    if (updates.activeBase && !BASES.includes(updates.activeBase)) {
      console.warn(`Invalid base: ${updates.activeBase}`)
      delete updates.activeBase
    }

    Object.assign(state, updates)
  }

  /**
   * Reset state to initial values
   * @param mode - Calculator mode
   */
  function resetState(mode: CalculatorMode = state.mode): void {
    if (animationTimeout.value) {
      clearTimeout(animationTimeout.value)
      animationTimeout.value = null
    }

    const initialState = createInitialState(mode)
    Object.keys(initialState).forEach(key => {
      const stateKey = key as keyof CalculatorState
        ; (state as any)[stateKey] = initialState[stateKey]
    })
  }

  /**
   * Set animation state
   * @param result - Result to animate
   */
  function setAnimation(result: string): void {
    if (animationTimeout.value) {
      clearTimeout(animationTimeout.value)
    }

    updateState({
      isAnimating: true,
      animatedResult: result
    })

    animationTimeout.value = setTimeout(() => {
      updateState({
        isAnimating: false,
        animatedResult: ''
      })
      animationTimeout.value = null
    }, ANIMATION_DURATION)
  }

  /**
   * Update display values for programmer mode
   * @param values - New display values
   */
  function updateDisplayValues(values: Partial<Record<Base, BaseDisplayValues>>): void {
    const newValues: Record<Base, BaseDisplayValues> = { ...state.displayValues }

    Object.keys(values).forEach(baseKey => {
      const base = baseKey as Base
      if (BASES.includes(base) && values[base]) {
        newValues[base] = { ...values[base]! }
      }
    })

    updateState({
      displayValues: newValues
    })
  }

  /**
   * Set active base for programmer mode
   * @param base - New active base
   */
  function setActiveBase(base: Base): void {
    if (BASES.includes(base)) {
      updateState({
        activeBase: base
      })
    } else {
      console.warn(`Invalid base: ${base}`)
    }
  }

  return {
    state: readonly(state),
    updateState,
    resetState,
    setAnimation,
    updateDisplayValues,
    setActiveBase
  }
}

export { BASES, DEFAULT_BASE, DEFAULT_MODE, ANIMATION_DURATION }
