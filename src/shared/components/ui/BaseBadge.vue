<template>
  <span
    class="inline-flex items-center ml-auto text-xs px-2 py-0.5 font-medium font-mono rounded-full"
    :class="badgeConfig.classes"
  >
    <span 
      v-if="showNotch"
      class="h-2 w-2 rounded-full mr-2"
      :class="[badgeConfig.notch, { 'animate-pulse': pulse || badgeConfig.shouldPulse }]"
      aria-hidden="true" 
    />
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useBadge, type BadgeVariant } from '@composables/ui/useBadge';

interface Props {
  variant?: BadgeVariant;
  type?: BadgeVariant; // Backward compatibility
  text?: string;
  showNotch?: boolean;
  pulse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: undefined,
  type: 'soon',
  text: '',
  showNotch: false,
  pulse: false
});

// Use variant if provided, otherwise fall back to type
const effectiveVariant: ComputedRef<BadgeVariant> = computed(() => props.variant || props.type || 'soon');
const badgeConfig = useBadge(effectiveVariant.value, props.text);
const displayText: ComputedRef<string> = computed(() => props.text || badgeConfig.value.text);
</script>
