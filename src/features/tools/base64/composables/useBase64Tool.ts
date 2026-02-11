import { ref, shallowRef, computed, watch, onUnmounted } from 'vue'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useBase64Options } from './useBase64Options'
import { useBase64Operations } from './useBase64Operations'
import { useFileOperations } from './useFileOperations'
import { useSampleData } from './useSampleData'

export function useBase64Tool() {
  const { toast } = useToast()
  const { copy } = useClipboard()
  const { options } = useBase64Options()
  const sample = useSampleData()

  // State
  const currentTab = ref<'encode' | 'decode'>('encode')
  const selectedFileName = ref('')
  const activePreviewUrl = ref<string | null>(null)
  
  const singleInput = shallowRef('')
  const encodeBuffer = shallowRef('')
  const decodeBuffer = shallowRef('')

  // Preserve Mode Logic
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
  const fileOps = useFileOperations(input, selectedFileName, toast, currentTab, ops.rawFileBase64)
  const outputValidationError = ref('')
  
  // --- FLICKER FIX: Delayed Loading State ---
  const isProcessing = ref(false)
  
  const startProcessing = () => {
    isProcessing.value = true
  }

  const stopProcessing = () => {
    isProcessing.value = false
  }

  const applyProcessResult = (showToastOnSuccess = false) => {
    const result = ops.processState.value
    if (!result) return

    if (!result.success) {
      outputValidationError.value = result.error?.includes('Invalid') ? result.error : ''
      if (!outputValidationError.value) {
        toast(result.error ?? 'Processing failed', { type: 'error' })
      }
    } else {
      outputValidationError.value = ''
      if (showToastOnSuccess) {
        toast(`Success`, { type: 'success' })
      }
    }
  }

  // Debounce for typing
  const debouncedProcess = useDebounceFn(async () => {
    if (!options.value.autoProcess) return
    
    // Only show loader if this takes time (avoid flicker on fast ops)
    const timer = setTimeout(() => startProcessing(), 100)
    
    await ops.processInput(currentTab.value)
    
    clearTimeout(timer)
    stopProcessing()
    applyProcessResult(false)
  }, 200)

  const triggerProcess = async () => {
    startProcessing()
    await ops.processInput(currentTab.value)
    stopProcessing()
    applyProcessResult(true)
  }

  const setInput = (val: string) => {
    input.value = val
    if (!val.startsWith('[Binary File Loaded:')) {
      selectedFileName.value = ''
      ops.rawFileBase64.value = ''
    }
    debouncedProcess()
  }

  const handleSwap = () => {
    const currOutput = ops.output.value
    if (!currOutput) return toast('Nothing to swap', { type: 'warning' })

    const newTab = currentTab.value === 'encode' ? 'decode' : 'encode'

    if (options.value.preserveMode) {
      if (currentTab.value === 'encode') decodeBuffer.value = currOutput
      else encodeBuffer.value = currOutput
    } else {
      singleInput.value = currOutput
    }
    
    currentTab.value = newTab
    selectedFileName.value = ''
    ops.rawFileBase64.value = ''
    
    triggerProcess()
    toast('Swapped', { type: 'success' })
  }

  const handleClear = () => {
    singleInput.value = ''
    encodeBuffer.value = ''
    decodeBuffer.value = ''
    ops.output.value = ''
    selectedFileName.value = ''
    ops.rawFileBase64.value = ''
    outputValidationError.value = ''
    ops.processState.value = { success: true }
  }

  const handleSample = async (type: 'text' | 'base64') => {
    const content = type === 'text' ? sample.loadSampleText() : sample.loadSampleBase64()
    if (type === 'base64') currentTab.value = 'decode'
    else currentTab.value = 'encode'

    input.value = content
    selectedFileName.value = ''
    ops.rawFileBase64.value = ''
    
    triggerProcess() // Force run
  }

  const handleRandomData = () => {
    input.value = sample.generateRandomData()
    selectedFileName.value = ''
    triggerProcess()
  }

  const processFiles = async (files: FileList) => {
    if (!files.length) return
    const mockEvent = { target: { files } } as unknown as Event
    
    if (currentTab.value === 'decode') currentTab.value = 'encode'

    startProcessing()
    const success = await fileOps.handleFileUpload(mockEvent)
    if (success) {
      await ops.processInput(currentTab.value)
      applyProcessResult(true)
    }
    stopProcessing()
  }

  const downloadOutput = () => {
      // Pass the *entire* process state, including binary buffer
      fileOps.downloadOutput(
          ops.output.value, 
          currentTab.value, 
          ops.processState.value
      )
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

  // Watch options to re-run
  watch([() => options.value, currentTab], () => {
     if (options.value.autoProcess && input.value) {
         ops.processInput(currentTab.value)
     }
  }, { deep: true })

  return {
    currentTab,
    input,
    options,
    selectedFileName,
    activePreviewUrl,
    isProcessing, // Use the new debounced ref
    outputValidationError,
    ops,
    fileOps,
    setInput,
    handleSwap,
    handleClear,
    handleSample,
    handleRandomData,
    processFiles,
    triggerProcess,
    downloadOutput,
    toast,
    copy
  }
}