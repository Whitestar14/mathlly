<template>
  <span
    class="inline-flex items-center justify-center font-medium rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none"
    :class="computedClasses">
    <!-- Dot / Notch -->
    <span
      v-if="showNotch"
      class="mr-1.5 flex h-2 w-2 shrink-0">
      <span class="absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-75 bg-current"></span>
      <span class="relative inline-flex h-2 w-2 rounded-full bg-current"></span>
    </span>

    <!-- Optional Icon Prop -->
    <component
      :is="icon"
      v-if="icon"
      class="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-70" />

    <!-- Content -->
    <span class="whitespace-nowrap">
      <slot>{{ text }}</slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  BADGE_STYLES,
  BADGE_SIZES,
  type BadgeVariant,
  type BadgeSize
} from '@composables/ui/useBadge'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  text?: string
  icon?: Component
  showNotch?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  text: '',
  showNotch: false,
  icon: undefined,
  className: ''
})

const computedClasses = computed(() => {
  return [
    BADGE_STYLES[props.variant] || BADGE_STYLES.default,
    BADGE_SIZES[props.size] || BADGE_SIZES.sm,
    props.className
  ].join(' ')
})
</script>
