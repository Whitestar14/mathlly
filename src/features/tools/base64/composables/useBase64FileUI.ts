import { ref, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export function useBase64FileUI() {
  const fileInput: Ref<HTMLInputElement | null> = ref(null)
  const dragCounter = ref(0)
  const isDragActive = ref(false)

  useEventListener(window, 'dragenter', (e: DragEvent) => {
    if (!e.dataTransfer) return
    const hasFiles = Array.from(e.dataTransfer.types || []).includes('Files')
    if (!hasFiles) return

    dragCounter.value += 1
    isDragActive.value = true
  })

  useEventListener(window, 'dragleave', (e: DragEvent) => {
    if (!e.dataTransfer) return
    dragCounter.value = Math.max(0, dragCounter.value - 1)
    if (dragCounter.value === 0) isDragActive.value = false
  })

  useEventListener(window, 'drop', () => {
    dragCounter.value = 0
    isDragActive.value = false
  })

  const triggerFilePicker = (): void => {
    fileInput.value?.click()
  }

  const handleDropEvent = async(
    event: DragEvent,
    handleDropFn: (e: DragEvent, fileInputRef: Ref<HTMLInputElement | null>) => Promise<void>,
    processInputFn?: (tab: 'encode' | 'decode') => Promise<any>,
    currentTabRef?: Ref<'encode' | 'decode'>,
    optionsRef?: Ref<any>
  ): Promise<void> => {
    await handleDropFn(event, fileInput)

    if (
      optionsRef?.value?.autoProcess &&
      processInputFn &&
      currentTabRef
    ) {
      await processInputFn(currentTabRef.value)
    }
  }

  return {
    fileInput,
    isDragActive,
    triggerFilePicker,
    handleDropEvent
  }
}
