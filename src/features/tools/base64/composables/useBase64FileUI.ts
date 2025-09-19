import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

export function useBase64FileUI() {
  const fileInput: Ref<HTMLInputElement | null> = ref(null);
  const dragCounter = ref(0);
  const isDragActive = ref(false);

  const onWindowDragEnter = (e: DragEvent) => {
    if (!e.dataTransfer) return;
    const hasFiles = Array.from(e.dataTransfer.types || []).includes('Files');
    if (!hasFiles) return;

    dragCounter.value += 1;
    isDragActive.value = true;
  };

  const onWindowDragLeave = (e: DragEvent) => {
    if (!e.dataTransfer) return;
    dragCounter.value = Math.max(0, dragCounter.value - 1);
    if (dragCounter.value === 0) isDragActive.value = false;
  };

  const onWindowDrop = () => {
    dragCounter.value = 0;
    isDragActive.value = false;
  };

  onMounted(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('dragenter', onWindowDragEnter as any);
    window.addEventListener('dragleave', onWindowDragLeave as any);
    window.addEventListener('drop', onWindowDrop as any);
  });

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('dragenter', onWindowDragEnter as any);
    window.removeEventListener('dragleave', onWindowDragLeave as any);
    window.removeEventListener('drop', onWindowDrop as any);
  });

  const triggerFilePicker = (): void => {
    fileInput.value?.click();
  };

  const handleDropEvent = async (
    event: DragEvent,
    handleDropFn: (e: DragEvent, fileInputRef: Ref<HTMLInputElement | null>) => Promise<void>,
    processInputFn?: (tab: 'encode' | 'decode') => Promise<any>,
    currentTabRef?: Ref<'encode' | 'decode'>,
    optionsRef?: Ref<any>
  ): Promise<void> => {
    await handleDropFn(event, fileInput);

    if (
      optionsRef?.value?.autoProcess &&
      processInputFn &&
      currentTabRef
    ) {
      await processInputFn(currentTabRef.value);
    }
  };

  return {
    fileInput,
    isDragActive,
    triggerFilePicker,
    handleDropEvent,
  };
}
