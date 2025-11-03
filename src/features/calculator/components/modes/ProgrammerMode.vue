<template>
  <div class="flex flex-col gap-1">
    <div class="flex flex-0 justify-between items-center">
      <SegmentedControl
        v-model="viewMode"
        :options="viewOptions" />

      <button
        v-if="viewMode === 'bits'"
        :value="bitWidthLabel"
        class="calc-btn calc-function-btn"
        @click="cycleBitWidth">
        {{ bitWidthLabel }}
      </button>
    </div>

    <Transition
      name="scale"
      mode="out-in">

      <div
        v-if="viewMode === 'keypad'"
        key="keypad"
        class="flex h-full w-full flex-1 flex-col gap-1">

        <div class="grid grid-cols-5 gap-1">
          <CalculatorButton
            v-for="op in memoryOperations"
            :key="op"
            :value="op"
            variant="memory"
            :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
            @click="emit('button-click', op)">
            {{ op }}
          </CalculatorButton>
        </div>

        <div class="grid grid-cols-5 gap-1 h-full">

          <div class="flex flex-col gap-1">
            <CalculatorButton
              v-for="letter in hexLetters"
              :key="letter"
              :value="letter"
              variant="function"
              :disabled="!isDigitEnabled(letter)"
              @click="emit('button-click', letter)">
              {{ letter }}
            </CalculatorButton>
          </div>

          <div class="col-span-4 grid grid-cols-4 gap-1 h-full">
            <CalculatorButton
              v-for="btn in programmerFirstRow"
              :key="btn.value"
              :value="btn.value"
              :icon="btn.icon"
              :variant="btn.variant"
              :disabled="shouldDisable(btn)"
              @click="emit('button-click', btn.value)" />
            <CalculatorButton
              v-for="btn in programmerSecondRow"
              :key="btn.value"
              :value="btn.value"
              class="h-full"
              :variant="btn.variant"
              :disabled="shouldDisable(btn)"
              @click="emit('button-click', btn.value)" />
            <CalculatorButton
              v-for="btn in numberRows.flat()"
              :key="btn.value + (btn.variant || '')"
              :value="btn.value"
              :variant="btn.variant"
              class="h-full"
              :disabled="!isDigitEnabled(btn.value) || shouldDisable(btn)"
              @click="emit('button-click', btn.value)" />
          </div>
        </div>
      </div>

      <div
        v-else-if="viewMode === 'bits'"
        key="bits"
        class="flex h-full w-full flex-1 flex-col gap-1">
        <BitToggleGrid
          :value="currentDecimalValue"
          :bit-width="bitWidth"
          @bit-toggle="handleBitToggle" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, type Component, type Ref } from 'vue'
import { CalculatorButton } from '@calculator/components'
import { SegmentedControl } from '@components/ui'
import BitToggleGrid from '@calculator/components/BitToggleGrid.vue'
import { Grid3x3, Binary } from 'lucide-vue-next'
import { numberRows, programmerFirstRow, programmerSecondRow, memoryOperations, hexLetters } from './NumberRows'
import { toggleBit } from '@calculator/utils/core/BitManipulation'
import { isProgrammerCalculator, type Calculator } from '@calculator/services/factory/CalculatorFactory'
import type { CalculatorState } from '@calculator/composables/useCalculatorState'

type BitWidthValue = 16 | 32 | 64
type ViewMode = 'keypad' | 'bits'

interface Props {
  activeBase: 'HEX' | 'DEC' | 'OCT' | 'BIN'
  inputLength: number
  maxLength: number
  hasMemory: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'button-click', value: string): void
  (e: 'clear'): void
}>()

const calculator = inject<Ref<Calculator>>('calculator')!
const updateState = inject<(updates: Partial<CalculatorState>) => void>('updateState')!
const updateDisplayValues = inject<(values: Record<string, any>) => void>('updateDisplayValues')!

const viewMode = ref<ViewMode>('keypad')

const viewOptions = computed<Array<{ value: ViewMode; label: string; icon: Component }>>(() => [
  { value: 'keypad', label: 'Keypad', icon: Grid3x3 },
  { value: 'bits', label: 'Bits', icon: Binary }
])
const bitWidth = ref<BitWidthValue>(64)

const bitWidthLabel = computed(() => {
  switch (bitWidth.value) {
    case 16: return 'WORD'
    case 32: return 'DWORD'
    case 64: return 'QWORD'
    default: return 'WORD'
  }
})

const cycleBitWidth = () => {
  if (bitWidth.value === 16) bitWidth.value = 32
  else if (bitWidth.value === 32) bitWidth.value = 64
  else bitWidth.value = 16
}

const currentDecimalValue = computed(() => {
  if (!isProgrammerCalculator(calculator.value)) return 0

  try {
    const decState = calculator.value.states.DEC
    if (!decState?.input) return 0
    return parseInt(decState.input, 10) || 0
  } catch {
    return 0
  }
})

const handleBitToggle = (bitPosition: number): void => {
  if (!isProgrammerCalculator(calculator.value)) return

  try {
    const currentValue = currentDecimalValue.value
    const newValue = toggleBit(
      currentValue,
      bitPosition,
      bitWidth.value
    )

    calculator.value.updateAllStates(newValue)
    const newInput = calculator.value.states.DEC.input

    updateState({ input: newInput })

    const updatedValues = calculator.value.updateDisplayValues(newInput)
    updateDisplayValues(updatedValues)
  } catch(err) {
    console.error('Bit toggle error:', err)
    updateState({ error: 'Bit toggle failed' })
  }
}

const isMaxLengthReached = computed(() => props.inputLength >= props.maxLength)
const alwaysEnabled = new Set([
  'C', 'CE', 'backspace', '=',
  'MC', 'MR', 'M+', 'M-', 'MS'
])

const shouldDisable = (btn: { value: string; variant?: string; checkMaxLength?: boolean }) => {
  if (alwaysEnabled.has(btn.value)) return false
  const contributesInput = btn.variant === 'number' || btn.variant === 'operator' || btn.checkMaxLength === true
  return isMaxLengthReached.value && contributesInput
}

const isDigitEnabled = (button: string) => {
  const v = button.toUpperCase()
  if (['×', '-', '+', '=', '±'].includes(button)) {
    return true
  }
  switch (props.activeBase) {
    case 'HEX': return /^[0-9A-F]$/.test(v)
    case 'DEC': return /^[0-9]$/.test(v)
    case 'OCT': return /^[0-7]$/.test(v)
    case 'BIN': return /^[01]$/.test(v)
    default: return true
  }
}
</script>
