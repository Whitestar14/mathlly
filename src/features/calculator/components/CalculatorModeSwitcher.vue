<template>
  <Suspense>
    <div class="w-full inline-flex gap-1 items-center rounded-lg shadow-sm bg-secondary p-1">
      <button
        v-for="mode in availableModes"
        :key="mode.value"
        class="flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200"
        :class="[
          currentMode === mode.value
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-foreground hover:bg-card/40 hover:text-card-foreground/90',
        ]"
        @click="updateMode(mode.value)"
      >
        {{ mode.shortLabel || mode.label }}
      </button>
    </div>
    <template #fallback>
      <div class="w-full inline-flex items-center rounded-md bg-muted p-1 h-10 animate-pulse" />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { useCalculatorModeSwitcher } from '@calculator/composables/useCalculatorModeSwitcher';

const { currentMode, availableModes, updateMode } = useCalculatorModeSwitcher();
</script>
