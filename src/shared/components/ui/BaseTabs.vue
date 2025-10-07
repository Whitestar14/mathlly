<script setup lang="ts">
import { ref, type Ref, watch, toRef } from 'vue';
import { usePills } from '@composables/ui/usePills';
import { PillIndicator as Indicator } from '@components/ui';

// Props follow v-model convention so the component can be used with v-model:currentTab
const props = defineProps<{
  tabs: Array<{ value: string; label: string }>;
  modelValue?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'tab-change', value: string, element: HTMLElement | null): void;
}>();

// Refs for DOM elements (array of tab elements)
const tabElements: Ref<HTMLElement[] | null> = ref(null);

// Default initial tab value
const defaultTab = (props.tabs && props.tabs[0] && props.tabs[0].value) || '';

// Use pills composable with containerRef pointing to tabElements
const { indicatorStyle, handleNavigation, initializePills, currentPill } = usePills({
  position: 'bottom',
  updateRoute: false,
  defaultPill: props.modelValue ?? defaultTab,
  containerRef: tabElements as any,
  onNavigate: (tabValue: string) => {
    // Emit simplified tab-change for parent
    const el = (tabElements?.value as any)?.find?.((el: HTMLElement) => el?.dataset?.path === tabValue) ?? null;
    emit('tab-change', tabValue, el);
    emit('update:modelValue', tabValue);
  }
});

// Keep local model in sync with incoming modelValue
const externalValue = toRef(props, 'modelValue');
watch(externalValue, (v) => {
  if (v && v !== currentPill.value) {
    // Try to initialize to the provided value
    initializePills(v as string, tabElements as any);
  }
});

// Public API for parent components
defineExpose({ initializePills });

// Handle click on a tab item
const handleTabClick = async (tabValue: string, element: HTMLElement | null) => {
  await handleNavigation(tabValue, element);
  emit('tab-change', tabValue, element);
  emit('update:modelValue', tabValue);
};
</script>

<template>
  <div class="flex items-center border-b border-border dark:border-border bg-muted/50 dark:bg-background/50 relative">
    <div class="flex-1 relative">
      <Indicator :position="indicatorStyle" />
      <div class="flex">
        <div
          v-for="tab in props.tabs"
          :key="tab.value"
          ref="tabElements"
          :data-path="tab.value"
          role="button"
          tabindex="0"
          class="px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer"
          :class="[
            (props.modelValue ?? currentPill) === tab.value
              ? 'text-primary dark:text-primary'
              : 'text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground',
          ]"
          @click="handleTabClick(tab.value, $event.target as HTMLElement)"
          @keydown.enter.prevent="handleTabClick(tab.value, $event.target as HTMLElement)"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- Right-side actions slot -->
    <div class="flex items-center gap-2 px-4">
      <slot name="actions" />
    </div>
  </div>
</template>
