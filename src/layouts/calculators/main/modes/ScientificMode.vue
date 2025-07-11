<template>
  <div class="flex flex-col gap-1">
    <!-- Mode toggles row - Fixed height -->
    <div class="grid grid-cols-3 gap-1 h-8">
      <button
        class="calc-function-btn calc-btn calc-btn-top"
        :class="{ 'active': angleMode !== 'DEG' }"
        @click="cycleAngleMode"
      >
        <span>{{ angleMode }}</span>
      </button>
      <button
        class="calc-function-btn calc-btn calc-btn-top"
        :class="{ 'active': notationMode === 'SCI' }"
        @click="toggleNotationMode"
      >
        <span>{{ notationMode }}</span>
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
        content-class="w-[220px] bg-background dark:bg-background border border-border dark:border-border shadow-lg rounded-lg"
        trigger-class="calc-function-btn calc-btn w-full h-full"
        @item-select="handleTrigFunction"
      >
        <template #header>
          <div class="grid grid-cols-2 gap-1 p-2">
            <CalcButton
              value="HYP"
              variant="function"
              size="sm"
              :class="{ 'calc-active-btn': hyperbolicMode }"
              @click="toggleHyperbolicMode"
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
        content-class="w-[240px] bg-background dark:bg-background border border-border dark:border-border shadow-lg rounded-lg"
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
          @click="handleClick"
        />

        <!-- Third row -->
        <CalcButton 
          v-for="(btn, index) in scientificThirdRow" 
          :key="index"
          :value="btn.value"
          :variant="btn.variant"
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
            :disabled="isMaxLengthReached && btn.variant === 'number'"
            :variant="btn.variant"
            @click="handleClick"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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

const emit = defineEmits(['button-click', 'clear', 'mode-toggle']);

// State
const secondFunctionActive = ref(false);
const trigSecondFunctionActive = ref(false);
const angleMode = ref('DEG');
const notationMode = ref('F-E');
const hyperbolicMode = ref(false);

const isMaxLengthReached = computed(() => 
  props.inputLength >= props.maxLength
);

// Make first row reactive for comma/factorial toggle
const reactiveButtonRow = computed(() => [
  { value: '(', variant: 'function' },
  { value: ')', variant: 'function' },
  {
    value: secondFunctionActive.value ? ',' : 'n!',
    display: secondFunctionActive.value ? ',' : 'n!',
    variant: 'function'
  },
  { value: 'C', variant: 'function' }
]);

// Compute current trig functions based on both 2nd and hyperbolic mode
const currentTrigFunctions = computed(() => {
  if (hyperbolicMode.value) {
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

// Cycle through angle modes: DEG -> RAD -> GRAD -> DEG
const cycleAngleMode = () => {
  if (angleMode.value === 'DEG') {
    angleMode.value = 'RAD';
  } else if (angleMode.value === 'RAD') {
    angleMode.value = 'GRAD';
  } else {
    angleMode.value = 'DEG';
  }
  
  emit('mode-toggle', { type: 'angle', value: angleMode.value });
};

// Toggle notation mode F-E <-> SCI
const toggleNotationMode = () => {
  notationMode.value = notationMode.value === 'F-E' ? 'SCI' : 'F-E';
  emit('mode-toggle', { type: 'notation', value: notationMode.value });
};

// Toggle hyperbolic mode
const toggleHyperbolicMode = () => {
  hyperbolicMode.value = !hyperbolicMode.value;
  emit('mode-toggle', { type: 'hyperbolic', value: hyperbolicMode.value });
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

<style scoped>
</style>
