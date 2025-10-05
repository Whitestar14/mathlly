<template>
  <span
    class="inline-flex items-center text-xs px-2 py-1 font-medium rounded-full border"
    :class="variantClasses"
  >
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BADGE_VARIANTS, type BadgeVariant } from '@composables/ui/useBadge';

interface Props {
  variant?: BadgeVariant;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  text: '',
  size: 'md'
});

const variantClasses = computed(() => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full border';
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return `${baseClasses} ${sizeClasses[props.size]} ${BADGE_VARIANTS[props.variant]}`;
});
</script>