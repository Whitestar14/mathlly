<template>
  <Suspense>
    <SegmentedControl
      class="w-full flex-1"
      :model-value="currentMode"
      :options="modeOptions"
      :disable-overflow="true"
      @update:model-value="val => updateMode(val as CalculatorMode)"
    />
    <template #fallback>
      <div class="w-full inline-flex items-center rounded-md bg-muted p-1 h-10 animate-pulse" />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SegmentedControl } from '@components/ui';
import type { SegmentedOption } from '@components/ui/SegmentedControl.vue';
import type { CalculatorMode } from '../composables/useCalculatorState';
import { useCalculatorModeSwitcher } from '@calculator/composables/useCalculatorModeSwitcher';

const { currentMode, availableModes, updateMode } = useCalculatorModeSwitcher();

const modeOptions = computed<SegmentedOption[]>(() => 
  availableModes.map(mode => ({
    value: mode.value,
    label: mode.shortLabel || mode.label
  }))
);
</script>