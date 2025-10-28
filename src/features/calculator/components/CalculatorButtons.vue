<template>
  <Suspense>
    <!-- Main Content -->
    <template #default>
      <Transition
        name="scale"
        mode="out-in"
      >
        <component 
          :is="modeComponent" 
          class="flex-auto"
          :active-base="activeBase"
          :input-length="inputLength"
          :max-length="maxLength"
          :has-memory="hasMemory"
          :current-value="currentValue"
          :current-bit-width="currentBitWidth"
          @button-click="handleButtonClick"
          @base-change="handleBaseChange"
          @bit-toggle="handleBitToggle"
          @bit-width-change="handleBitWidthChange"
        />
      </Transition>
    </template>
    <!-- Loading State -->
    <template #fallback>
      <div class="h-full flex-auto grid grid-cols-4 gap-1">
        <div 
          v-for="n in 24" 
          :key="n" 
          class="animate-pulse calc-btn-grid bg-muted rounded-lg"
        />
      </div>
    </template>
  </Suspense>
</template>
<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  defineEmits,
  defineProps,
  inject,
} from 'vue';
import { useVibrate } from '@vueuse/core';
import type { BitWidth } from '@calculator/utils/core/BitManipulation';
import type { Base } from '@calculator/composables/useCalculatorState'; // Assuming Base is one of your imported types

type CalculatorMode = 'Standard' | 'Scientific' | 'Programmer';

interface CalculatorOptions {
    hapticEnabled: {
        value: boolean;
    };
}

interface CalculatorButtonsProps {
    mode: CalculatorMode;
    activeBase: Base;
    inputLength: number;
    maxLength?: number;
    hasMemory?: boolean;
    currentValue?: number;
    currentBitWidth?: BitWidth;
}

const props = withDefaults(defineProps<CalculatorButtonsProps>(), {
    maxLength: 50,
    hasMemory: false,
    currentValue: 0,
    currentBitWidth: 64,
});

const emit = defineEmits<{
    (e: 'button-click', value: string): void;
    (e: 'clear'): void; // Added from your original logic, if needed
    (e: 'base-change', base: Base): void;
    (e: 'bit-toggle', bitPosition: number): void;
    (e: 'bit-width-change', width: BitWidth): void;
}>();

const options = inject('calculatorOptions') as CalculatorOptions; 

const { vibrate } = useVibrate({ pattern: 50 });

const StandardMode = defineAsyncComponent(() => import('./modes/StandardMode.vue'));
const ScientificMode = defineAsyncComponent(() => import('./modes/ScientificMode.vue'));
const ProgrammerMode = defineAsyncComponent(() => import('./modes/ProgrammerMode.vue'));

const modeComponent = computed(() => {
    switch (props.mode) {
        case 'Standard':
            return StandardMode;
        case 'Scientific':
            return ScientificMode;
        case 'Programmer':
            return ProgrammerMode;
        default:
            return StandardMode;
    }
});


const handleButtonClick = (value: string): void => {
    if (options?.hapticEnabled?.value) {
        vibrate();
    }
    emit('button-click', value);
}

const handleBaseChange = (base: Base): void => {
    emit('base-change', base);
}

const handleBitToggle = (bitPosition: number): void => {
    emit('bit-toggle', bitPosition);
}

const handleBitWidthChange = (width: BitWidth): void => {
    emit('bit-width-change', width);
}
</script>