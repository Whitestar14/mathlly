<template>
  <label
    class="inline-flex items-center gap-2 cursor-pointer group"
    :class="[disabled ? 'opacity-50 cursor-not-allowed' : '']">
    <div class="relative flex items-center">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="peer sr-only"
        v-bind="$attrs"
        @change="handleChange" />
      <div
        class="w-4 h-4 rounded border transition-colors flex items-center justify-center shrink-0"
        :class="[
          modelValue
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border bg-transparent group-hover:border-primary/50 text-transparent',
          disabled ? '' : 'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background'
        ]">
        <CheckIcon v-if="modelValue" class="w-3 h-3" stroke-width="3" />
      </div>
    </div>
    <span v-if="label" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none text-foreground/90">
      {{ label }}
    </span>
    <slot v-else-if="$slots.label" name="label"></slot>
  </label>
</template>

<script setup lang="ts">
import { CheckIcon } from 'lucide-vue-next'

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', event: Event): void
}>()

defineOptions({
  inheritAttrs: false
})

interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', event)
}
</script>
