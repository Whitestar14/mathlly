<template>
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
      <SliderRange class="absolute h-full bg-primary" />
    </SliderTrack>
    <SliderThumb
      class="block size-5 cursor-pointer rounded-full border hover:border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      :class="thumbClass"
    />
  </SliderRoot>
</template>

<script setup>
import { computed } from 'vue';
import {
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb
} from 'radix-vue';

const props = defineProps({
  modelValue: {
    type: [Number, Array],
    default: () => [0]
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 0.01
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  },
  thumbClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const sliderValue = computed({
  get: () => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue;
    }
    return [props.modelValue];
  },
  set: (value) => {
    emit('update:modelValue', value);
  }
});
</script>
