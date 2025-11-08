<!-- components/ProgressCircle.vue -->
<script setup lang="ts">
import { computed } from 'vue'
type Props = { value: number; size?: number; stroke?: number; showPercentage?: boolean; }
const props = withDefaults(defineProps<Props>(), { size: 64, stroke: 6, showPercentage: false })
const radius = (props.size - props.stroke) / 2
const circumference = 2 * Math.PI * radius
const clamped = computed(() => Math.max(0, Math.min(100, props.value)))
const offset = computed(() => circumference * (1 - clamped.value / 100))
</script>

<template>
  <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" class="block">
      <circle
        :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke"
        class="text-muted" stroke="currentColor" fill="transparent" />
      <circle
        :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke"
        class="text-primary" stroke-linecap="round" stroke="currentColor" fill="transparent"
        :stroke-dasharray="circumference" :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size/2} ${size/2})`" />
    </svg>
    <div v-if="showPercentage" class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs font-medium text-card-foreground">{{ Math.round(clamped) }}%</span>
    </div>
  </div>
</template>
