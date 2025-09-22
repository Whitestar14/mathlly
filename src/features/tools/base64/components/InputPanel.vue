<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import TextAreaField from './TextAreaField.vue'

defineProps({
  modelValue: { type: String as () => string, required: true },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  stats: { type: Object as () => any, default: null },
  showStats: { type: Boolean, default: false },
  validationError: { type: String, default: '' },
  showPasteButton: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue','input','drop','paste'])

function updateValue(v: string) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="space-y-3">
    <slot name="before" />
    <TextAreaField
      :model-value="modelValue"
      @update:model-value="updateValue"
      :label="label"
      :placeholder="placeholder"
      :stats="stats"
      :show-stats="showStats"
      :validation-error="validationError"
      :show-paste-button="showPasteButton"
      :read-only="readOnly"
      @input="$emit('input')"
      @drop="$emit('drop', $event)"
      @paste="$emit('paste')"
    >
      <slot name="actions" />
    </TextAreaField>
    <slot />
  </div>
</template>
