<template>
  <Suspense>
    <component
      :is="component"
      v-bind="componentProps"
    />
    <template #fallback>
      <div
        class="relative md:flex h-full flex-col flex-auto overflow-hidden hidden transition-[width] duration-300 ease-in-out bg-background border-border"
        :class="[borderClasses, widthClass]"
      >
        <div
          v-if="isOpen"
          class="flex flex-col h-full"
        >
          <!-- Header section -->
          <div class="flex-shrink-0 h-14 px-3 border-b border-border flex items-center justify-between">
            <div class="h-4 w-32 bg-muted rounded animate-pulse" />
            <div class="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>
          <!-- Content section -->
          <div class="flex-1 p-3 space-y-3">
            <div class="h-20 bg-muted rounded animate-pulse" />
            <div class="h-20 bg-muted rounded animate-pulse" />
            <div class="h-20 bg-muted rounded animate-pulse" />
            <div class="h-20 bg-muted rounded animate-pulse" />
          </div>
          <!-- Footer section -->
          <div class="flex-shrink-0 border-t border-border p-3 h-14">
            <div class="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div
          v-else
          class="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-muted rounded-md animate-pulse"
        />
      </div>
    </template>
  </Suspense>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
  
interface Props {
  component: any;
  isOpen: boolean;
  position?: 'left' | 'right';
  componentProps?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  componentProps: () => ({}),
});
  
const borderClasses = computed(() => {
  return props.position === 'left' ? 'border-l' : 'border-r';
});
  
const widthClass = computed(() => {
  return props.isOpen ? 'max-w-64 min-w-64' : 'max-w-10 min-w-10';
});
</script>
