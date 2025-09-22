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
  readOnly: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(v: string) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="space-y-3">
    <TextAreaField
      :model-value="modelValue"
      @update:model-value="updateValue"
      :label="label"
      :placeholder="placeholder"
      :stats="stats"
      :show-stats="showStats"
      :validation-error="validationError"
      :read-only="readOnly"
    >
      <slot name="actions" />
    </TextAreaField>
  </div>
</template>
