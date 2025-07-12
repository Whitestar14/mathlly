<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
    <BaseButton
      v-for="base in bases"
      :key="base"
      :variant="activeBase === base ? 'default' : 'outline'"
      size="sm"
      :class="[
        'flex justify-between items-center p-3 h-auto text-xs font-medium',
        activeBase === base 
          ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15' 
          : ''
      ]"
      @click="$emit('base-change', base)"
    >
      <span class="font-medium">
        {{ base }}
      </span>
      <span 
        :class="[
          'font-mono text-xs truncate ml-2',
          activeBase === base ? 'text-primary font-semibold' : 'opacity-90'
        ]"
      >
        {{ formattedValues[base] }}
      </span>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, type ComputedRef } from 'vue'
import { DisplayFormatter } from "@/services/display/DisplayFormatter"
import type { Base } from '@/composables/useCalculatorState'
import BaseButton from '@/components/base/BaseButton.vue'

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
</script>
