import { ref, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export function useJsonFileUI() {
  const isDragActive = ref(false)
  const dragCounter = ref(0)

  // Global drag listeners to detect when file is dragged over the window
  useEventListener(window, 'dragenter', (e: DragEvent) => {
    if (!e.dataTransfer) return
    // Simple check to ensure we are dragging files, not just text
    const hasFiles = Array.from(e.dataTransfer.types || []).includes('Files')
    if (!hasFiles) return

    e.preventDefault()
    dragCounter.value += 1
    isDragActive.value = true
  })

  useEventListener(window, 'dragleave', (e: DragEvent) => {
    if (!e.dataTransfer) return
    e.preventDefault()
    
    dragCounter.value = Math.max(0, dragCounter.value - 1)
    if (dragCounter.value === 0) {
      isDragActive.value = false
    }
  })

  useEventListener(window, 'drop', (e: DragEvent) => {
    e.preventDefault()
    dragCounter.value = 0
    isDragActive.value = false
  })

  // Helper to trigger the hidden file input
  const triggerFilePicker = (inputRef: Ref<HTMLInputElement | null>): void => {
    inputRef.value?.click()
  }

  return {
    isDragActive,
    triggerFilePicker
  }
}
