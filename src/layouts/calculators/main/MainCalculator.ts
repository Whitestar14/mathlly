import { computed, nextTick, watch, shallowRef, type Ref, type ComputedRef } from 'vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useEventListener, useMemoize, useThrottleFn } from '@vueuse/core'
import { DisplayFormatter } from '@/services/display/DisplayFormatter'
import { CalculatorUtils } from '@/utils/constants/CalculatorUtils'
import { useCalculatorOptions } from '@/composables/useCalculatorOptions'
import type { Calculator } from '@/services/factory/CalculatorFactory'
import { isProgrammerCalculator } from '@/services/factory/CalculatorFactory'
// Import types from useCalculatorState to align interfaces
import type { 
  CalculatorState, 
  Base,
  CalculatorMode
} from '@/composables/useCalculatorState'
// Import memory types to align interfaces
import type { 
  UseMemoryReturn,
  MemoryOperationResult 
} from '@/composables/useMemory'

interface CalculatorResult {
  input: string
  error?: string
  result?: string
  expression?: string
  displayValues?: Record<string, any>
}

// Use the same interface structure as useMemory
interface MemoryOperationParams {
  operation: string
  mode: CalculatorMode
  calculator: Calculator
  currentInput: string
  activeBase?: string
}

interface HistoryService {
  addToHistory: (expression: string, result: string) => void
}

interface ControllerOptions {
  state: CalculatorState
  calculator: Ref<Calculator>
  updateState: (updates: Partial<CalculatorState>) => void
  setAnimation: (result: string) => void
  updateDisplayValues: (values: Record<string, any>) => void
  setActiveBase: (base: Base) => void
  historyService: HistoryService
  memoryService: UseMemoryReturn // Use the actual return type from useMemory
  toggleActivity: () => void
}

interface ControllerReturn {
  input: ComputedRef<string>
  preview: ComputedRef<string>
  animatedResult: ComputedRef<string>
  handleButtonClick: (btn: string) => void
  handleClear: () => void
  handleBaseChange: (newBase: Base) => void
}

/**
 * Provides unified calculator functionality for MainCalculator component
 */
