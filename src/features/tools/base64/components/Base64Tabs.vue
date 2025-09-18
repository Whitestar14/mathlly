<script setup lang="ts">
import { BaseTabs } from '@components/ui'
import { ref } from 'vue'

const props = defineProps<{
  tabs: Array<{ value: string; label: string }>;
  currentTab: string;
}>();

const emit = defineEmits<{
  (e: 'tab-change', value: string, element: HTMLElement): void;
}>();

const tabsRef = ref<any>(null);

const onTabChange = (value: string, el: HTMLElement) => {
  emit('tab-change', value, el);
};

const initializePills = (defaultPill: string) => {
  tabsRef.value?.initializePills(defaultPill);
};

defineExpose({ initializePills });
</script>

<template>
  <BaseTabs
    ref="tabsRef"
    :tabs="props.tabs"
    :current-tab="props.currentTab"
    @tab-change="onTabChange"
  >
    <template #actions>
      <slot name="actions" />
    </template>
  </BaseTabs>
</template>