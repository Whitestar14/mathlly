<template>
  <Teleport to="#calculator-mode-switcher-slot">
    <Suspense v-if="shouldShowSwitcher">
      <div class="w-full inline-flex gap-1 items-center rounded-lg shadow-sm bg-muted dark:bg-muted/50 p-1">
        <button
          v-for="mode in availableModes"
          :key="mode.value"
          class="flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200"
          :class="[
            currentMode === mode.value 
              ? 'bg-background dark:bg-background text-muted-foreground dark:text-muted-foreground shadow-sm' 
              : 'text-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted/50'
          ]"
          @click="updateMode(mode.value)"
        >
          {{ mode.shortLabel || mode.label }}
        </button>
      </div>
      <template #fallback>
        <div class="w-full inline-flex items-center rounded-md bg-muted dark:bg-muted p-1 h-10 animate-pulse" />
      </template>
    </Suspense>
  </Teleport>
</template>

<script setup lang="ts">
import { useCalculatorModeSwitcher } from '@/composables/useCalculatorModeSwitcher'

const {
  currentMode,
  availableModes,
  updateMode,
  shouldShowSwitcher
} = useCalculatorModeSwitcher()
</script>