export function CalculatorController(options: ControllerOptions): ControllerReturn {
  const {
    state,
    calculator,
    updateState,
    setAnimation,
    updateDisplayValues,
    setActiveBase,
    historyService,
    memoryService,
    toggleActivity
  } = options

  // Get reactive calculator options
  const calculatorOptions = useCalculatorOptions()

  const displayRefresh = useThrottleFn(updateDisplayFn, 100)

  /**
   * Handle button clicks with performance optimizations
   */
  const handleButtonClick = (btn: string): void => {
    try {
      // Handle memory operations
      if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn)) {
        const result = memoryService.handleMemoryOperation({
          operation: btn,
          mode: state.mode,
          calculator: calculator.value,
          currentInput: state.input,
          activeBase: state.activeBase
        })

        updateState({
          input: result.input,
          error: result.error || ""
        })

        // For Programmer mode memory recall, update display values
        if (result.displayValues) {
          nextTick(() => updateDisplayValues(result.displayValues!))
        }
        
        return
      }
      
      // Use calculator's button click handler
      const result = calculator.value.handleButtonClick(btn)

      // Update state with result
      updateState({
        input: result.input,
        error: result.error || ""
      })

      // Handle special cases for Programmer mode
      if (btn === "=" && state.mode === "Programmer") {
        if (result.displayValues) {
          updateDisplayValues(result.displayValues)
          setAnimation(result.result!)
        }
      } else if (state.mode === "Programmer") {
        // Update display values for programmer mode - throttled for performance
        nextTick(() => displayRefresh())
      }

      // Add to history for standard mode calculations
      if (btn === "=" && state.mode !== "Programmer" && result.result) {
        historyService.addToHistory(result.expression!, result.result)
        setAnimation(result.result)
      }
    } catch (err) {
      console.error("Calculator operation error:", err)
      updateState({
        input: "Error",
        error: "Operation failed"
      })
    }
  }

  /**
   * Handle clear button - simplified
   */
  const handleClear = (): void => {
    const result = calculator.value.handleButtonClick('AC')
    updateState({
      input: result.input,
      error: ''
    })

    if (state.mode === 'Programmer') {
      displayRefresh()
    }
  }

  /**
   * Handle base change for programmer mode - optimized
   */
  const handleBaseChange = (newBase: Base): void => {
    if (state.mode === 'Programmer' && isProgrammerCalculator(calculator.value)) {
      const result = calculator.value.handleBaseChange(newBase)
      setActiveBase(newBase)
      
      updateState({
        input: result.input,
        error: result.error || '',
        displayValues: result.displayValues
      })
    }
  }

  /**
   * Update programmer display values - extracted for throttling
   */
  function updateDisplayFn(): void {
    if (state.mode === 'Programmer' && state.input !== 'Error' && isProgrammerCalculator(calculator.value)) {
      try {
        const updatedValues = calculator.value.updateDisplayValues(state.input)
        updateDisplayValues(updatedValues)
      } catch (error) {
        console.error('Error updating display values:', error)
      }
    }
  }

  /**
   * Memoized preview calculation function with improved caching
   */
  const calculatePreview = useMemoize(
    (input: string, mode: string, activeBase: string): string => {
      if (input === 'Error' || !input) return ''
      
      try {
        if (mode === 'Programmer') {
          const result = calculator.value.evaluateExpression(input, activeBase)
          return calculator.value.formatResult(result, activeBase)
        } else {
          const result = calculator.value.evaluateExpression(input)
          return calculator.value.formatResult(result)
        }
      } catch {
        return ''
      }
    }
  )

  /**
   * Get formatting options from settings
   */
  const getFormattingOptions = () => {
    return {
      base: state.activeBase,
      mode: state.mode,
      precision: calculatorOptions.precision.value,
      useThousandsSeparator: calculatorOptions.useThousandsSeparator.value,
      notationMode: calculatorOptions.notationMode.value,
      useFractions: calculatorOptions.useFractions.value,
      formatBinary: calculatorOptions.formatBinary.value,
      formatHexadecimal: calculatorOptions.formatHexadecimal.value,
      formatOctal: calculatorOptions.formatOctal.value,
    }
  }

  /**
   * Format text for display with centralized formatting logic
   */
  const formatDisplayText = computed(() => {
    // Create reactive dependency on formatting options
    const options = getFormattingOptions()
    
    return (value: string | number): string => {
      if (!value && value !== 0) return '0'
      if (value === 'Error') return value
      
      try {
        return DisplayFormatter.format(value, options)
      } catch (err) {
        console.error('Error formatting display text:', err)
        return String(value)
      }
    }
  })

  /**
   * Computed preview value with proper formatting
   */
  const preview: ComputedRef<string> = computed(() => {
    const rawPreview = calculatePreview(state.input, state.mode, state.activeBase)
    if (!rawPreview) return ''
    
    return formatDisplayText.value(rawPreview)
  })

  /**
   * Computed formatted input based on settings
   */
  const input: ComputedRef<string> = computed(() => {
    return formatDisplayText.value(state.input || '0')
  })

  // Use proper CalculatorMode type
  const mode = shallowRef<CalculatorMode>(state.mode)
  const activeBase = shallowRef<Base>(state.activeBase)

  /**
   * Set up keyboard handlers
   */
  const { setContext, clearContext } = useKeyboard('calculator', {
    clear: handleClear,
    calculate: () => handleButtonClick('='),
    backspace: () => handleButtonClick('backspace'),
    input: (value: string) => {
      if (mode.value === 'Programmer') {
        // Allow operators and valid digits for the current base
        if (CalculatorUtils.isOperator(value) || 
            value === '(' || 
            value === ')' ||
            CalculatorUtils.isValidForBase(value, activeBase.value)) {
          handleButtonClick(value)
        }
      } else {
        handleButtonClick(value)
      }
    },
    setBase: handleBaseChange,
    toggleActivity
  })

  watch(
    () => state.mode,
    (newMode: CalculatorMode) => {
      mode.value = newMode
      if (newMode === 'Programmer') {
        setContext('programmer')
      } else {
        clearContext('programmer')
      }
    },
    { immediate: true }
  )

  watch(
    () => state.activeBase,
    (newBase: Base) => {
      activeBase.value = newBase
    }
  )

  /**
   * Clear preview cache when formatting options change
   */
  watch(() => getFormattingOptions(), () => {
    calculatePreview.clear?.()
  }, { deep: true })

  /**
   * Handle keyboard shortcuts for base changes - throttled for performance
   */
  const handleKeyboardShortcuts = useThrottleFn((e: KeyboardEvent) => {
    if (mode.value !== 'Programmer') return

    const shortcuts: Record<string, () => void> = {
      'ctrl+1': () => handleBaseChange('HEX'),
      'ctrl+2': () => handleBaseChange('DEC'),
      'ctrl+3': () => handleBaseChange('OCT'),
      'ctrl+4': () => handleBaseChange('BIN')
    }

    const combo = [
      e.ctrlKey && 'ctrl',
      e.altKey && 'alt',
      e.shiftKey && 'shift',
      e.key.toLowerCase()
    ].filter(Boolean).join('+')

    const action = shortcuts[combo]
    if (action) {
      e.preventDefault()
      action()
    }
  }, 100)

  // Set up keyboard event listener
  useEventListener('keydown', handleKeyboardShortcuts)

  /**
   * Computed animated result for display animations
   */
  const animatedResult: ComputedRef<string> = computed(() => {
    if (!state.animatedResult) return ''
    return formatDisplayText.value(state.animatedResult)
  })

  return {
    input,
    preview,
    animatedResult,
    handleButtonClick,
    handleClear,
    handleBaseChange
  }
}

// Export types for external use
export type {
  ControllerOptions,
  ControllerReturn,
  CalculatorResult,
  MemoryOperationParams,
  MemoryOperationResult
}
