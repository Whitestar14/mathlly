<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs mt-1">
    <button
      v-for="base in bases"
      :key="base"
      :class="[
        'flex justify-between items-center p-2 rounded-lg transition-colors duration-200',
        baseButtonClasses(base),
      ]"
      @click="$emit('base-change', base)"
    >
      <span
        :class="[
          activeBase === base
            ? 'text-primary dark:text-primary'
            : 'text-muted-foreground dark:text-muted-foreground',
        ]"
      >{{ base }}</span>
      <span
        :class="[
          'monospace truncate ml-1',
          activeBase === base
            ? 'text-primary dark:text-primary font-medium'
            : 'text-foreground dark:text-muted-foreground',
        ]"
      >{{ formattedValues[base] }}</span>
    </button>
  </div>
</template>


<script setup lang="ts">
import { computed, markRaw, type ComputedRef } from 'vue'
import { DisplayFormatter } from "@/services/display/DisplayFormatter"
import type { Base } from '@/composables/useCalculatorState'

// Define interfaces for component props and data
interface Props {
  displayValues: Record<Base, DisplayValue>
  activeBase: Base
}

interface Emits {
  (event: 'base-change', base: Base): void
}

interface DisplayValue {
  display?: string
  input?: string
}

interface FormattedValues {
  [key: string]: string
}

// Define props with proper typing
const props = defineProps<Props>()

defineEmits<Emits>()

// Define available bases as a readonly array with proper typing
const bases = markRaw(['HEX', 'DEC', 'OCT', 'BIN'] as const)

/**
 * Computed property for formatted display values
 * Uses DisplayFormatter to format values for each base
 */
const formattedValues: ComputedRef<FormattedValues> = computed(() => {
  const result: FormattedValues = {}
  
  for (const base of bases) {
    const value = props.displayValues[base as Base]?.display
    result[base] = value ? DisplayFormatter.formatDisplayValue(value, base) : ''
  }
  
  return result
})

/**
 * Generate CSS classes for base buttons based on active state
 * @param base - The base to generate classes for
 * @returns CSS class string
 */
const baseButtonClasses = (base: string): string => {
  return props.activeBase === base
    ? 'bg-indigo-50 dark:bg-muted/70 text-muted-foreground border border-indigo-300 dark:border-indigo-300/25 dark:text-foreground'
    : 'bg-background dark:bg-background border border-border dark:border-border hover:bg-muted dark:hover:bg-accent/30'
}
</script>
