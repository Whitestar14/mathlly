import { ref, shallowRef, computed, watch, onUnmounted } from 'vue'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'

import { useBase64Options } from './useBase64Options'
import { useBase64Operations } from './useBase64Operations'
import { useFileOperations } from './useFileOperations'
import { useSampleData } from './useSampleData'

// [REMOVED] import { useBase64FileUI } from './useBase64FileUI'

export function useBase64Tool() {
  const { toast } = useToast()
  const { copy } = useClipboard()
  const { options } = useBase64Options()
  const sample = useSampleData()
  
  // [REMOVED] const fileUI = useBase64FileUI()

  const currentTab = ref<'encode' | 'decode'>('encode')
  const selectedFileName = ref('')
  const activePreviewUrl = ref<string | null>(null)
  
  const singleInput = shallowRef('')
  const encodeBuffer = shallowRef('')
  const decodeBuffer = shallowRef('')

  const input = computed<string>({
    get() {
      if (options.value.preserveMode) {
        return currentTab.value === 'encode' ? encodeBuffer.value : decodeBuffer.value
      }
      return singleInput.value
    },
    set(v: string) {
      if (options.value.preserveMode) {
        if (currentTab.value === 'encode') encodeBuffer.value = v
        else decodeBuffer.value = v
      } else {
        singleInput.value = v
      }
    }
  })

  const ops = useBase64Operations(input, options)
  
  const fileOps = useFileOperations(
    input,
    selectedFileName,
    toast,
    currentTab,
    ops.rawFileBase64
  )

  const outputValidationError = ref('')
  const isFileProcessing = ref(false)

  const applyProcessResult = (showToastOnSuccess = false) => {
    const result = ops.processState.value
    if (!result) return

    if (!result.success) {
      outputValidationError.value = result.error?.includes('Invalid Base64') 
        ? result.error 
        : ''
      if (!outputValidationError.value) {
        toast(result.error ?? 'Processing failed', { type: 'error' })
      }
    } else {
      outputValidationError.value = ''
      if (showToastOnSuccess) {
        toast(`Successfully ${currentTab.value === 'encode' ? 'encoded' : 'decoded'}!`, { type: 'success' })
      }
    }
  }

  const debouncedProcess = useDebounceFn(async (tab: 'encode' | 'decode') => {
    if (!options.value.autoProcess) return
    await ops.processInput(tab)
    applyProcessResult(false)
  }, 300)

  // Actions
  const handleInput = async () => {
    if (input.value.startsWith('[Binary File Loaded:')) {
      selectedFileName.value = ''
      ops.rawFileBase64.value = ''
    }
    await debouncedProcess(currentTab.value)
  }

  const handleSwap = () => {
    const currOutput = ops.output.value
    if (options.value.preserveMode) {
      if (currentTab.value === 'encode') decodeBuffer.value = currOutput
      else encodeBuffer.value = currOutput
    } else {
      singleInput.value = currOutput
    }
    selectedFileName.value = ''
    ops.rawFileBase64.value = ''
    currentTab.value = currentTab.value === 'encode' ? 'decode' : 'encode'
    toast('Input and output swapped!', { type: 'success' })
  }

  const handleClear = () => {
    singleInput.value = ''
    encodeBuffer.value = ''
    decodeBuffer.value = ''
    ops.output.value = ''
    selectedFileName.value = ''
    ops.rawFileBase64.value = ''
    ops.validationError.value = ''
    outputValidationError.value = ''
    ops.processState.value = { success: true }
    toast('All fields cleared!', { type: 'success' })
  }

  const handleSample = async (type: 'text' | 'base64') => {
    input.value = type === 'text' ? sample.loadSampleText() : sample.loadSampleBase64()
    selectedFileName.value = ''
    ops.rawFileBase64.value = ''
    if (options.value.autoProcess) {
      await ops.processInput(type === 'text' ? 'encode' : 'decode')
      applyProcessResult(true)
    }
  }

  // File Handling
  // [REMOVED] const onFileUpload = ... (Old complex handler)
  // [REMOVED] const onDrop = ... (Old complex handler)

  /**
   * New Simplified File Processor
   * Handles files from Drag&Drop or File Input
   */
  const processFiles = async (files: FileList) => {
    if (!files.length) return
    
    // Create a mock event because fileOps expects an Event object currently
    const mockEvent = { target: { files } } as unknown as Event

    try {
      isFileProcessing.value = true
      // Reuse the existing fileOps logic
      const success = await fileOps.handleFileUpload(mockEvent)
      if (success) {
        await ops.processInput(currentTab.value)
        applyProcessResult(true)
      }
    } finally {
      setTimeout(() => (isFileProcessing.value = false), 150)
    }
  }

  // Watchers
  watch(() => ops.processState.value, (newState) => {
    if (activePreviewUrl.value) {
      URL.revokeObjectURL(activePreviewUrl.value)
      activePreviewUrl.value = null
    }
    if (newState.success && newState.isBinary && newState.binary) {
      const mime = newState.mime || 'application/octet-stream'
      if (mime.startsWith('image/') || mime === 'application/pdf') {
        const blob = new Blob([newState.binary as unknown as BlobPart], { type: mime })
        activePreviewUrl.value = URL.createObjectURL(blob)
      }
    }
  }, { immediate: true })

  onUnmounted(() => {
    if (activePreviewUrl.value) URL.revokeObjectURL(activePreviewUrl.value)
  })

  watch([options, currentTab], async () => {
    if (options.value.autoProcess && input.value.trim()) {
      await ops.processInput(currentTab.value)
      applyProcessResult(false)
    }
  }, { deep: true })

  return {
    currentTab,
    input,
    options,
    selectedFileName,
    activePreviewUrl,
    isFileProcessing,
    outputValidationError,
    
    ops,
    fileOps,
    // [REMOVED] fileUI,
    
    handleInput,
    handleSwap,
    handleClear,
    handleSample,
    processFiles, // New API
    // [REMOVED] onFileUpload, onDrop
    
    toast,
    copy
  }
}