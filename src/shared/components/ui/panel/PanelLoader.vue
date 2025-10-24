<template>
  <Suspense>
    <component :is="component" v-bind="componentProps" />
    <template #fallback>
      <div
        v-if="isOpen || panelType === 'drawer'"
        class="fixed top-0 h-screen hidden md:flex z-20 bg-panel border-border transition-[width] duration-300"
        :class="sideClasses"
        :style="inlineSize"
      />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  component: any;
  isOpen: boolean;
  side: 'left' | 'right';
  widthRem?: number; 
  widthPx?: number; 
  componentProps?: Record<string, any>;
  panelType?: 'side' | 'drawer';
}

const props = withDefaults(defineProps<Props>(), {
  panelType: 'side'
});

const sideClasses = computed(() => {
  if (props.panelType === 'drawer') {
    return 'right-0 border-l';
  }
  return props.side === 'left'
    ? 'left-0 border-r'
    : 'right-0 border-l';
});

const inlineSize = computed(() => {
  if (props.panelType === 'drawer' && !props.isOpen) {
    return { width: '2.5rem' };
  }
  if (props.widthPx) return { width: `${props.widthPx}px` };
  const rem = props.widthRem ?? 16; 
  return { width: `${rem}rem` };
});
</script>