<template>
  <span
    class="inline-flex items-center font-mono text-xs px-2 py-0.5 font-medium rounded-full"
    :class="variantClasses"
  >
    <span
      v-if="showNotch"
      class="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1.5"
    />
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
  showNotch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  text: '',
  size: 'md',
  showNotch: false
});

const variantClasses = computed(() => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return `${baseClasses} ${sizeClasses[props.size]} ${BADGE_VARIANTS[props.variant]}`;
});
</script>