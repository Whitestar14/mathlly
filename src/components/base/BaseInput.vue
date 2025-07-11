<template>
  <div class="relative w-full">
    <slot name="prefix">
      <div
        v-if="$slots.icon || icon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-muted-foreground"
      >
        <slot name="icon">
          <component
            :is="icon"
            v-if="icon"
            class="h-4 w-4"
          />
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
        'w-full rounded-lg border bg-background dark:bg-background text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        error ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border',
        $slots.icon || icon ? 'pl-10' : 'pl-4',
        $slots.suffix ? 'pr-10' : 'pr-4',
        'py-2'
      ]"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    >
    
    <slot name="suffix" />
    
    <div
      v-if="error"
      :id="`${id}-error`"
      class="mt-1 text-sm text-destructive dark:text-destructive"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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
  }
});

defineEmits(['update:modelValue', 'blur', 'focus']);

const inputRef = ref(null);

onMounted(() => {
  if (props.autofocus && inputRef.value) {
    inputRef.value.focus();
  }
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  input: inputRef
});
</script>
