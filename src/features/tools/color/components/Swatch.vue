<!-- src/features/tools/color/components/Swatch.vue -->
<template>
    <button
      type="button"
      class="w-12 h-12 rounded-md border border-border shadow-sm cursor-pointer transition hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      :style="{ backgroundColor: hex }"
      :title="hex"
      @click="$emit('click', color)"
    />
  </template>
  
  <script setup lang="ts">
  import { convertColor } from '../composables/useColor'
  import type { RGB } from '../types/color'
  
  const props = defineProps<{ color: RGB }>()
  const hex = convertColor(props.color).hex
  </script>
  