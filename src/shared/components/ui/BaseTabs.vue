<script setup lang="ts">
import { ref, type Ref, watch, toRef } from 'vue';
import { usePills } from '@composables/ui/usePills';
import { PillIndicator as Indicator } from '@components/ui';

const props = defineProps<{
  tabs: Array<{ value: string; label: string }>;
  position?: 'bottom' |'left' | 'right' | 'top';
  modelValue?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'tab-change', value: string, element: HTMLElement | null): void;
}>();

const tabElements: Ref<HTMLElement[] | null> = ref(null);

const defaultTab = (props.tabs && props.tabs[0] && props.tabs[0].value) || '';

const { indicatorStyle, handleNavigation, initializePills, currentPill } = usePills({
  position: props.position ?? 'bottom',
  updateRoute: false,
  defaultPill: props.modelValue ?? defaultTab,
  containerRef: tabElements as any,
  onNavigate: (tabValue: string) => {
    const el = (tabElements?.value as any)?.find?.((el: HTMLElement) => el?.dataset?.path === tabValue) ?? null;
    emit('tab-change', tabValue, el);
    emit('update:modelValue', tabValue);
  }
});

const externalValue = toRef(props, 'modelValue');
watch(externalValue, (v) => {
  if (v && v !== currentPill.value) {
    initializePills(v as string, tabElements as any);
  }
});

defineExpose({ initializePills });

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
