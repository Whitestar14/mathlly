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
          @button-click="handleButtonClick"
          @clear="handleClear"
          @base-change="handleBaseChange"
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

<script setup>
import { computed, defineAsyncComponent } from 'vue';

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['Standard', 'Scientific', 'Programmer'].includes(value)
  },
  activeBase: {
    type: String,
    required: true
  },
  inputLength: {
    type: Number,
    required: true
  },
  maxLength: {
    type: Number,
    default: 50
  },
  hasMemory: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['button-click', 'clear', 'base-change']);

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

const handleButtonClick = (value) => emit('button-click', value);
const handleClear = () => emit('clear');
const handleBaseChange = (base) => emit('base-change', base);
</script>
