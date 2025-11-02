import { ref, readonly } from 'vue';
import { useCalculatorOptions } from './useCalculatorOptions';
import type { CalculatorMode } from './useCalculatorState';

interface ModeOption {
  value: CalculatorMode;
  label: string;
  shortLabel?: string;
}

const currentMode = ref<CalculatorMode>('Standard');
const isInitialized = ref(false);

const availableModes: ModeOption[] = [
  { value: 'Standard', label: 'Standard', shortLabel: 'Std' },
  { value: 'Scientific', label: 'Scientific', shortLabel: 'Sci' },
  { value: 'Programmer', label: 'Programmer', shortLabel: 'Prog' },
];

/**
 * Initialize the calculator mode switcher
 */
export function initializeCalculatorModeSwitcher(initialMode?: CalculatorMode) {
  if (isInitialized.value) return;

  // Get calculator options for default mode
  const calculatorOptions = useCalculatorOptions();

  const modeToUse =
    calculatorOptions.options.value.defaultMode ||
    initialMode ||
    'Standard';

  currentMode.value = modeToUse;
  isInitialized.value = true;
}

/**
 * Main composable for calculator mode switching
 */
export function useCalculatorModeSwitcher() {
  // Auto-initialize if not already done
  if (!isInitialized.value) {
    initializeCalculatorModeSwitcher();
  }

  const updateMode = (newMode: CalculatorMode) => {
    if (availableModes.some((mode) => mode.value === newMode)) {
      currentMode.value = newMode;
    }
  };

  return {
    currentMode: readonly(currentMode),
    availableModes,
    updateMode,
  };
}

export { currentMode as calculatorMode };