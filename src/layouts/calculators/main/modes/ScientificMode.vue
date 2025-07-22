<template>
  <div class="flex flex-col gap-1">
    <!-- Mode toggles row - Fixed height -->
    <div class="grid grid-cols-3 gap-1 h-8">
      <button
        class="calc-function-btn calc-btn calc-btn-top"
        :class="{ 'active': calculatorOptions.angleDisplayMode !== 'DEG' }"
        @click="calculatorOptions.cycleAngleMode"
      >
        <span>{{ calculatorOptions.angleDisplayMode }}</span>
      </button>
      <button
        class="calc-function-btn calc-btn calc-btn-top"
        :class="{ 'active': calculatorOptions.notationDisplayMode === 'SCI' }"
        @click="calculatorOptions.toggleNotationMode"
      >
        <span>{{ calculatorOptions.notationDisplayMode }}</span>
      </button>
      
      <!-- Memory dropdown with uniform styling -->
      <BaseDropdown
        label="M"
        content-class="w-auto"
        trigger-class="calc-function-btn calc-btn calc-btn-top w-full h-full"
        :use-default-styling="false"
        @item-select="handleClick"
      >
        <div class="grid grid-cols-5 gap-1 p-1 min-w-[200px]">
          <BaseDropdownItem
            v-for="op in memoryOperations"
            :key="op"
            :label="op"
            :value="op"
            :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
            item-class="calc-dropdown-item-small"
            @select="handleClick"
          />
        </div>
      </BaseDropdown>
    </div>
    
    <!-- Function dropdown buttons - Fixed height -->
    <div class="grid grid-cols-2 gap-1 h-10">
      <!-- Trigonometry dropdown -->
      <BaseDropdown
        label="Trigonometry"
        :icon="LucideTriangle"
        full-width
        content-class="w-[220px] bg-background border border-border shadow-lg rounded-lg"
        trigger-class="calc-function-btn calc-btn w-full h-full"
        @item-select="handleTrigFunction"
      >
        <template #header>
          <div class="grid grid-cols-2 gap-1 p-2">
            <CalcButton
              value="HYP"
              variant="function"
              size="sm"
              :class="{ 'calc-active-btn': calculatorOptions.hyperbolicMode }"
              @click="calculatorOptions.toggleHyperbolicMode"
            >
              HYP
            </CalcButton>
            <CalcButton
              value="2nd"
              variant="function"
              size="sm"
              :class="{ 'calc-active-btn': trigSecondFunctionActive }"
              @click="toggleTrigSecondFunction"
            >
              <span>2<sup>nd</sup></span>
            </CalcButton>
          </div>
        </template>
        
        <div class="grid grid-cols-3 gap-0.5 p-1">
          <BaseDropdownItem
            v-for="func in currentTrigFunctions"
            :key="func.value"
            :value="func.value"
            item-class="calc-dropdown-item"
            @select="handleTrigFunction"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="func.display || func.value" />
          </BaseDropdownItem>
        </div>
      </BaseDropdown>
      
      <!-- Functions dropdown -->
      <BaseDropdown
        label="Functions"
        :icon="LucideSquareFunction"
        full-width
        content-class="w-[240px] bg-background border border-border shadow-lg rounded-lg"
        trigger-class="calc-function-btn calc-btn w-full h-full"
        @item-select="handleClick"
      >
        <div class="grid grid-cols-2 gap-1 p-0.5">
          <BaseDropdownItem
            v-for="func in functionsList"
            :key="func.value"
            :value="func.value"
            item-class="calc-dropdown-item"
            @select="handleClick"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="func.display || func.value" />
          </BaseDropdownItem>
        </div>
      </BaseDropdown>
    </div>

    <div class="grid grid-cols-5 gap-1 flex-grow">
      <!-- Scientific functions column -->
      <div class="flex flex-col gap-1">
        <CalcButton
          value="2nd"
          variant="function"
          :class="{ 'calc-active-btn': secondFunctionActive }"
          @click="toggleSecondFunction"
        >
          <span>2<sup>nd</sup></span>
        </CalcButton>
        
        <CalcButton
          v-for="func in scientificFunctions"
          :key="func.primary"
          :value="secondFunctionActive ? func.secondary : func.primary"
          :disabled="shouldDisableButton(secondFunctionActive ? func.secondary : func.primary, 'function')"
          variant="function"
          @click="handleClick"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="secondFunctionActive ? func.secondaryDisplay : func.primaryDisplay" />
        </CalcButton>
      </div>

      <!-- Main calculator grid -->
      <div class="col-span-4 grid grid-cols-4 gap-1">
        <!-- First row -->
        <CalcButton 
          v-for="(btn, index) in reactiveButtonRow" 
          :key="index"
          :value="btn.value"
          :variant="btn.variant"
          :disabled="shouldDisableButton(btn.value, btn.variant)"
          @click="handleClick"
        >
          <span>{{ btn.display || btn.value }}</span>
        </CalcButton>

        <!-- Second row -->
        <CalcButton 
          v-for="(btn, index) in scientificSecondRow" 
          :key="index"
          :value="btn.value"
          :icon="btn.icon"
          :variant="btn.variant"
          :disabled="shouldDisableButton(btn.value, btn.variant)"
          @click="handleClick"
        />

        <!-- Third row -->
        <CalcButton 
          v-for="(btn, index) in scientificThirdRow" 
          :key="index"
          :value="btn.value"
          :variant="btn.variant"
          :disabled="shouldDisableButton(btn.value, btn.variant)"
          @click="handleClick"
        />

        <!-- Number pad and operations -->
        <template
          v-for="(row, rowIndex) in numberRows"
          :key="`row-${rowIndex}`"
        >
          <CalcButton 
            v-for="(btn, btnIndex) in row" 
            :key="`row-${rowIndex}-btn-${btnIndex}`"
            :value="btn.value"
            :disabled="shouldDisableButton(btn.value, btn.variant)"
            :variant="btn.variant"
            @click="handleClick"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import CalcButton from '@/components/ui/CalculatorButton.vue';
