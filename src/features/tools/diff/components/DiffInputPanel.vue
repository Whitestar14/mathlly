<template>
  <div class="flex flex-col gap-4">
    <!-- Action Bar -->
    <div class="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border">
      <div class="flex gap-2">
        <BaseButton variant="secondary" size="sm" @click="$emit('sample')">
          <Wand2Icon class="w-4 h-4 mr-2" /> Sample
        </BaseButton>
        <BaseButton variant="secondary" size="sm" title="Swap Original and Modified" @click="$emit('swap')">
          <ArrowLeftRightIcon class="w-4 h-4" />
        </BaseButton>
      </div>
      <div>
        <BaseButton variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10" @click="$emit('clear')">
          <Trash2Icon class="w-4 h-4 mr-2" /> Clear All
        </BaseButton>
      </div>
    </div>

    <!-- Editors -->
    <div class="flex-1 flex flex-col gap-4 min-h-0 min-w-0">

      <!-- Original Text Editor -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0 relative">
        <BaseFileDrop
          variant="overlay"
          :show="isDragOriginalActive"
          title="Drop Original File"
          @files="handleOriginalDrop" />

        <BaseEditor
          :model-value="original"
          placeholder="Paste original text here or drag a file..."
          default-status="Original Text"
          class="flex-1 min-w-0"
          @update:model-value="$emit('update:original', $event)" />
      </div>

      <!-- Modified Text Editor -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0 relative">
        <BaseFileDrop
          variant="overlay"
          :show="isDragModifiedActive"
          title="Drop Modified File"
          @files="handleModifiedDrop" />

        <BaseEditor
          :model-value="modified"
          placeholder="Paste modified text here or drag a file..."
          default-status="Modified Text"
          class="flex-1"
          @update:model-value="$emit('update:modified', $event)" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Wand2Icon, Trash2Icon, ArrowLeftRightIcon } from 'lucide-vue-next'
import { BaseEditor, BaseButton, BaseFileDrop } from '@components/ui'
import { useDragDrop } from '@composables/useDragDrop'

interface Props {
  original: string
  modified: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:original', value: string): void
  (e: 'update:modified', value: string): void
  (e: 'sample'): void
  (e: 'clear'): void
  (e: 'swap'): void
  (e: 'uploadOriginal', file: File): void
  (e: 'uploadModified', file: File): void
}>()

const { isDragActive: isDragOriginalActive } = useDragDrop()
const { isDragActive: isDragModifiedActive } = useDragDrop()

const handleOriginalDrop = (files: FileList) => {
  if (files.length > 0) emit('uploadOriginal', files[0])
}

const handleModifiedDrop = (files: FileList) => {
  if (files.length > 0) emit('uploadModified', files[0])
}
</script>
