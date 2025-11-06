<template>
  <BasePage title="Converter" :show-header="false" :is-tool-layout="true" main-class="flex p-2">
    <div class="container mx-auto max-h-full p-2 md:p-3 flex-1 overflow-hidden">
      <div class="p-2 h-full flex-1 md:p-6 rounded-lg bg-card">
        <div class="grid h-full grid-cols-1 lg:grid-cols-[5fr_3.5fr] gap-2 md:gap-12">
          <!-- Left column: Conversion panels -->
          <div class="flex flex-col gap-1">
            <div class="relative flex flex-1 flex-col gap-2">
              <ConversionPanel class="font-bold" v-model:model-value="inputValue" label="From" :units="availableUnits"
                :selected-unit="fromUnit" :read-only="false" :error="error" @update:model-value="setInputValue"
                @update:selected-unit="setFromUnit" />

              <ConversionPanel
                class="font-thin"
                :model-value="formattedResult"
                label="To"
                :units="availableUnits"
                :selected-unit="toUnit"
                :read-only="true"
                :show-convert-button="!autoConvert"
                :show-copy-button="true"
                @update:selected-unit="setToUnit"
                @convert="handleConvert"
                @copy="handleCopy" />

              <!-- Flip button -->
              <div class="absolute top-[45.5%] md:top-[46.5%] md:left-1/2 left-[47%] flex justify-center">
                <BaseButton v-tippy="{ content: 'Swap units' }" variant="primary" size="icon" class="rounded-full"
                  @click="flipUnits">
                  <ArrowDownUp class="h-4 w-4" />
                </BaseButton>
              </div>
            </div>
            <div class="flex-initial max-h-10 h-10">
              <!-- Add visualization display here -->
              <VisualizationDisplay :visualizations="visualizations" :converter-type="activeConverterType" />
            </div>
          </div>

          <!-- Right column: Numpad -->
          <div class="flex flex-1 justify-center lg:justify-end">
            <ConverterNumpad :disabled="isConverting" @button-click="handleNumpadClick" />
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowDownUp } from 'lucide-vue-next'
import { BasePage, BaseButton } from '@components/ui'
import { ConversionPanel, ConverterNumpad } from '@converter/components'
import { ConverterFactory } from '@converter/services/factory/ConverterFactory'
import { VisualizationDisplay } from '@converter/components'
import { useConverterTypeSwitcher } from '@converter/composables'
import { useConverterOptions } from '@converter/composables'
import { onMounted, onUnmounted } from 'vue'
import { useKeyboardStore } from '@stores/keyboard'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { ConverterType } from '../types'

defineProps<{
  isMobile?: boolean
}>()

// Active converter type
const { currentConverterType: activeConverterType } = useConverterTypeSwitcher()

// Load options
const { autoConvert } = useConverterOptions()

// Computed active converter
const activeConverter = computed(() => {
  return ConverterFactory.create(activeConverterType.value)
})

// Load options

const keyboard = useKeyboardStore()
const { copy } = useClipboard()
const { toast } = useToast()

// Computed properties that reactively access activeConverter
const inputValue = computed(() => activeConverter.value.inputValue.value)
const fromUnit = computed(() => activeConverter.value.fromUnit.value)
const toUnit = computed(() => activeConverter.value.toUnit.value)
const error = computed(() => activeConverter.value.error.value)
const availableUnits = computed(() => activeConverter.value.availableUnits.value)
const formattedResult = computed(() => activeConverter.value.formattedResult.value)
const isConverting = computed(() => activeConverter.value.isConverting.value)

// Methods accessed directly from activeConverter
const setInputValue = (value: string) => activeConverter.value.setInputValue(value)
const setFromUnit = (unitId: string) => activeConverter.value.setFromUnit(unitId)
const setToUnit = (unitId: string) => activeConverter.value.setToUnit(unitId)
const flipUnits = () => activeConverter.value.flipUnits()

// Access result
const visualizations = computed(() => activeConverter.value.result.value?.visualizations)

// Handle numpad clicks
const handleNumpadClick = (value: string): void => {
  let newValue = inputValue.value

  if (value === 'CE') {
    newValue = '0'
  } else if (value === 'backspace') {
    newValue = newValue.length > 1 ? newValue.slice(0, -1) : '0'
  } else if (value === '.' && !newValue.includes('.')) {
    newValue += value
  } else if (value !== '.' && /^\d$/.test(value)) {
    newValue = newValue === '0' ? value : newValue + value
  }

  // Basic validation
  if (newValue.length > 15) return // Max length
  if (!/^-?\d*\.?\d*$/.test(newValue)) return // Valid number format

  setInputValue(newValue)
}

const handleConvert = () => {
  activeConverter.value.convert()
}

const handleCopy = async () => {
  if (!formattedResult.value || formattedResult.value === '0') {
    toast('Nothing to copy', { type: 'warning' })
    return
  }
  await copy(formattedResult.value)
  toast('Result copied to clipboard!', { type: 'success' })
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    setInputValue(text)
    toast('Pasted from clipboard!', { type: 'success' })
  } catch {
    toast('Failed to paste', { type: 'error' })
  }
}

const handleClear = () => {
  setInputValue('0')
  toast('Input cleared!', { type: 'success' })
}

const switchConverterType = (type: ConverterType) => {
  const { updateConverterType } = useConverterTypeSwitcher()
  updateConverterType(type)
}

onMounted(() => {
  keyboard.attachAllForContext('converter', {
    'Ctrl+Enter': () => handleConvert(),
    'Ctrl+F': () => flipUnits(),
    'Ctrl+C': () => handleCopy(),
    'Ctrl+V': () => handlePaste(),
    'Ctrl+1': () => switchConverterType('temperature'),
    'Ctrl+2': () => switchConverterType('length'),
    'Ctrl+3': () => switchConverterType('weight'),
    'Ctrl+4': () => switchConverterType('css-units'),
    'Ctrl+5': () => switchConverterType('currency'),
    'Escape': () => handleClear()
  })
  keyboard.pushContext('converter')
})

onUnmounted(() => {
  keyboard.popContext('converter')
})
</script>
