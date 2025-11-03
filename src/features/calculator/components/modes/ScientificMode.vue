<template>
  <div class="flex flex-col gap-1">

    <div class="grid grid-cols-3 gap-1 h-8">
      <button
        class="calc-function-btn calc-btn calc-btn-top"
        @click="options.cycleAngleMode">
        <span>{{ options.angleDisplayMode }}</span>
      </button>
      <button
        class="calc-function-btn calc-btn calc-btn-top"
        @click="options.cycleNotationMode">
        <span>{{ options.notationDisplayMode }}</span>
      </button>

      <BaseDropdown
        label="M"
        content-class="w-auto"
        trigger-class="calc-function-btn calc-btn calc-btn-top w-full h-full"
        :use-default-styling="false"
        @item-select="handleClick">
        <div class="grid grid-cols-5 gap-1 p-1 min-w-[200px]">
          <BaseDropdownItem
            v-for="op in memoryOperations"
            :key="op"
            :label="op"
            :value="op"
            :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
            item-class="calc-dropdown-item-small"
            @select="handleClick" />
        </div>
      </BaseDropdown>
    </div>

    <div class="grid grid-cols-2 gap-1 h-10">

      <BaseDropdown
        label="Trigonometry"
        :icon="LucideTriangle"
        full-width
        content-class="w-[220px] bg-background border border-border shadow-lg rounded-lg"
        trigger-class="calc-function-btn calc-btn w-full h-full"
        @item-select="handleTrigFunction">
        <template #header>
          <div class="grid grid-cols-2 gap-1 p-2">
            <CalculatorButton
              value="HYP"
              variant="function"
              size="sm"
              :class="[options.hyperbolicMode.value ? 'calc-active-btn': '']"
              @click="options.toggleHyperbolicMode">
              HYP
            </CalculatorButton>
            <CalculatorButton
              value="2nd"
              variant="function"
              size="sm"
              :class="{ 'calc-active-btn': trigSecondFunctionActive }"
              @click="toggleTrigSecondFunction">
              <span>2<sup>nd</sup></span>
            </CalculatorButton>
          </div>
        </template>

        <div class="grid grid-cols-3 gap-0.5 p-1">
          <BaseDropdownItem
            v-for="func in currentTrigFunctions"
            :key="func.value"
            :value="func.value"
            item-class="calc-dropdown-item"
            @select="handleTrigFunction">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="func.display || func.value"></span>
          </BaseDropdownItem>
        </div>
      </BaseDropdown>

      <BaseDropdown
        label="Functions"
        :icon="LucideSquareFunction"
        full-width
        content-class="w-[240px] bg-background border border-border shadow-lg rounded-lg"
        trigger-class="calc-function-btn calc-btn w-full h-full"
        @item-select="handleClick">
        <div class="grid grid-cols-2 gap-1 p-0.5">
          <BaseDropdownItem
            v-for="func in functionsList"
            :key="func.value"
            :value="func.value"
            item-class="calc-dropdown-item"
            @select="handleClick">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="func.display || func.value"></span>
          </BaseDropdownItem>
        </div>
      </BaseDropdown>
    </div>

    <div class="grid grid-cols-5 gap-1 flex-grow">

      <div class="flex flex-col gap-1">
        <CalculatorButton
          value="2nd"
          variant="function"
          :class="{ 'calc-active-btn': secondFunctionActive }"
          @click="toggleSecondFunction">
          <span>2<sup>nd</sup></span>
        </CalculatorButton>

        <CalculatorButton
          v-for="func in scientificFunctions"
          :key="func.primary"
          :value="secondFunctionActive ? func.secondary : func.primary"
          :disabled="shouldDisableButton(secondFunctionActive ? func.secondary : func.primary, 'function')"
          variant="function"
          @click="handleClick">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="secondFunctionActive ? func.secondaryDisplay : func.primaryDisplay"></span>
        </CalculatorButton>
      </div>

      <div class="col-span-4 grid grid-cols-4 gap-1">

        <CalculatorButton
          v-for="(btn, index) in reactiveButtonRow"
          :key="index"
          :value="btn.value"
          :variant="btn.variant"
          :disabled="shouldDisableButton(btn.value, btn.variant)"
          @click="handleClick">
          <span>{{ btn.display || btn.value }}</span>
        </CalculatorButton>

        <CalculatorButton
          v-for="(btn, index) in scientificSecondRow"
          :key="index"
          :value="btn.value"
          :icon="btn.icon"
          :variant="btn.variant"
          :disabled="shouldDisableButton(btn.value, btn.variant)"
          @click="handleClick" />

        <CalculatorButton
          v-for="(btn, index) in scientificThirdRow"
          :key="index"
          :value="btn.value"
          :variant="btn.variant"
          :disabled="shouldDisableButton(btn.value, btn.variant)"
          @click="handleClick" />

        <template
          v-for="(row, rowIndex) in numberRows"
          :key="`row-${rowIndex}`">
          <CalculatorButton
            v-for="(btn, btnIndex) in row"
            :key="`row-${rowIndex}-btn-${btnIndex}`"
            :value="btn.value"
            :disabled="shouldDisableButton(btn.value, btn.variant)"
            :variant="btn.variant"
            @click="handleClick" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { CalculatorButton } from '@calculator/components'
import { BaseDropdown, BaseDropdownItem } from '@components/ui'
import {
  LucideTriangle,
  LucideSquareFunction
} from 'lucide-vue-next'
import {
  numberRows,
  scientificSecondRow,
  scientificThirdRow,
  memoryOperations,
  scientificFunctions,
  primaryTrigFunctions,
  secondaryTrigFunctions,
  primaryHyperbolicFunctions,
  secondaryHyperbolicFunctions,
  functionsList
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

const options = inject('calculatorOptions')

const secondFunctionActive = ref(false)
const trigSecondFunctionActive = ref(false)

const isMaxLengthReached = computed(() =>
  props.inputLength >= props.maxLength
)

const alwaysEnabledButtons = new Set([
  'C', 'CE', 'backspace', '=',
  'MC', 'MR', 'M+', 'M-', 'MS',
  '2nd', 'HYP'
])

const shouldDisableButton = (value, variant, checkMaxLength = false) => {
  if (alwaysEnabledButtons.has(value)) {
    return false
  }

  return isMaxLengthReached.value && (
    variant === 'number' ||
    variant === 'operator' ||
    variant === 'function' ||
    checkMaxLength === true
  )
}

const reactiveButtonRow = computed(() => [
  { value: '(', variant: 'function', checkMaxLength: true },
  { value: ')', variant: 'function', checkMaxLength: true },
  {
    value: secondFunctionActive.value ? ',' : 'n!',
    display: secondFunctionActive.value ? ',' : 'n!',
    variant: 'function',
    checkMaxLength: true
  },
  { value: 'C', variant: 'function' }
])

const currentTrigFunctions = computed(() => {
  if (options?.hyperbolicMode.value) {
    return trigSecondFunctionActive.value ? secondaryHyperbolicFunctions : primaryHyperbolicFunctions
  } else {
    return trigSecondFunctionActive.value ? secondaryTrigFunctions : primaryTrigFunctions
  }
})

const handleClick = value => {
  emit('button-click', value)
}

const handleTrigFunction = value => {
  emit('button-click', value)
}

const toggleSecondFunction = () => {
  secondFunctionActive.value = !secondFunctionActive.value

  if (secondFunctionActive.value) {
    setTimeout(() => {
      secondFunctionActive.value = false
    }, 30000)
  }
}

const toggleTrigSecondFunction = () => {
  trigSecondFunctionActive.value = !trigSecondFunctionActive.value
}
</script>
