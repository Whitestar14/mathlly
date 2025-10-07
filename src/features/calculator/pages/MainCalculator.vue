<template>
  <BasePage 
    :title="currentMode + ' Mode'" 
    :show-header="false" 
    :show-footer="false" 
    main-class="flex"
    :is-tool-layout="true"
  >
    <!-- this teleports to header -->
    <CalculatorModeSwitcher />
    
    <div class="flex-grow flex-initial bg-background overflow-hidden transition-colors duration-300">
      <div
        class="grid grid-cols-1 h-full p-4 gap-1 mx-auto"
        :class="state.mode === 'Programmer' 
          ? 'grid-rows-[1fr_2fr]' 
          : (state.mode === 'Standard' 
            ? 'grid-rows-[1fr_3fr]' 
            : 'grid-rows-[1fr_4fr]')"
      >
        <calculator-display
          :input="input"
          :preview="preview"
          :error="state.error"
          :is-animating="state.isAnimating"
          :animated-result="animatedResult"
          :active-base="state.activeBase"
          :mode="state.mode"
          :display-values="state.displayValues"
          @open-activity="openActivity"
          @base-change="handleBaseChange"
        />

        <calculator-buttons
          :mode="state.mode"
          :input-length="state.input.length"
          :max-length="maxInputLength"
          :active-base="state.activeBase"
          :has-memory="hasMemoryValue"
          @button-click="handleButtonClick"
          @clear="handleClear"
        />
      </div>
    </div>
    
    <ActivityPanel
      :mode="state.mode"
      :is-mobile="isMobile"
      :is-open="activityPanel.isOpen"
      @history-close="activityPanel.close"
      @memory-close="activityPanel.close"
      @select-item="selectHistoryItem"
    />
  </BasePage>
</template>

<script setup lang="ts">
import { computed, watch, ref, provide, defineAsyncComponent, type Ref, type ComputedRef } from 'vue'
import { useHistory, type HistoryItem } from '@calculator/composables/useHistory'
import { useMemory } from '@calculator/composables/useMemory'
import { usePanel } from '@composables/ui/usePanel'
import type { LightweightPanelAPI } from '@composables/ui/types'
import { useCalculatorState, type CalculatorMode, type Base } from '@calculator/composables/useCalculatorState'
import { useCalculatorModeSwitcher } from '@calculator/composables/useCalculatorModeSwitcher'
import { useCalculatorOptions } from '@calculator/composables/useCalculatorOptions'
import { CalculatorController, type ControllerReturn } from '../composables/MainCalculator'
import { CalculatorFactory, type Calculator } from '@calculator/services/factory/CalculatorFactory'
import { useCalculatorSession } from '@calculator/composables/useCalculatorSession'

import {CalculatorButtons, CalculatorDisplay} from '@calculator/components'
import { BasePage } from '@components/ui'

const props = defineProps<{
  isMobile: boolean
}>()

const CalculatorModeSwitcher = defineAsyncComponent(() => import('@calculator/components/CalculatorModeSwitcher.vue'))

const ActivityPanel = defineAsyncComponent(() => import('@calculator/components/ActivityPanel.vue'))

interface HistoryService {
  addToHistory: (expression: string, result: string) => void
}

const historyService: HistoryService = useHistory()
const memoryService = useMemory()

const activityPanelResult = usePanel('activity')
const activityPanel = activityPanelResult as LightweightPanelAPI

const { currentMode } = useCalculatorModeSwitcher()

const calculatorOptions = useCalculatorOptions()

const {
  state,
  updateState,
  resetState,
  setAnimation,
  updateDisplayValues,
  setActiveBase
} = useCalculatorState(currentMode.value)

const { saveInput, getInput } = useCalculatorSession();

const createCalculator = (mode: CalculatorMode) => {
  return CalculatorFactory.create(mode)
}

const calculator: Ref<Calculator> = ref(createCalculator(currentMode.value))

provide('calculator', calculator)
provide('calculatorState', state)
provide('calculatorOptions', calculatorOptions)
provide('currentInput', computed(() => state.input))
provide('activeBase', computed(() => state.activeBase))
provide('mode', computed(() => state.mode))
provide('updateState', updateState)
provide('updateDisplayValues', updateDisplayValues)
provide('isMobile', computed(() => props.isMobile))

const controllerResult: ControllerReturn = CalculatorController({
  state,
  calculator,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  historyService,
  memoryService,
  toggleActivity: activityPanel.toggle
})

const {
  preview,
  input,
  animatedResult,
  handleClear,
  handleButtonClick,
  handleBaseChange,
} = controllerResult

const maxInputLength: ComputedRef<number> = computed(() => calculator.value.MAX_INPUT_LENGTH)
const hasMemoryValue: ComputedRef<boolean> = computed(() => memoryService.hasMemory(currentMode.value).value)

const openActivity = (): void => activityPanel.open()

watch(() => state.input, (newRawInput: string) => {
  saveInput(currentMode.value, newRawInput)
})

const handleModeChange = (newMode: CalculatorMode, oldMode?: CalculatorMode) => {
  if (oldMode) {
    saveInput(oldMode, state.input)
  }

  resetState(newMode)
  
  calculator.value = createCalculator(newMode)
  
  if (newMode === 'Programmer') {
    setActiveBase('DEC' as Base)
  }
  
  const savedInput = getInput(newMode)
  
  if (savedInput) {
    updateState({ input: savedInput })
    calculator.value.input = savedInput
    
    if (newMode === "Programmer") {
      const calc = calculator.value as any
      if (calc.states?.DEC) {
        calc.states.DEC.input = savedInput
      }
    }
  }
}

watch(() => currentMode.value, (newMode: CalculatorMode, oldMode?: CalculatorMode) => {
  handleModeChange(newMode, oldMode)
}, { immediate: true })

const selectHistoryItem = ({ expression }: HistoryItem): void => {
  if (state.mode === 'Programmer') {
    return
  }

  updateState({ 
    input: expression, 
    error: '' 
  })

  calculator.value.input = expression
  if ('currentExpression' in calculator.value) {
    calculator.value.currentExpression = ''
  }
}
</script>
