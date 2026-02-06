<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { Upload } from 'lucide-vue-next'

defineProps<{
  handleBinaryFiles: boolean;
  currentTab: 'encode' | 'decode';
}>()

const emit = defineEmits<{
  (e: 'file-upload', event: Event): void;
  (e: 'drop', event: DragEvent): void;
}>()

const fileInput: Ref<HTMLInputElement | null> = ref(null)

const handleClick = (): void => {
  fileInput.value?.click()
}

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
}

const handleDragEnter = (event: DragEvent): void => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent): void => {
  event.preventDefault()
  emit('drop', event)
}
</script>

<template>
  <div
    v-if="handleBinaryFiles"
    class="m-3 pointer-events-none"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @drop.prevent="handleDrop">
    <div class="border-2 border-dashed border-primary/50 bg-background/95 backdrop-blur rounded-lg p-8 md:py-16 md:px-36 text-center shadow-2xl animate-in fade-in duration-200">
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        @change="emit('file-upload', $event)" />
      <div class="space-y-4 pointer-events-auto">
        <div class="p-4 bg-primary/10 rounded-full inline-block">
          <Upload class="h-10 w-10 text-primary" />
        </div>
        <div class="space-y-1">
          <h3 class="text-lg font-medium">Drop file to {{ currentTab === 'decode' ? 'Process' : 'Encode' }}</h3>
          <div class="text-sm text-muted-foreground">
            <button
              class="text-primary hover:underline font-medium"
              @click="handleClick">
              Click to upload
            </button>
            or drag and drop here
          </div>
        </div>
        <div class="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-full inline-block">
          Maximum file size: 20MB
        </div>
      </div>
    </div>
  </div>
</template>
