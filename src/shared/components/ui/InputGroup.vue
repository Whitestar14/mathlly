<template>
  <div class="relative flex flex-col gap-0.5 text-base">
    <div class="flex items-center justify-center pb-1">
      <SelectBar
        v-if="options && options.length > 0"
        class="max-w-20 rounded-e-none"
        :model-value="dropdownValue"
        :options="options"
        :label="dropdownLabel"
        :placeholder="dropdownPlaceholder"
        :is-dropdown="true"
        @update:model-value="$emit('update:dropdownValue', $event)"
      />
      <input
        :id="id"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel || placeholder"
        :aria-invalid="!!error"
        :class="[
          'w-full px-2.5 py-1 rounded-lg rounded-s-none border bg-input text-foreground transition-colors focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed',
          error ? 'border-destructive' : 'focus:border-primary border-border',
          $slots.icon || icon ? 'pl-10' : 'pl-4',
          $slots.suffix ? 'pr-10' : 'pr-4',
        ]"
        :aria-describedby="error ? `${id}-error` : undefined"
        @input="(e: Event) => { $emit('update:modelValue', (e.target as HTMLInputElement).value); $emit('input', e) }"
        @focus="handleFocus"
        @blur="$emit('blur', $event)"
      >
    </div>

    <div
      v-if="error"
      :id="`${id}-error`"
      class="absolute -bottom-3 left-0 text-xs text-destructive"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import SelectBar from '@components/ui/SelectBar.vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  dropdownValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  dropdownLabel: {
    type: String,
    default: ''
  },
  dropdownPlaceholder: {
    type: String,
    default: 'Select'
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    default: () => `input-group-${Math.random().toString(36).substring(2, 9)}`
  },
  ariaLabel: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  autoSelect: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'update:dropdownValue': [value: string | number];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
  'input': [event: Event];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
  if (props.autoSelect) {
    nextTick(() => inputRef.value?.select());
  }
};

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  input: computed(() => inputRef.value)
});
</script>