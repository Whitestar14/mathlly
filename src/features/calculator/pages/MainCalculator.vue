<template>
  <BasePage
    :title="currentMode + ' Mode'"
    :show-header="false"
    :show-footer="false"
    main-class="flex"
    :is-tool-layout="true"
  >
    <div
      class="flex-grow flex-initial bg-background overflow-hidden transition-colors duration-300"
    >
      <div
        class="grid grid-cols-1 h-full p-4 gap-1 mx-auto"
        :class="
          state.mode === 'Programmer'
            ? 'grid-rows-[1fr_2fr]'
            : state.mode === 'Standard'
              ? 'grid-rows-[1fr_3fr]'
              : 'grid-rows-[1fr_4fr]'
        "
      >
        <Suspense>
          <template #fallback>
            <div class="flex flex-col h-full">
              <div
                class="p-4 rounded-lg bg-secondary flex-1 relative flex items-end"
              >
                <!-- Skeleton for the main display area -->
                <div class="w-full space-y-2">
                  <!-- Input line skeleton -->
                  <div
                    class="h-6 bg-muted rounded animate-pulse w-3/4 ml-auto"
                  />
                  <!-- Result line skeleton -->
                  <div class="h-8 bg-muted rounded animate-pulse w-full" />
                </div>
              </div>
              <!-- Base display skeleton for programmer mode -->
              <div
                v-if="state.mode === 'Programmer'"
                class="flex-initial mt-2"
              >
                <div class="flex gap-2">
                  <div class="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div class="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div class="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div class="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </template>
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
        </Suspense>

        <calculator-buttons
          :mode="state.mode"
          :input-length="state.input.length"
          :max-length="maxInputLength"
          :active-base="state.activeBase"
          :has-memory="hasMemoryValue"
          :current-value="currentDecimalValue"
          :current-bit-width="currentBitWidth"
          @button-click="handleButtonClick"
          @bit-toggle="handleBitToggle"
          @bit-width-change="(width: BitWidth) => currentBitWidth = width"
        />
      </div>
    </div>

    <DesktopPanelLoader
      :component="ActivityPanelComponent"
      :is-open="unref(activityPanel.isOpen)"
      position="left"
      :component-props="{
        mode: state.mode,
        isMobile: isMobile,
        isOpen: activityPanel.isOpen,
        onSelectItem: selectHistoryItem,
        onHistoryClose: activityPanel.close,
        onMemoryClose: activityPanel.close,
      }"
    />
  </BasePage>
</template>

<script setup lang="ts">
import {
  computed,
  watch,
  ref,
  unref,
  provide,
  defineAsyncComponent,
  type ComputedRef,
} from 'vue';
import {
  useHistory,
  type HistoryItem,
} from '@calculator/composables/useHistory';
import { useMemory } from '@calculator/composables/useMemory';
import { usePanel } from '@composables/ui/usePanel';
import {
  useCalculatorState,
  type CalculatorMode,
  type Base,
} from '@calculator/composables/useCalculatorState';
import { useCalculatorModeSwitcher } from '@calculator/composables/useCalculatorModeSwitcher';
import { useCalculatorOptions } from '@calculator/composables/useCalculatorOptions';
import {
  CalculatorController,
  type ControllerReturn,
} from '../composables/MainCalculator';
import {
  CalculatorFactory,
  type Calculator,
  isProgrammerCalculator,
} from '@calculator/services/factory/CalculatorFactory';
import { useCalculatorSession } from '@calculator/composables/useCalculatorSession';
import {
  toggleBit,
  type BitWidth,
} from '@calculator/utils/core/BitManipulation';
import type { BaseType } from '@calculator/utils/constants/CalculatorConstants';

import { CalculatorButtons } from '@calculator/components';
import { BasePage } from '@components/ui';
import DesktopPanelLoader from '@components/ui/panel/DesktopPanelLoader.vue';

const props = defineProps<{
  isMobile: boolean;
}>();
const ActivityPanelComponent = defineAsyncComponent(
  () => import('@calculator/components/ActivityPanel.vue')
);
const CalculatorDisplay = defineAsyncComponent(
  () => import('@calculator/components/CalculatorDisplay.vue')
);

interface HistoryService {
  addToHistory: (
    expression: string,
    result: string,
    mode: CalculatorMode,
    base?: string,
    baseValues?: Record<string, string>
  ) => Promise<void>;
}

const historyService: HistoryService = useHistory();
const memoryService = useMemory();

const activityPanel = usePanel('activity');

const { currentMode } = useCalculatorModeSwitcher();

const calculatorOptions = useCalculatorOptions();

const {
  state,
  updateState,
  resetState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
} = useCalculatorState(currentMode.value);

