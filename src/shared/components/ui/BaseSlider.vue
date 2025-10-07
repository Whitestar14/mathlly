<template>
  <div class="flex items-center gap-2 w-full">
    <!-- Left Chevron -->
    <button
      v-if="showChevrons"
      class="p-1 rounded hover:bg-accent disabled:opacity-50"
      :disabled="disabled"
      @click="decrement"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Slider -->
    <SliderRoot
      v-model="sliderValue"
      class="relative flex items-center w-full group"
      :class="customClass"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
    >
      <SliderTrack class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted opacity-70 group-hover:opacity-100">
        <SliderRange class="absolute transition-all duration-100 h-full bg-primary" />
      </SliderTrack>
      <SliderThumb
        class="size-5 cursor-pointer transition-all duration-100 rounded-full border border-primary bg-background
         ring-offset-background
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
         disabled:pointer-events-none disabled:opacity-50 touch-none"
        :class="thumbClass"
      />
    </SliderRoot>

    <!-- Right Chevron -->
    <button
      v-if="showChevrons"
      class="p-1 rounded hover:bg-accent disabled:opacity-50"
      :disabled="disabled"
      @click="increment"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb
} from 'radix-vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [Number, Array],
    default: () => [0]
  },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 0.01 },
  disabled: { type: Boolean, default: false },
  customClass: { type: String, default: '' },
  thumbClass: { type: String, default: '' },
  showChevrons: { type: Boolean, default: false } // NEW
});

const emit = defineEmits(['update:modelValue']);

const sliderValue = computed({
  get: () => Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue],
  set: (value) => emit('update:modelValue', value)
});

// Fine calibration
const increment = () => {
  const val = Math.min(sliderValue.value[0] + props.step, props.max);
  emit('update:modelValue', val);
};
const decrement = () => {
  const val = Math.max(sliderValue.value[0] - props.step, props.min);
  emit('update:modelValue', val);
};
</script>
