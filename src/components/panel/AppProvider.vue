<template>
  <div 
    class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300"
    :class="globalClasses"
  >
    <slot />
  </div>
</template>
  
<script setup lang="ts">
import { watch, onMounted, computed, type ComputedRef } from 'vue';
import { createPanelContext } from '@/composables/usePanel';
import { useDeviceStore } from '@/stores/device';
import { useSettingsStore } from '@/stores/settings';

// Types
type TextSize = 'small' | 'normal' | 'medium' | 'large';

interface PanelActions {
  setMobile: (isMobile: boolean) => void;
}

// Store instances
const device = useDeviceStore();
const settings = useSettingsStore();
const { actions }: { actions: PanelActions } = createPanelContext();

onMounted(() => {
  const isMobile: boolean = device.isMobile;
  actions.setMobile(isMobile);
  updateTextSizeClasses(textSize.value);
});

watch(() => device.isMobile, (newIsMobile: boolean) => {
  actions.setMobile(newIsMobile);
});

// Computed properties
const globalClasses: ComputedRef<string[]> = computed(() => {
  const classes: string[] = [];
  if (settings.appearance.animationDisabled) {
    classes.push('animation-disabled');
  }
  classes.push(`border-style-${settings.appearance.borderRadius}`);
  return classes;
});

const textSize: ComputedRef<TextSize> = computed(() => 
  (settings.display.textSize as TextSize) || "medium"
);

// Methods
const updateTextSizeClasses = (newSize: TextSize): void => {
  const root = document.documentElement;
  root.classList.remove("ts-small", "ts-normal", "ts-medium", "ts-large");
  if (newSize) {
    root.classList.add(`ts-${newSize}`);
  }
};

watch(textSize, updateTextSizeClasses, { immediate: true });
</script>
