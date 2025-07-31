import { ref, readonly, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';
import { useCalculatorOptions } from './useCalculatorOptions';
import type { CalculatorMode } from './useCalculatorState';

interface ModeOption {
  value: CalculatorMode;
  label: string;
  shortLabel?: string;
}

// Global reactive state - no provide/inject needed
const currentMode = ref<CalculatorMode>('Standard');
const isInitialized = ref(false);

const availableModes: ModeOption[] = [
  { value: 'Standard', label: 'Standard', shortLabel: 'Std' },
  { value: 'Scientific', label: 'Scientific', shortLabel: 'Sci' },
  { value: 'Programmer', label: 'Programmer', shortLabel: 'Prog' },
];

// Persist mode to localStorage
const persistedMode = useLocalStorage<CalculatorMode>(
  'calculator-mode',
  'Standard'
);

/**
 * Initialize the calculator mode switcher
 */
export function initializeCalculatorModeSwitcher(initialMode?: CalculatorMode) {
  if (isInitialized.value) return;

  // Get calculator options for default mode
  const calculatorOptions = useCalculatorOptions();

  // Use provided initial mode, or fallback to persisted mode, or use default from options
  const modeToUse =
    calculatorOptions.options.value.defaultMode ||
    initialMode ||
    persistedMode.value ||
    'Standard';

  currentMode.value = modeToUse;
  persistedMode.value = modeToUse;
  isInitialized.value = true;

  // Watch for changes to the default mode in options
  watch(
    () => calculatorOptions.options.value.defaultMode,
    (newDefaultMode) => {
      // Only update if we're using the default mode (not a user-selected mode)
      if (!persistedMode.value || persistedMode.value === 'Standard') {
        currentMode.value = newDefaultMode;
        persistedMode.value = newDefaultMode;
      }
    }
  );
}

/**
 * Main composable for calculator mode switching
 */
export function useCalculatorModeSwitcher() {
  const route = useRoute();

  // Auto-initialize if not already done
  if (!isInitialized.value) {
    initializeCalculatorModeSwitcher();
  }

  const isCalculatorRoute = computed(
    () => route.path === '/calculator' || route.path.startsWith('/calculator/')
  );

  const shouldShowSwitcher = computed(() => isCalculatorRoute.value);

  const updateMode = (newMode: CalculatorMode) => {
    if (availableModes.some((mode) => mode.value === newMode)) {
      currentMode.value = newMode;
      persistedMode.value = newMode;
    }
  };

  return {
    currentMode: readonly(currentMode),
    availableModes,
    isCalculatorRoute,
    shouldShowSwitcher,
    updateMode,
  };
}

export { currentMode as calculatorMode };
