<!-- src/shared/components/layout/app/HeaderDock.vue -->
<template>
  <div class="w-full flex items-center gap-2">
    <Suspense>
      <template v-for="Widget in widgets" :key="Widget">
        <component :is="Widget" />
      </template>
      <template #fallback>
        <div class="w-full inline-flex items-center rounded-md bg-muted p-1 h-10 animate-pulse" />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { headerWidgetRegistry, type HeaderWidgetName } from './headerWidgets';

const route = useRoute();

// meta.header.widgetNames: string[] (registry keys)
const widgets = computed(() => {
  const names = (route.meta?.header as any)?.widgetNames as HeaderWidgetName[] | undefined;
  if (!names || !Array.isArray(names)) return [];
  return names
    .map((n) => headerWidgetRegistry[n])
    .filter(Boolean);
});
</script>
