<template>
  <Suspense>

    <template #default>
      <Transition
        name="scale"
        mode="out-in">
        <component
          :is="modeComponent"
          class="flex-auto"
          :active-base="activeBase"
          :input-length="inputLength"
          :max-length="maxLength"
          :has-memory="hasMemory"
          @button-click="handleButtonClick"
          @base-change="handleBaseChange" />
      </Transition>
    </template>

    <template #fallback>
      <div class="h-full flex-auto grid grid-cols-4 gap-1">
        <div
          v-for="n in 24"
          :key="n"
          class="animate-pulse calc-btn-grid bg-muted rounded-lg"></div>
      </div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import {
  inject,
  computed,
  defineAsyncComponent
} from 'vue'
import { useVibrate } from '@vueuse/core'
import type { Base, CalculatorMode } from '@calculator/composables/useCalculatorState'

interface Props {
  mode: CalculatorMode;
  activeBase: Base;
  inputLength: number;
  maxLength?: number;
  hasMemory?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 50,
  hasMemory: false
})

const emit = defineEmits<{
  (e: 'button-click', value: string): void;
  (e: 'base-change', base: Base): void;
}>()

const options: Record<string, any> = inject('calculatorOptions') ?? {}

const { vibrate } = useVibrate({ pattern: 50 })

const StandardMode = defineAsyncComponent(() => import('./modes/StandardMode.vue'))
const ScientificMode = defineAsyncComponent(() => import('./modes/ScientificMode.vue'))
const ProgrammerMode = defineAsyncComponent(() => import('./modes/ProgrammerMode.vue'))

const modeComponent = computed(() => {
  switch (props.mode) {
    case 'Standard':
      return StandardMode
    case 'Scientific':
      return ScientificMode
    case 'Programmer':
      return ProgrammerMode
    default:
      return StandardMode
  }
})

const handleButtonClick = (value: string): void => {
  if (options.hapticFeedback.value) {
    vibrate()
  }
  emit('button-click', value)
}

const handleBaseChange = (base: Base): void => {
  emit('base-change', base)
}
</script>
