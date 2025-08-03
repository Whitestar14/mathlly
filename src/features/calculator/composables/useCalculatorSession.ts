import { ref, readonly, type Ref } from 'vue'
import type { CalculatorMode } from './useCalculatorState'

export function useCalculatorSession() {
  const sessionInputs: Ref<Record<CalculatorMode, string>> = ref({
    'Standard': '',
    'Programmer': '',
    'Scientific': ''
  })

  // Load all inputs from session storage on initialization
  const loadAllInputs = () => {
    const modes: CalculatorMode[] = ['Standard', 'Programmer', 'Scientific']
    modes.forEach(mode => {
      const key = `calculator-session-input-${mode}`
      const stored = sessionStorage.getItem(key)
      if (stored) {
        sessionInputs.value[mode] = stored
      }
    })
  }

  // Save input for specific mode
  const saveInput = (mode: CalculatorMode, input: string) => {
    if (input && input !== '0' && input !== 'Error') {
      sessionInputs.value[mode] = input
      sessionStorage.setItem(`calculator-session-input-${mode}`, input)
    }
  }

  // Get input for specific mode
  const getInput = (mode: CalculatorMode): string => {
    return sessionInputs.value[mode] || ''
  }

  // Initialize
  loadAllInputs()

  return {
    sessionInputs: readonly(sessionInputs),
    saveInput,
    getInput
  }
}
