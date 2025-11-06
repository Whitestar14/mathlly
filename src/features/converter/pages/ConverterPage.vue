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

                <ConversionPanel class="font-thin" :model-value="formattedResult" label="To" :units="availableUnits"
                :selected-unit="toUnit" :read-only="true" :show-copy-button="true" :show-refresh-button="converterType === 'currency'"
                @update:selected-unit="setToUnit" @copy="handleCopy" @refresh="handleRefreshRates" />

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
              <VisualizationDisplay :visualizations="visualizations" :converter-type="converterType" />
              <div v-show="converterType === 'currency'" class="text-xs text-muted-foreground text-center mt-1">
                Exchange rates powered by <a href="https://open.er-api.com" target="_blank" class="underline hover:no-underline">exchangerate-api.com</a>
              </div>
            </div>
          </div>

          <!-- Right column: Numpad -->
          <div class="flex flex-1 justify-center lg:justify-end">
            <ConverterNumpad :autoConvert="autoConvert" :disabled="isConverting" @button-click="handleNumpadClick" />
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowDownUp } from 'lucide-vue-next'
import { BasePage, BaseButton } from '@components/ui'
import { ConversionPanel, ConverterNumpad } from '@converter/components'
import { ConverterFactory } from '@converter/services/factory/ConverterFactory'
import { VisualizationDisplay } from '@converter/components'
import { useConverterOptions, useConverterTypeSwitcher } from '@converter/composables'
import { useKeyboardStore } from '@stores/keyboard'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { ConverterType } from '../types'

defineProps<{
  isMobile?: boolean
}>()

// Active converter type
const { currentConverterType: converterType } = useConverterTypeSwitcher()

const converterOptions = useConverterOptions()

const createConverter = (type: ConverterType) => {
  return ConverterFactory.create(type, converterOptions)
}

const converter = ref(createConverter(converterType.value))

// Watch for converter type changes only
watch(converterType, (newType) => {
  converter.value = createConverter(newType)
})

const autoConvert = computed(() => converterOptions.autoConvert.value)

const keyboard = useKeyboardStore()
const { copy } = useClipboard()
const { toast } = useToast()

const inputValue = computed(() => converter.value.inputValue)
const fromUnit = computed(() => converter.value.fromUnit)
const toUnit = computed(() => converter.value.toUnit)
const error = computed(() => converter.value.error)
const availableUnits = computed(() => converter.value.availableUnits)
const formattedResult = computed(() => converter.value.formattedResult)
const isConverting = computed(() => converter.value.isConverting)

const setInputValue = (value: string) => converter.value.setInputValue(value)
const setFromUnit = (unitId: string) => converter.value.setFromUnit(unitId)
const setToUnit = (unitId: string) => converter.value.setToUnit(unitId)
const flipUnits = () => converter.value.flipUnits()

const visualizations = computed(() => converter.value.result?.visualizations)

const handleNumpadClick = (value: string): void => {
  let newValue = inputValue.value

  if (value === '=') {
    handleConvert()
    return;
  }
  if (value === 'CE') {
    newValue = '0'
    setInputValue('0')
  } else if (value === 'backspace') {
    newValue = newValue.length > 1 ? newValue.slice(0, -1) : '0'
  } else if (value === '.' && !newValue.includes('.')) {
    newValue += value
  } else if (value !== '.' && /^\d$/.test(value)) {
    newValue = newValue === '0' ? value : newValue + value
  }

  if (newValue.length > 15) return
  if (!/^-?\d*\.?\d*$/.test(newValue)) return

  setInputValue(newValue)
}

const handleConvert = () => {
  converter.value.convert()
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

import { currencyService } from '@converter/services/converters/currency'

const handleRefreshRates = async () => {
  try {
    await currencyService.refreshRates('USD') // Refresh USD rates as base
    toast('Exchange rates refreshed!', { type: 'success' })
    // Re-convert if there's an input
    if (inputValue.value && inputValue.value !== '0') {
      await handleConvert()
    }
  } catch (error) {
    toast('Failed to refresh rates', { type: 'error' })
  }
}

const isOffline = ref(false)

const checkOnlineStatus = async () => {
  try {
    isOffline.value = !(await currencyService.isOnline())
  } catch {
    isOffline.value = true
  }
}

// Check online status when currency converter is selected
watch(converterType, async (newType) => {
  if (newType === 'currency') {
    await checkOnlineStatus()
  }
}, { immediate: true })

watch(converterType, (newType: ConverterType) => {
  converter.value = createConverter(newType)
})

onMounted(() => {
  keyboard.attachAllForContext('converter', {
    'Ctrl+Enter': () => handleConvert(),
    'Ctrl+F': () => flipUnits(),
    'Ctrl+C': () => handleCopy(),
    'Ctrl+V': () => handlePaste(),
    'Escape': () => handleClear()
  })
  keyboard.pushContext('converter')
})

onUnmounted(() => {
  keyboard.popContext('converter')
})
</script>
