<template>
  <div 
    class="min-h-screen flex transition-colors duration-300"
    :class="globalClasses"
  >
    <slot />
  </div>
</template>
  
<script setup lang="ts">
import { watch, onMounted, computed } from 'vue';
import { createPanelContext } from '@composables/ui/panelContext';
import { useDeviceStore } from '@stores/device';
import { useSettingsStore } from '@stores/settings';
import { usePWATheme } from '@composables/core/usePWATheme';

type TextSize = 'small' | 'normal' | 'medium' | 'large';

interface PanelActions {
  setMobile: (isMobile: boolean) => void;
}

// Store instances
const device = useDeviceStore();
const settings = useSettingsStore();
const { actions }: { actions: PanelActions } = createPanelContext();

usePWATheme();

onMounted(() => {
  actions.setMobile(device.isMobile);
});

watch(() => device.isMobile, (newIsMobile: boolean) => {
  actions.setMobile(newIsMobile);
});

const globalClasses = computed(() => {
  const classes = [];
  if (settings.appearance.animationDisabled) {
    classes.push('animation-disabled');
  }
  classes.push(`border-style-${settings.appearance.borderRadius}`);
  return classes;
});

const textSize = computed(() => 
  (settings.display.textSize as TextSize) || "medium"
);

// Update text size classes
watch(textSize, (newSize) => {
  const root = document.documentElement;
  ['small', 'normal', 'medium', 'large'].forEach(size => {
    root.classList.toggle(`ts-${size}`, size === newSize);
  });
}, { immediate: true });
</script>