import BaseDropdown from '@/components/base/BaseDropdown.vue';
import BaseDropdownItem from '@/components/base/BaseDropdownItem.vue';
import { 
  LucideTriangle, 
  LucideSquareFunction
} from 'lucide-vue-next';
import { 
  numberRows,
  scientificSecondRow,
  scientificThirdRow,
  memoryOperations,
  scientificFunctions,
  primaryTrigFunctions,
  secondaryTrigFunctions,
  primaryHyperbolicFunctions,
  secondaryHyperbolicFunctions,
  functionsList
} from './NumberRows';

const props = defineProps({
  inputLength: {
    type: Number,
    required: true
  },
  maxLength: {
    type: Number,
    default: 29
  },
  hasMemory: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['button-click', 'clear']);

// Inject calculator options from parent
const calculatorOptions = inject('calculatorOptions');

// Local UI state (not related to calculator settings)
const secondFunctionActive = ref(false);
const trigSecondFunctionActive = ref(false);

const isMaxLengthReached = computed(() => 
  props.inputLength >= props.maxLength
);

// Define which buttons should never be disabled
const alwaysEnabledButtons = new Set([
  'C', 'CE', 'backspace', '=', 
  'MC', 'MR', 'M+', 'M-', 'MS',
  '2nd', 'HYP'
]);

// More efficient disable check
const shouldDisableButton = (value, variant, checkMaxLength = false) => {
  // Never disable always-enabled buttons
  if (alwaysEnabledButtons.has(value)) {
    return false;
  }
  
  // If max length reached and this button adds to input, disable it
  return isMaxLengthReached.value && (
    variant === 'number' || 
    variant === 'operator' || 
    variant === 'function' ||
    checkMaxLength === true
  );
};

// Make first row reactive for comma/factorial toggle
const reactiveButtonRow = computed(() => [
  { value: '(', variant: 'function', checkMaxLength: true },
  { value: ')', variant: 'function', checkMaxLength: true },
  {
    value: secondFunctionActive.value ? ',' : 'n!',
    display: secondFunctionActive.value ? ',' : 'n!',
    variant: 'function',
    checkMaxLength: true
  },
  { value: 'C', variant: 'function' }
]);

// Compute current trig functions based on both 2nd and hyperbolic mode
const currentTrigFunctions = computed(() => {
  if (calculatorOptions?.hyperbolicMode.value) {
    return trigSecondFunctionActive.value ? secondaryHyperbolicFunctions : primaryHyperbolicFunctions;
  } else {
    return trigSecondFunctionActive.value ? secondaryTrigFunctions : primaryTrigFunctions;
  }
});

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
    return;
  }
  emit('button-click', value);
};

const handleTrigFunction = (value) => {
  emit('button-click', value);
};

const toggleSecondFunction = () => {
  secondFunctionActive.value = !secondFunctionActive.value;
  
  if (secondFunctionActive.value) {
    setTimeout(() => {
      secondFunctionActive.value = false;
    }, 30000);
  }
};

const toggleTrigSecondFunction = () => {
  trigSecondFunctionActive.value = !trigSecondFunctionActive.value;
};
</script>
