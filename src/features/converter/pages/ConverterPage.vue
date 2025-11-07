<template>
  <BasePage title="Converter" :show-header="false" :is-tool-layout="true" main-class="flex p-2">
    <div class="container mx-auto max-h-full p-2 flex-1 overflow-hidden">
      <div class="p-2 h-full flex-1 md:p-6 rounded-lg bg-card">
        <div class="grid h-full grid-cols-1 lg:grid-cols-[5fr_3.5fr] gap-2 md:gap-12">
          <!-- Left column: Conversion panels -->
          <div class="flex flex-col gap-1">
            <div class="relative flex flex-1 flex-col gap-2">
              <ConversionPanel :class="{ 'flip-scale': isFlipping }" class="font-bold" :model-value="state.input"
                label="From" :units="availableUnits" :selected-unit="state.fromUnit" :read-only="false"
                :error="state.error" @reset="() => { if (state.input === '' || state.input === '-') setInput('0') }"
                @update:model-value="setInput" @update:selected-unit="setFromUnit" />

              <ConversionPanel :class="{ 'flip-scale': isFlipping }" class="font-thin" :model-value="formattedResult"
                label="To" :units="availableUnits" :selected-unit="state.toUnit" :read-only="true"
                :show-copy-button="true" :show-refresh-button="state.activeConverter === 'currency'"
                @update:selected-unit="setToUnit" @copy="handleCopy" @refresh="handleRefreshRates" />

              <!-- Flip button -->
              <div class="absolute top-[45.5%] md:top-[46.5%] md:left-1/2 left-[47%] flex justify-center">
                <BaseButton v-tippy="{ content: 'Swap units' }" variant="primary" size="icon" class="active:scale-[0.98] transition-transform duration-[400ms] rounded-full"
                  @click="flipAnimate">
                  <ArrowDownUp class="h-4 w-4" />
                </BaseButton>
              </div>
            </div>
            <div class="flex-initial max-h-10 h-10">
              <!-- Add visualization display here -->
              <VisualizationDisplay :converter-type="state.activeConverter" :converter="converter"
                :input-value="state.input" :from-unit="state.fromUnit" :to-unit="state.toUnit" />
              <div v-show="state.activeConverter === 'currency'" class="text-xs text-muted-foreground text-center mt-1">
                Exchange rates powered by <a href="https://open.er-api.com" target="_blank"
                  class="underline hover:no-underline">exchangerate-api.com</a>
              </div>
            </div>
          </div>

          <!-- Right column: Numpad -->
          <div class="flex flex-1 justify-center lg:justify-end">
            <ConverterNumpad :converter="state.activeConverter" :autoConvert="autoConvert" :disabled="state.isConverting"
              @button-click="handleNumpadClick" />
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { ArrowDownUp } from 'lucide-vue-next'
import { BasePage, BaseButton } from '@components/ui'
import { ConversionPanel, ConverterNumpad } from '@converter/components'
import { VisualizationDisplay } from '@converter/components'
import { useConverterState } from '../composables/useConverterState'
import { useConverterController } from '../composables/useConverterController'
import { useConverterOptions, useConverterTypeSwitcher } from '@converter/composables'
import { useKeyboardStore } from '@stores/keyboard'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { isCurrencyConverter } from '../services/converters/BaseConverter'

defineProps<{
  isMobile?: boolean
}>()

const options = useConverterOptions()
const isFlipping = shallowRef(false)

const autoConvert = computed(() => options.autoConvert.value)
const { state, updateState, reset } = useConverterState(options.defaultConverterType.value)
const formattedResult = computed(() => state.result?.formattedValue || '0')
const {
  converter,
  availableUnits,
  convert,
  setFromUnit,
  setToUnit,
  flipUnits,
  setInput,
  setActiveConverter
} = useConverterController(state, updateState)

const { currentConverterType, updateConverterType } = useConverterTypeSwitcher()

const keyboard = useKeyboardStore()
const { copy } = useClipboard()
const { error: errorToast, info } = useToast()

watch(currentConverterType, (newType) => {
  if (newType !== state.activeConverter) {
    setActiveConverter(newType)
    reset()
  }
}, { immediate: true })

watch(() => state.activeConverter, (newType) => {
  if (newType !== currentConverterType.value) {
    updateConverterType(newType)
  }
}, { immediate: true })


const handleCopy = async () => {
  try {
    await copy(formattedResult.value)
    info(formattedResult.value, { title: 'Copied to clipboard' })
  } catch (error) {
    errorToast('Failed to copy')
  }
}

const handleRefreshRates = async () => {
  if (isCurrencyConverter(converter.value)) {
    try {
      await converter.value?.refreshRates?.()
      info('Rates refreshed!', { title: 'Success' })
    } catch (error) {
      errorToast('Failed to refresh rates')
    }
  }
}

const handleInput = (input: string) => {
  const currentInput = state.input
  let newInput = currentInput

  if (input === '-') {
    const numericValue = parseFloat(currentInput) || 0
    newInput = (-numericValue).toString()
  } else if (input === 'backspace') {
    newInput = currentInput.slice(0, -1) || '0'
  } else if (input === 'clear') {
    newInput = '0'
  } else if (input === '.' && !currentInput.includes('.')) {
    if (currentInput === '0') {
      newInput = '0.'
    } else {
      newInput = currentInput + input
    }
  } else if (/^[0-9]$/.test(input)) {
    if (currentInput === '0') {
      newInput = input
    } else {
      newInput = currentInput + input
    }
  } else {
    return
  }

  setInput(newInput)
}

const handleNumpadClick = (btn: string) => {
  if (btn === 'CE') {
    reset()
  } else if (btn === '=') {
    convert()
  } else {
    handleInput(btn)
  }
}

onMounted(async () => {
  keyboard.pushContext('converter')
  keyboard.enableTextInput('converter', /^[0-9.]$/, { preventDefault: false })

  keyboard.setInputProxy('converter', (e, payload) => {
    const { key } = payload

    const activeElement = document.activeElement
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    )

    if (isInputFocused) {
      return false
    }

    if (key === 'Backspace') {
      handleInput('backspace')
      return true
    } else if (key === 'Delete') {
      handleInput('clear')
      return true
    } else if (/^[0-9.]$/.test(key)) {
      handleInput(key)
      return true
    }

    return false
  })

  keyboard.attachAllForContext('converter', {
    Enter: () => convert(),
    Escape: () => reset(),
    'Ctrl+F': () => flipAnimate(),
    'Ctrl+C': () => handleCopy(),
  })

  await convert()
})

const flipAnimate = () => {
  isFlipping.value = true
  flipUnits()
  setTimeout(() => {
    isFlipping.value = false
  }, 300)
}

onUnmounted(() => {
  keyboard.popContext('converter')
})
</script>
<style lang="css" scoped>
@keyframes flipScale {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(0.98);
    opacity: 0.7;
  }
}

.flip-scale {
  animation: flipScale 0.4s ease-in-out;
}
</style>
