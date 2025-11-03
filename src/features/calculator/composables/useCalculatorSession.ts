import { ref, readonly, type Ref } from 'vue'
import type { CalculatorMode } from './useCalculatorState'

export function useCalculatorSession() {
  const sessionInputs: Ref<Record<CalculatorMode, string>> = ref({
    'Standard': '',
    'Programmer': '',
    'Scientific': ''
  })

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

  const saveInput = (mode: CalculatorMode, input: string) => {
    if (input && input !== '0' && input !== 'Error') {
      sessionInputs.value[mode] = input
      sessionStorage.setItem(`calculator-session-input-${mode}`, input)
    }
  }

  const getInput = (mode: CalculatorMode): string => {
    return sessionInputs.value[mode] || ''
  }

  loadAllInputs()

  return {
    sessionInputs: readonly(sessionInputs),
    saveInput,
    getInput
  }
}
