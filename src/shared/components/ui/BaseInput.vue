<template>
  <div class="relative w-full">
    <slot name="prefix">
      <div
        v-if="$slots.icon || icon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <slot name="icon">
          <component
            :is="icon"
            v-if="icon"
            class="h-4 w-4" />
        </slot>
      </div>
    </slot>

    <input
      :id="id"
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel || placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      :class="[
        'w-full rounded-lg border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        error ? 'border-destructive' : 'border-border',
        $slots.icon || icon ? 'pl-10' : 'pl-4',
        $slots.suffix ? 'pr-10' : 'pr-4',
        'py-2'
      ]"
      v-bind="$attrs"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
      @focus="handleFocus" />

    <slot name="suffix"></slot>

    <div
      v-if="error"
      :id="`${id}-error`"
      class="mt-1 text-sm text-destructive">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  ariaLabel: {
    type: String,
    default: ''
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  autoSelect: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number],
  'blur': [event: FocusEvent],
  'focus': [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
  if (props.autoSelect) {
    nextTick(() => inputRef.value?.select())
  }
}

onMounted(() => {
  if (props.autofocus && inputRef.value) {
    inputRef.value.focus()
  }
})

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  input: inputRef
})
</script>
