<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { usePills } from '@composables/ui/usePills';
import { PillIndicator as Indicator } from '@components/ui';

const props = defineProps<{
  tabs: Array<{ value: string; label: string }>;
  currentTab: string;
}>();

const emit = defineEmits<{
  (e: 'tab-change', value: string, element: HTMLElement): void;
}>();

const tabElements: Ref<HTMLElement[]> = ref([]);
const { indicatorStyle, handleNavigation, initializePills } = usePills({
  position: 'bottom',
  updateRoute: false,
  defaultPill: (props.tabs && props.tabs[0] && props.tabs[0].value) || 'tab',
  containerRef: tabElements,
  onNavigate: (tabValue: string) => {
    const el = tabElements.value.find((el) => el.dataset.path === tabValue)!;
    emit('tab-change', tabValue, el);
  }
});

const handleTabChange = async (tabValue: string, element: HTMLElement): Promise<void> => {
  await handleNavigation(tabValue, element);
  emit('tab-change', tabValue, element);
};

defineExpose({ initializePills });
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
          class="px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer"
          :class="[
            props.currentTab === tab.value
              ? 'text-primary dark:text-primary'
              : 'text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground',
          ]"
          @click="handleTabChange(tab.value, $event.target as HTMLElement)"
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
