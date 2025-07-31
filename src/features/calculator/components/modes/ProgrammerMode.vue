<template>
  <div class="flex flex-col gap-1">
    <!-- Memory buttons row -->
    <div class="grid grid-cols-5 gap-1">
      <CalcButton
        v-for="op in memoryOperations"
        :key="op"
        :value="op"
        variant="memory"
        :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
        @click="handleClick"
      >
        {{ op }}
      </CalcButton>
    </div>

    <div class="grid grid-cols-5 gap-1 flex-grow">
      <!-- Hex letters column -->
      <div class="flex flex-col gap-1">
        <CalcButton
          v-for="letter in hexLetters"
          :key="letter"
          :value="letter"
          variant="function"
          :disabled="!isButtonEnabled(letter) || shouldDisableButton(letter, 'function', true)"
          @click="handleClick"
        >
          {{ letter }}
        </CalcButton>
      </div>

      <!-- Main calculator grid -->
      <div class="col-span-4 grid grid-cols-4 gap-1">
        <!-- First row -->
        <CalcButton 
          v-for="(btn, index) in programmerFirstRow" 
          :key="index"
          :value="btn.value"
          :icon="btn.icon"
          :disabled="shouldDisableButton(btn.value, btn.variant, btn.checkMaxLength)"
          :variant="btn.variant"
          @click="handleClick"
        />

        <!-- Second row -->
        <CalcButton 
          v-for="(btn, index) in programmerSecondRow" 
          :key="index"
          :value="btn.value"
          :disabled="shouldDisableButton(btn.value, btn.variant, btn.checkMaxLength)"
          :variant="btn.variant"
          @click="handleClick"
        />

        <!-- Number pad and operations -->
        <template v-for="(row, rowIndex) in numberRows">
          <CalcButton 
            v-for="(btn, btnIndex) in row" 
            :key="`row-${rowIndex}-btn-${btnIndex}`"
            :value="btn.value"
            :disabled="!isButtonEnabled(btn.value) || shouldDisableButton(btn.value, btn.variant, btn.checkMaxLength)"
            :variant="btn.variant"
            @click="handleClick"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import CalcButton from '@calculator/components/CalculatorButton.vue';
import { 
  numberRows, 
  programmerFirstRow, 
  programmerSecondRow, 
  memoryOperations, 
  hexLetters 
} from './NumberRows';

const props = defineProps({
  activeBase: {
    type: String,
    required: true,
  },
  inputLength: {
    type: Number,
    required: true,
  },
  maxLength: {
    type: Number,
    default: 29,
  },
  hasMemory: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(["button-click", "clear"]);

const isMaxLengthReached = computed(() => props.inputLength >= props.maxLength);

// Define which buttons should never be disabled
const alwaysEnabledButtons = new Set([
  'C', 'CE', 'backspace', '=', 
  'MC', 'MR', 'M+', 'M-', 'MS'
]);

// Check if button should be disabled due to max length
const shouldDisableButton = (value, variant, checkMaxLength = false) => {
  // Never disable always-enabled buttons
  if (alwaysEnabledButtons.has(value)) {
    return false;
  }
  
  // If max length reached and this button adds to input, disable it
  return isMaxLengthReached.value && (
    variant === 'number' || 
    variant === 'operator' || 
    checkMaxLength === true
  );
};

const handleClick = (value) => {
  emit("button-click", value);
};

const isButtonEnabled = computed(() => (button) => {
  if (['×', '-', '+', '=', '±'].includes(button)) {
    return true;
  }

  switch (props.activeBase) {
    case "HEX":
      return /^[0-9A-F]$/.test(button.toUpperCase());
    case "DEC":
      return /^[0-9]$/.test(button);
    case "OCT":
      return /^[0-7]$/.test(button);
    case "BIN":
      return /^[01]$/.test(button);
    default:
      return true;
  }
});
</script>
