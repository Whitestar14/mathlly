<script setup>
import { Loader2Icon } from 'lucide-vue-next';
defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'default',
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      size === 'default' ? 'btn-default-size' : `btn-${size}`,
      variant === 'default' ? 'btn-default' : `btn-${variant}`,
      'btn'
    ]"
    aria-label="button"
  >
    <Loader2Icon
      v-if="loading"
      class="h-4 w-4 animate-spin"
    />
    <slot />
  </button>
</template>

