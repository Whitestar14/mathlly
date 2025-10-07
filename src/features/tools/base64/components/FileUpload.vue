<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { Upload } from 'lucide-vue-next';

defineProps<{
  handleBinaryFiles: boolean;
  currentTab: 'encode' | 'decode';
}>();

const emit = defineEmits<{
  (e: 'file-upload', event: Event): void;
  (e: 'drop', event: DragEvent): void;
}>();

const fileInput: Ref<HTMLInputElement | null> = ref(null);

const handleClick = (): void => {
  fileInput.value?.click();
};

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault();
};

const handleDragEnter = (event: DragEvent): void => {
  event.preventDefault();
};

const handleDrop = (event: DragEvent): void => {
  event.preventDefault();
  emit('drop', event);
};
</script>

<template>
  <div
    v-if="handleBinaryFiles && currentTab === 'encode'"
    class="mb-6"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @drop.prevent="handleDrop"
  >
    <div class="border-2 border-dashed border-border rounded-lg p-8 md:py-16 md:px-36 text-center">
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        @change="emit('file-upload', $event)"
      >
      <div class="space-y-2">
        <Upload class="h-8 w-8 mx-auto text-muted-foreground" />
        <div class="text-sm text-muted-foreground">
          <button
            class="text-primary hover:underline"
            @click="handleClick"
          >
            Click to upload
          </button>
          or drag and drop a file into this zone
        </div>
        <div class="text-xs text-muted-foreground">
          Maximum file size: 10MB
        </div>
      </div>
    </div>
  </div>
</template>