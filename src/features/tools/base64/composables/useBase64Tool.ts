import { ref, shallowRef, computed, watch, onUnmounted } from 'vue'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useBase64Options } from './useBase64Options'
import { useBase64Operations } from './useBase64Operations'
import { useFileOperations } from './useFileOperations'
import { useSampleData } from './useSampleData'
import type { InputMode, FileDetails } from '../types/base64'

export function useBase64Tool() {
  const { toast } = useToast()
  const { copy } = useClipboard()
  const { options } = useBase64Options()
  const sample = useSampleData()

  // State
  const currentTab = ref<'encode' | 'decode'>('encode')
  const activePreviewUrl = ref<string | null>(null)
  
  // Buffers for Preserve Mode
  const singleInput = shallowRef('')
  const encodeBuffer = shallowRef('')
  const decodeBuffer = shallowRef('')

  // Input Mode States
  const inputMode = ref<InputMode>('text')
  const fileDetails = ref<FileDetails | null>(null)

  // Computed input based on mode
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

  const ops = useBase64Operations(input, inputMode, options)
  const fileOps = useFileOperations(input, inputMode, fileDetails, currentTab, ops.rawFileBase64)
  const outputValidationError = ref('')
  
  // --- FLICKER FIX: Delayed Loading State ---
  const isProcessing = ref(false)
  
  const startProcessing = () => { isProcessing.value = true }
  const stopProcessing = () => { isProcessing.value = false }

  const applyProcessResult = (showToastOnSuccess = false) => {
    const result = ops.processState.value
    if (!result) return

    if (!result.success) {
      outputValidationError.value = result.error?.includes('Invalid') ? result.error : ''
      if (!outputValidationError.value) {
        // If it's not a validation error (logic error), we show a toast.
        // Validation errors are now shown inline in the output panel.
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

  // User manual typing
  const setInput = (val: string) => {
    // If user types, we switch back to text mode automatically
    if (inputMode.value === 'file') {
       inputMode.value = 'text'
       fileDetails.value = null
       ops.rawFileBase64.value = ''
    }
    input.value = val
    debouncedProcess()
  }

  const handleSwap = async () => {
    const currOutput = ops.output.value
    if (!currOutput) return toast('Nothing to swap', { type: 'warning' })

    const newTab = currentTab.value === 'encode' ? 'decode' : 'encode'

    // We can't easily swap "file mode" to text input, so we convert result to text input
    inputMode.value = 'text'
    fileDetails.value = null
    ops.rawFileBase64.value = ''

    if (options.value.preserveMode) {
      if (currentTab.value === 'encode') decodeBuffer.value = currOutput
      else encodeBuffer.value = currOutput
    } else {
      singleInput.value = currOutput
    }
    
    currentTab.value = newTab
    
    await triggerProcess()
    if (ops.processState.value.success) {
      toast('Swapped', { type: 'success' })
    }  }

  const handleClear = () => {
    singleInput.value = ''
    encodeBuffer.value = ''
    decodeBuffer.value = ''
    ops.output.value = ''
    inputMode.value = 'text'
    fileDetails.value = null
    ops.rawFileBase64.value = ''
    outputValidationError.value = ''
    ops.processState.value = { success: true }
  }

  const handleSample = async (type: 'text' | 'base64') => {
    const content = type === 'text' ? sample.loadSampleText() : sample.loadSampleBase64()
    if (type === 'base64') currentTab.value = 'decode'
    else currentTab.value = 'encode'

    inputMode.value = 'text'
    fileDetails.value = null
    ops.rawFileBase64.value = ''
    input.value = content
    
    triggerProcess()
  }

  const handleRandomData = () => {
    inputMode.value = 'text'
    fileDetails.value = null
    ops.rawFileBase64.value = ''
    input.value = sample.generateRandomData()
    triggerProcess()
  }
  const processFiles = async (files: FileList) => {
    if (!files.length) return
    const mockEvent = { target: { files } } as unknown as Event
    
    // Logic for tab switching is inside handleFileUpload now, checking extension
    startProcessing()
    const success = await fileOps.handleFileUpload(mockEvent)
    if (success) {
      await ops.processInput(currentTab.value)
      applyProcessResult(false) 
    }
    stopProcessing()
  }

  const downloadOutput = () => {
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
      // Create object URL for previewable content
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
     if (options.value.autoProcess) {
         ops.processInput(currentTab.value)
     }
  }, { deep: true })

  return {
    currentTab,
    input,
    inputMode,
    fileDetails,
    options,
    activePreviewUrl,
    isProcessing,
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