const { saveInput, getInput } = useCalculatorSession();

const createCalculator = (mode: CalculatorMode): Calculator => {
  return CalculatorFactory.create(mode) 
}

const calculator = ref<Calculator>(createCalculator(currentMode.value));

provide('calculator', calculator);
provide('calculatorState', state);
provide('calculatorOptions', calculatorOptions);
provide(
  'currentInput',
  computed(() => state.input)
);
provide(
  'activeBase',
  computed(() => state.activeBase)
);
provide(
  'mode',
  computed(() => state.mode)
);
provide('updateState', updateState);
provide('updateDisplayValues', updateDisplayValues);
provide(
  'isMobile',
  computed(() => props.isMobile)
);

const controllerResult: ControllerReturn = CalculatorController({
  state,
  //@ts-ignore
  calculator,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  historyService,
  memoryService,
  toggleActivity: activityPanel.toggle,
});

const { preview, input, animatedResult, handleButtonClick, handleBaseChange } =
  controllerResult;

const maxInputLength: ComputedRef<number> = computed(
  () => calculator.value.MAX_INPUT_LENGTH
);
const hasMemoryValue: ComputedRef<boolean> = computed(
  () => memoryService.hasMemory(currentMode.value).value
);

const currentDecimalValue: ComputedRef<number> = computed(() => {
  if (state.mode !== 'Programmer') return 0;
  // @ts-ignore
  if (!isProgrammerCalculator(calculator.value)) return 0;

  try {
    // @ts-ignore
    const decState = calculator.value.states.DEC;
    if (!decState?.input) return 0;
    return parseInt(decState.input, 10) || 0;
  } catch {
    return 0;
  }
});

const currentBitWidth = ref<BitWidth>(64);

const handleBitToggle = (bitPosition: number): void => {
  if (state.mode !== 'Programmer') return;
  // @ts-ignore
  if (!isProgrammerCalculator(calculator.value)) return;

  try {
    const currentValue = currentDecimalValue.value;
    const newValue = toggleBit(
      currentValue,
      bitPosition,
      currentBitWidth.value
    );

    // Update calculator state
    calculator.value.updateAllStates(newValue);
    const newInput = calculator.value.states.DEC.input;

    updateState({ input: newInput });

    // Update all base displays
    const updatedValues = calculator.value.updateDisplayValues(newInput);
    updateDisplayValues(updatedValues);
  } catch (err) {
    console.error('Bit toggle error:', err);
    updateState({ error: 'Bit toggle failed' });
  }
};

const openActivity = (): void | Promise<void> => activityPanel.open();

watch(
  () => state.input,
  (newRawInput: string) => {
    saveInput(currentMode.value, newRawInput);
  }
);

const handleModeChange = (
  newMode: CalculatorMode,
  oldMode?: CalculatorMode
) => {
  if (oldMode) {
    saveInput(oldMode, state.input);
  }

  resetState(newMode);

  calculator.value = createCalculator(newMode);

  if (newMode === 'Programmer') {
    setActiveBase('DEC' as Base);
  }

  const savedInput = getInput(newMode);

  if (savedInput) {
    updateState({ input: savedInput });
    calculator.value.input = savedInput;

    // @ts-ignore
    if (newMode === 'Programmer' && isProgrammerCalculator(calculator.value)) {
      const decState = calculator.value.states.DEC;
      if (decState) {
        decState.input = savedInput;
      }
    }
  }
};

watch(
  () => currentMode.value,
  (newMode: CalculatorMode, oldMode?: CalculatorMode) => {
    handleModeChange(newMode, oldMode);
  },
  { immediate: true }
);

const selectHistoryItem = ({ expression, baseValues }: HistoryItem): void => {
  // @ts-ignore
  if (state.mode === 'Programmer' && isProgrammerCalculator(calculator.value)) {
    const programmerCalculator = calculator.value;
    if (baseValues) {
      // Restore all base states
      Object.entries(baseValues).forEach(([baseKey, value]) => {
        const baseState = programmerCalculator.states[baseKey as BaseType];
        if (baseState) {
          baseState.input = value;
          baseState.display = value;
        }
      });

      // Update display values
      updateDisplayValues(calculator.value.states);

      // Set input to active base value
      const activeBaseValue = baseValues[state.activeBase] || expression;
      updateState({ input: activeBaseValue, error: '' });
      calculator.value.input = activeBaseValue;
    }
    return;
  }

  // For Standard/Scientific modes
  updateState({
    input: expression,
    error: '',
  });

  calculator.value.input = expression;
  if ('currentExpression' in calculator.value) {
    calculator.value.currentExpression = '';
  }
};
</script>
