import {
  computed,
  nextTick,
  watch,
  shallowRef,
  onMounted,
  onUnmounted,
  type ComputedRef,
  type Ref
} from 'vue'
import { useKeyboardStore } from '@stores/keyboard'
import { useMemoize, useThrottleFn } from '@vueuse/core'
import { useDisplayFormatter } from '@calculator/services/display/DisplayFormatter'
import { CalculatorUtils } from '@calculator/utils/constants/CalculatorUtils'
import { useCalculatorOptions } from './useCalculatorOptions'
import type { Calculator } from '@calculator/services/factory/CalculatorFactory'
import type { CalculatorResult } from '@calculator/services/factory/CalculatorFactory'
import { isProgrammerCalculator } from '@calculator/services/factory/CalculatorFactory'
import type {
  CalculatorState,
  Base,
  CalculatorMode
} from './useCalculatorState'
import type { UseMemoryUIReturn } from './useMemoryUI'

interface HistoryService {
  addToHistory: (
    expression: string,
    result: string,
    mode: CalculatorMode,
    base?: string,
    baseValues?: Record<string, string>
  ) => Promise<void>;
}

interface ControllerOptions {
  state: CalculatorState;
  calculator: Ref<Calculator>;
  updateState: (updates: Partial<CalculatorState>) => void;
  setAnimation: (result: string) => void;
  updateDisplayValues: (values: Record<string, any>) => void;
  setActiveBase: (base: Base) => void;
  historyService: HistoryService;
  memoryService: UseMemoryUIReturn;
  toggleActivity: () => void;
}

interface ControllerReturn {
  input: ComputedRef<string>;
  preview: ComputedRef<string>;
  animatedResult: ComputedRef<string>;
  handleButtonClick: (btn: string) => void;
  handleBaseChange: (newBase: Base) => void;
}

