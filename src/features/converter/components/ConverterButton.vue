<template>
  <button
    :class="[
      'calc-btn min-h-[44px] md:min-h-[3rem]',
      `calc-${variant}-btn`,
      {
        'disabled:opacity-50 disabled:cursor-not-allowed': disabled,
        'calc-btn-disabled': disabled
      }
    ]"
    :disabled="disabled"
    @click="$emit('click', value)">
    <component
      :is="icon"
      v-if="icon"
      class="w-6 h-6 mx-auto"
      :class="{ 'opacity-50': disabled }" />
    <slot v-else>
      {{ value }}
    </slot>
  </button>
</template>

<script setup>
defineProps({
  value: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'number',
    validator: val => ['number', 'function', 'operator'].includes(val)
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>