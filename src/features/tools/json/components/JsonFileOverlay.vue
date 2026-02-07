<template>
  <Transition name="fade">
    <div
      v-if="active"
      class="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      @dragover.prevent
      @drop.prevent="onDrop">
      
      <div 
        class="w-full max-w-lg border-2 border-dashed border-primary/50 bg-card rounded-xl p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div class="p-4 bg-primary/10 rounded-full inline-flex items-center justify-center mb-4">
          <FileJson class="h-10 w-10 text-primary" />
        </div>
        
        <h3 class="text-xl font-semibold text-foreground mb-2">
          Drop JSON file
        </h3>
        
        <p class="text-sm text-muted-foreground">
          Release to load content into the editor
        </p>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { FileJson } from 'lucide-vue-next'

defineProps<{
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'file-dropped', files: FileList): void
}>()

const onDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    emit('file-dropped', files)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
