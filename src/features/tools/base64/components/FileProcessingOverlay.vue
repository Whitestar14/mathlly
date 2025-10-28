<script setup lang="ts">
import { BaseLoader } from '@components/ui'

defineProps({
  open: { type: Boolean, required: true }
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/50 p-4" aria-live="polite">
    <div class="w-full max-w-xs rounded-lg bg-background/90 dark:bg-background/90 p-6">
      <div class="flex flex-col items-center gap-4">
        <BaseLoader variant="expanded" :size="32" :message="'Processing file... this may take a moment'" />
      </div>
    </div>
  </div>
</template>
