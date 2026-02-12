import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export function useDragDrop() {
  const isDragActive = ref(false)
  const dragCounter = ref(0)

  useEventListener(window, 'dragenter', (e: DragEvent) => {
    // Only activate if dragging files (not just selecting text)
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
      dragCounter.value++
      isDragActive.value = true
    }
  })

  useEventListener(window, 'dragleave', (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
      dragCounter.value--
      if (dragCounter.value <= 0) {
        dragCounter.value = 0
        isDragActive.value = false
      }
    }
  useEventListener(window, 'dragover', (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
    }
  })

  useEventListener(window, 'drop', (e: DragEvent) => {
    e.preventDefault()
    dragCounter.value = 0
    isDragActive.value = false
  })  })

  const resetDragState = () => {
    dragCounter.value = 0
    isDragActive.value = false
  }

  return { isDragActive, resetDragState }
}