<template>
  <BasePage title="Converter" :show-header="false" :is-tool-layout="true" main-class="flex p-2">
    <div class="container mx-auto max-h-full p-2 flex-1 overflow-hidden">
      <div class="p-2 h-full flex-1 md:p-6 rounded-lg bg-card">
        <div class="grid h-full grid-cols-1 lg:grid-cols-[5fr_3.5fr] gap-2 md:gap-12">
          <!-- Left column: Conversion panels -->
          <div class="flex flex-col gap-1">
            <div class="relative flex flex-1 flex-col gap-2">
              <ConversionPanel 
                class="font-bold" 
                :model-value="state.input" 
                label="From" 
                :units="availableUnits" 
                :selected-unit="state.fromUnit" 
                :read-only="false" 
                :error="state.error" 
                @update:model-value="setInput"
                @update:selected-unit="setFromUnit" 
              />

              <ConversionPanel 
                class="font-thin" 
                :model-value="formattedResult" 
                label="To" 
                :units="availableUnits" 
                :selected-unit="state.toUnit" 
                :read-only="true" 
                :show-copy-button="true" 
                :show-refresh-button="state.activeConverter === 'currency'"
                @update:selected-unit="setToUnit" 
                @copy="handleCopy" 
                @refresh="handleRefreshRates" 
              />

              <!-- Flip button -->
              <div class="absolute top-[45.5%] md:top-[46.5%] md:left-1/2 left-[47%] flex justify-center">
                <BaseButton 
                  v-tippy="{ content: 'Swap units' }" 
                  variant="primary" 
                  size="icon" 
                  class="rounded-full"
                  @click="flipUnits"
                >
                  <ArrowDownUp class="h-4 w-4" />
                </BaseButton>
              </div>
            </div>
            <div class="flex-initial max-h-10 h-10">
              <!-- Add visualization display here -->
              <VisualizationDisplay 
                :converter-type="state.activeConverter" 
                :converter="converter"
                :input-value="state.input"
                :from-unit="state.fromUnit"
                :to-unit="state.toUnit"
              />
              <div v-show="state.activeConverter === 'currency'" class="text-xs text-muted-foreground text-center mt-1">
                Exchange rates powered by <a href="https://open.er-api.com" target="_blank" class="underline hover:no-underline">exchangerate-api.com</a>
              </div>
            </div>
          </div>

          <!-- Right column: Numpad -->
          <div class="flex flex-1 justify-center lg:justify-end">
            <ConverterNumpad 
              :autoConvert="autoConvert" 
              :disabled="state.isConverting" 
              @button-click="handleNumpadClick" 
            />
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
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

defineProps<{
  isMobile?: boolean
}>()

// Initialize state and controller
const options = useConverterOptions()
const autoConvert = computed(() => options.autoConvert.value)
const { state, updateState, reset } = useConverterState(options.defaultConverterType.value)
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

// Type switcher for navigation
const { currentConverterType, updateConverterType } = useConverterTypeSwitcher()

// Services
const keyboard = useKeyboardStore()
const { copy } = useClipboard()
const { error: errorToast, info } = useToast()

// Sync with type switcher
watch(currentConverterType, (newType) => {
  setActiveConverter(newType)
  reset()
})

watch(() => state.activeConverter, (newType) => {
  updateConverterType(newType)
})

// Computed properties
const formattedResult = computed(() => state.result?.formattedValue || '0')

// Event handlers
const handleCopy = async () => {
  try {
    await copy(formattedResult.value)
    info(formattedResult.value, { title: 'Copied to clipboard'})
  } catch (error) {
    errorToast('Failed to copy')
  }
}

const handleRefreshRates = async () => {
  if (state.activeConverter === 'currency') {
    // Force reconvert to refresh rates
    await convert()
  }
}

const handleNumpadClick = (btn: string) => {
  if (btn === 'CE') {
    reset()
  } else if (btn === '=') {
    convert()
  } else {
    // Handle number input
    const currentInput = state.input
    let newInput = currentInput

    if (btn === 'backspace') {
      newInput = currentInput.slice(0, -1) || '0'
    } else if (btn === '.' && !currentInput.includes('.')) {
      newInput = currentInput + btn
    } else if (btn === '0' && currentInput === '0') {
      // Don't add leading zeros
    } else if (/^\d$/.test(btn)) {
      newInput = currentInput === '0' ? btn : currentInput + btn
    }

    setInput(newInput)
  }
}

// Auto-convert on input change
if (options.autoConvert.value) {
  watch(() => state.input, () => {
    if (state.input.trim()) {
      // Debounce auto-convert
      setTimeout(convert, 300)
    }
  })
}

// Keyboard shortcuts
onMounted(async () => {
  keyboard.pushContext('converter')
  
  keyboard.attachAllForContext('converter', {
    Enter: () => convert(),
    Escape: () => reset(),
    Backspace: () => handleNumpadClick('backspace')
  })

    await convert()
})

onUnmounted(() => {
  keyboard.popContext('converter')
})
</script>
