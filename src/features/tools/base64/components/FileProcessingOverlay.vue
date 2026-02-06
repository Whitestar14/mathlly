<script setup lang="ts">
import { BaseLoader } from '@components/ui'

defineProps({
  open: { type: Boolean, required: true }
})
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-backdrop-surface/40 dark:bg-backdrop-surface/50 p-4"
    aria-live="polite">
    <div class="w-full max-w-xs max-h-xs aspect-square flex items-center justify-center rounded-lg bg-secondary p-6">
      <div class="flex flex-col items-center gap-4">
        <BaseLoader
          variant="expanded"
          :size="32"
          :message="'Processing...'" />
      </div>
    </div>
  </div>
</template>