export function CalculatorController(
  options: ControllerOptions
): ControllerReturn {
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

  const calculatorOptions = useCalculatorOptions()
  const keyboard = useKeyboardStore()
  const displayFormatter = useDisplayFormatter()
  const displayRefresh = useThrottleFn(updateDisplayFn, 100)

  const handleButtonClick = (btn: string): void => {
    try {
      if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn)) {
        const result = memoryService.handleMemoryOperation({
          operation: btn,
          mode: state.mode,
          calculator: calculator.value,
          currentInput: state.input,
          activeBase: state.activeBase
        })
        updateState({ input: result.input, error: result.error || '' })
        if (result.displayValues) {
          nextTick(() => updateDisplayValues(result.displayValues!))
        }
        return
      }

      const result = calculator.value.handleButtonClick(btn)
      updateState({ input: result.input, error: result.error || '' })

      if (btn === '=' && state.mode === 'Programmer') {
        if (result.displayValues) {
          updateDisplayValues(result.displayValues)
          setAnimation(result.result!)
        }
      } else if (state.mode === 'Programmer') {
        nextTick(() => displayRefresh())
      }

      if (btn === '=' && state.mode !== 'Programmer' && result.result) {
        historyService.addToHistory(result.expression!, result.result, state.mode)
        setAnimation(result.result)
      }

      if (btn === '=' && state.mode === 'Programmer' && result.result && isProgrammerCalculator(calculator.value)) {
        const baseValues = Object.entries(calculator.value.states).reduce((acc, [base, state]) => {
          acc[base] = state.display
          return acc
        }, {} as Record<string, string>)

        historyService.addToHistory(
          result.expression!,
          result.result,
          state.mode,
          state.activeBase,
          baseValues
        )
        setAnimation(result.result)
      }
    } catch(err) {
      console.error('Calculator operation error:', err)
      updateState({ input: 'Error', error: 'Operation failed' })
    }
  }

  const handleBaseChange = (newBase: Base): void => {
    if (
      state.mode === 'Programmer' &&
      isProgrammerCalculator(calculator.value)
    ) {
      const result = calculator.value.handleBaseChange(newBase)
      setActiveBase(newBase)
      updateState({
        input: result.input,
        error: result.error || '',
        displayValues: result.displayValues
      })
    }
  }

  function updateDisplayFn(): void {
    if (
      state.mode === 'Programmer' &&
      state.input !== 'Error' &&
      isProgrammerCalculator(calculator.value)
    ) {
      try {
        const updatedValues = calculator.value.updateDisplayValues(state.input)
        updateDisplayValues(updatedValues)
      } catch(error) {
        console.error('Error updating display values:', error)
      }
    }
  }

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

  const getFormattingOptions = () => {
    return {
      base: state.activeBase,
      mode: state.mode,
      precision: calculatorOptions.precision.value,
      useThousandsSeparator:
        calculatorOptions.useThousandsSeparator.value,
      notationMode: calculatorOptions.notationMode.value,
      useFractions: calculatorOptions.useFractions.value,
      formatProgrammerNumbers: calculatorOptions.formatProgrammerNumbers.value
    }
  }

  const formatDisplayText = computed(() => {
    const options = getFormattingOptions()
    return (value: string | number): string => {
      if (!value && value !== 0) return '0'
      if (value === 'Error') return value
      try {
        return displayFormatter.format(value, options)
      } catch(err) {
        console.error('Error formatting display text:', err)
        return String(value)
      }
    }
  })

  const preview: ComputedRef<string> = computed(() => {
    const rawPreview = calculatePreview(
      state.input,
      state.mode,
      state.activeBase
    )
    if (!rawPreview) return ''
    return formatDisplayText.value(rawPreview)
  })

  const input: ComputedRef<string> = computed(() => {
    return formatDisplayText.value(state.input || '0')
  })

  const mode = shallowRef<CalculatorMode>(state.mode)
  const activeBase = shallowRef<Base>(state.activeBase)

  const numpadMap: Record<string, string> = {
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadDecimal: '.'
  }

  function normalizeInput(e: KeyboardEvent): string {
    const raw = numpadMap[e.code] ?? e.key

    if (raw === '*') return '×'
    if (raw === '/') return '÷'

    return raw
  }

  function calculatorInputProxy(e: KeyboardEvent) {
    const v = normalizeInput(e)

    if (v === '=') {
      handleButtonClick('=')
      return
    }

    if (state.mode === 'Programmer') {
      if (
        CalculatorUtils.isOperator(v) ||
        v === '(' ||
        v === ')' ||
        CalculatorUtils.isValidForBase(v, state.activeBase)
      ) {
        handleButtonClick(v)
      }
    } else {
      if (
        /^[0-9]$/.test(v) ||
        CalculatorUtils.isOperator(v) ||
        v === '(' ||
        v === ')' ||
        v === '.'
      ) {
        handleButtonClick(v)
      }
    }
  }

  onMounted(() => {
    keyboard.pushContext('calculator')
    keyboard.enableTextInput('calculator', /^[0-9a-zA-Z+\-*/=().]$/, { preventDefault: true })

    keyboard.attachAllForContext('calculator', {
      Enter: () => handleButtonClick('='),
      Escape: () => handleButtonClick('C'),
      Backspace: () => handleButtonClick('backspace'),
      'Ctrl+Shift+A': () => toggleActivity()
    })

    keyboard.attachAllForContext('calculator.programmer', {
      'Ctrl+1': () => handleBaseChange('HEX'),
      'Ctrl+2': () => handleBaseChange('DEC'),
      'Ctrl+3': () => handleBaseChange('OCT'),
      'Ctrl+4': () => handleBaseChange('BIN')
    })

    keyboard.setInputProxy('calculator', calculatorInputProxy)
  })

  onUnmounted(() => {
    keyboard.popContext('calculator')
  })

  watch(
    () => state.mode,
    (newMode: CalculatorMode) => {
      mode.value = newMode
      if (newMode === 'Programmer') {
        keyboard.pushContext('calculator.programmer')
      } else {
        keyboard.popContext('calculator.programmer')
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
  watch(
    () => getFormattingOptions(),
    () => {
      calculatePreview.clear?.()
    },
    { deep: true }
  )

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
    handleBaseChange
  }
}

export type { ControllerOptions, ControllerReturn, CalculatorResult }
