<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
    <BaseButton
      v-for="base in bases"
      :key="base"
      size="sm"
      :class="[
        'flex justify-between focus:ring-0 items-center py-2 px-3 h-auto text-xs font-medium rounded-md border cursor-pointer transition-transform active:scale-95 duration-150',
        activeBase === base
          ? 'bg-primary/10 border-primary/30 text-primary shadow-sm hover:bg-primary/15 hover:text-primary/80'
          : 'bg-muted/30 border-border hover:bg-muted/50 hover:text-foreground',
      ]"
      @click="$emit('base-change', base)">
      <span class="font-medium">{{ base }}</span>
      <span
        :class="[
          'font-mono text-xs truncate ml-2',
          activeBase === base ? 'text-primary font-semibold' : 'opacity-90'
        ]">
        {{ formattedValues[base] }}
      </span>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, type ComputedRef } from 'vue'
import { useDisplayFormatter } from '@calculator/services/display/DisplayFormatter'
import type { Base } from '@calculator/composables/useCalculatorState'
import { BaseButton } from '@components/ui'

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

const props = defineProps<Props>()

defineEmits<Emits>()

const bases = markRaw(['HEX', 'DEC', 'OCT', 'BIN'] as const)

const displayFormatter = useDisplayFormatter()

/**
 * Computed property for formatted display values
 * Uses displayFormatter to format values for each base
 */
const formattedValues: ComputedRef<FormattedValues> = computed(() => {
  const result: FormattedValues = {}

  for (const base of bases) {
    const value = props.displayValues[base as Base]?.display
    result[base] = value ? displayFormatter.formatDisplayValue(value, base) : ''
  }

  return result
})
</script>
