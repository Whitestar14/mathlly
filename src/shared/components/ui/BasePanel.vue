<template>
  <div class="relative z-20 flex flex-col flex-initial">
    <div
      v-if="!isMobile"
      class="h-full"
    >
      <!-- Side Panel -->
      <SidePanel
        v-if="type === 'side'"
        v-bind="panelProps"
        :position="position"
        @close="close"
        @toggle="toggle"
      >
        <template #default>
          <slot />
        </template>
        <template #sticky>
          <slot name="sticky" />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
        <template
          v-if="$slots.footer"
          #footer
        >
          <slot name="footer" />
        </template>
      </SidePanel>

      <!-- Desktop Panel -->
      <DesktopPanel
        v-if="type === 'drawer'"
        v-bind="panelProps"
        :position="position"
        @close="close"
        @toggle="toggle"
      >
        <template #default>
          <slot />
        </template>
        <template #sticky>
          <slot name="sticky" />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
        <template
          v-if="$slots.footer"
          #footer
        >
          <slot name="footer" />
        </template>
      </DesktopPanel>
    </div>

    <!-- Mobile Panel -->
    <div v-else>
      <!-- Backdrop (mobile only) -->
      <Transition :name="animationEnabled ? 'fade' : ''">
        <div
          v-show="isOpen"
          class="fixed inset-0 z-20"
          :class="backdropClasses"
          aria-hidden="true"
          @click="() => close()"
        />
      </Transition>

      <!-- Bottom Panel -->
      <BottomPanel
        v-bind="mobileProps"
        @close="close"
        @toggle="toggle({ expanded: true })"
      >
        <template #default>
          <slot />
        </template>
        <template #sticky>
          <slot name="sticky" />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
        <template
          v-if="$slots.footer"
          #footer
        >
          <slot name="footer" />
        </template>
      </BottomPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { usePanel } from '@composables/ui/usePanel';
import type { PanelAPI } from '@composables/ui/types';
import { useSettingsStore } from '@stores/settings';

// Define props interface
interface Props {
  id: string;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
  mainClass?: string;
  contentClass?: string;
  type?: string;
  position?: 'left' | 'right';
  maxHeightRatio?: number;
  snapThreshold?: number;
  storageKey?: string;
  defaultDesktopState?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
  title: '',
  mainClass: '',
  contentClass: '',
  type: 'drawer',
  position: 'right',
  maxHeightRatio: 0.8,
  snapThreshold: 0.3,
  storageKey: 'panel',
  defaultDesktopState: false,
});

const SidePanel = defineAsyncComponent(() =>
  import('./panel/SidePanel.vue')
);

const DesktopPanel = defineAsyncComponent(() =>
  import('./panel/DesktopPanel.vue')
);

const BottomPanel = defineAsyncComponent(() =>
  import('./panel/BottomPanel.vue')
);

const settingsStore = useSettingsStore();
const animationEnabled = computed(() => !settingsStore.appearance.animationDisabled);

const options = {
  storageKey: props.id || props.storageKey,
  defaultDesktopState: props.defaultDesktopState,
  maxHeightRatio: props.maxHeightRatio,
  snapThreshold: props.snapThreshold,
  animation: () => animationEnabled.value,
};

// Get the panel instance and cast to PanelAPI
const panelInstance = usePanel(props.id, options) as PanelAPI;

// Extract properties from the panel instance
const {
  isOpen,
  isMobile,
  isExpanded,
  toggle,
  close,
  handle,
  panel,
  isDragging,
  panelHeight,
  translateY
} = panelInstance;

const panelProps = computed(() => ({
  isOpen: isOpen.value,
  title: props.title,
  showHeader: props.showHeader,
  showFooter: props.showFooter,
  contentClass: props.contentClass,
  mainClass: props.mainClass,
}));

const mobileProps = computed(() => ({
  ...panelProps.value,
  panel: panel,
  handle: handle,
  isExpanded: isExpanded.value,
  isDragging: isDragging.value,
  translateY: translateY.value,
  panelHeight: panelHeight.value,
  maxHeightRatio: props.maxHeightRatio,
  animationEnabled: animationEnabled.value,
}));

// Add backdropClasses computed property from BottomPanel.vue
const backdropClasses = computed(() => [
  isDragging.value ? 'bg-backdrop/20' : 'bg-backdrop/40',
  animationEnabled.value
    ? 'backdrop-blur-sm transition-colors duration-300'
    : 'bg-backdrop/50',
]);
</script>

<style scoped>
:deep(.panel-side) {
  @apply overflow-hidden h-screen hidden md:flex flex-col fixed top-0 z-20 bottom-0 bg-background inset-y-0;
}
</style>
