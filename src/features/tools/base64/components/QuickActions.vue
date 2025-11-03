<script setup lang="ts">
import { FileText, Code, Shuffle, Trash2 } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'

defineEmits<{
  (e: 'load-sample-text'): void;
  (e: 'load-sample-base64'): void;
  (e: 'generate-random-data'): void;
  (e: 'clear-all'): void;
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <BaseButton
      variant="outline"
      class="h-auto p-4 flex flex-col items-center gap-2"
      @click="$emit('load-sample-text')">
      <FileText class="h-5 w-5" />
      <span class="text-xs">Sample Text</span>
    </BaseButton>

    <BaseButton
      variant="outline"
      class="h-auto p-4 flex flex-col items-center gap-2"
      @click="$emit('load-sample-base64')">
      <Code class="h-5 w-5" />
      <span class="text-xs">Sample Base64</span>
    </BaseButton>

    <BaseButton
      variant="outline"
      class="h-auto p-4 flex flex-col items-center gap-2"
      @click="$emit('generate-random-data')">
      <Shuffle class="h-5 w-5" />
      <span class="text-xs">Random Data</span>
    </BaseButton>

    <BaseButton
      variant="outline"
      class="h-auto p-4 flex flex-col items-center gap-2"
      @click="$emit('clear-all')">
      <Trash2 class="h-5 w-5" />
      <span class="text-xs">Clear All</span>
    </BaseButton>
  </div>
</template>
