<template>
  <div class="flex flex-col gap-1">

    <div class="grid grid-cols-5 gap-1">
      <CalculatorButton
        v-for="op in memoryOperations"
        :key="op"
        :value="op"
        variant="memory"
        :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
        @click="handleClick">
        {{ op }}
      </CalculatorButton>
    </div>

    <div class="grid grid-cols-4 gap-1 flex-grow">

      <CalculatorButton
        v-for="(btn, index) in standardFirstRow"
        :key="index"
        :value="btn.value"
        :icon="btn.icon"
        :disabled="shouldDisableButton(btn.value, btn.variant, btn.checkMaxLength)"
        :variant="btn.variant"
        @click="handleClick" />

      <CalculatorButton
        v-for="(btn, index) in standardSecondRow"
        :key="index"
        :value="btn.value"
        :disabled="shouldDisableButton(btn.value, btn.variant, btn.checkMaxLength)"
        :variant="btn.variant"
        @click="handleClick">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="btn.display || btn.value"></span>
      </CalculatorButton>

      <template
        v-for="(row, rowIndex) in numberRows"
        :key="`row-${rowIndex}`">
        <CalculatorButton
          v-for="(btn, btnIndex) in row"
          :key="`row-${rowIndex}-btn-${btnIndex}`"
          :value="btn.value"
          :disabled="shouldDisableButton(btn.value, btn.variant, btn.checkMaxLength)"
          :variant="btn.variant"
          @click="handleClick" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CalculatorButton } from '@calculator/components'
import {
  numberRows,
  standardFirstRow,
  standardSecondRow,
  memoryOperations
} from './NumberRows'

const props = defineProps({
  inputLength: {
    type: Number,
    required: true
  },
  maxLength: {
    type: Number,
    default: 29
  },
  hasMemory: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['button-click'])

const isMaxLengthReached = computed(() =>
  props.inputLength >= props.maxLength
)

const alwaysEnabledButtons = new Set([
  'C', 'CE', 'backspace', '=',
  'MC', 'MR', 'M+', 'M-', 'MS'
])

const shouldDisableButton = (value, variant, checkMaxLength = false) => {
  if (alwaysEnabledButtons.has(value)) {
    return false
  }

  return isMaxLengthReached.value && (
    variant === 'number' ||
    variant === 'operator' ||
    checkMaxLength === true
  )
}

const handleClick = value => {
  emit('button-click', value)
}
</script>
