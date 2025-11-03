<template>
  <AccordionRoot
    :type="multiple ? 'multiple' : 'single'"
    :collapsible="collapsible"
    :default-value="defaultValue"
    :value="modelValue"
    class="w-full divide-y divide-border rounded-md border border-border bg-background"
    :class="rootClass"
    @update:value="$emit('update:modelValue', $event)">
    <slot></slot>
  </AccordionRoot>
</template>

<script setup>
import { AccordionRoot } from 'radix-vue'

defineProps({
  modelValue: { type: [String, Array], default: undefined },
  defaultValue: { type: [String, Array], default: null },
  multiple: { type: Boolean, default: true },
  collapsible: { type: Boolean, default: true },
  rootClass: { type: String, default: '' }
})

defineEmits(['update:modelValue'])
</script>
