import { ref, shallowRef, computed, watch, onUnmounted, type Ref } from 'vue'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'

// Inner Composables
import { useBase64Options } from './useBase64Options'
import { useBase64Operations } from './useBase64Operations'
import { useFileOperations } from './useFileOperations'
import { useSampleData } from './useSampleData'
import { useBase64FileUI } from './useBase64FileUI'

export function useBase64Tool() {
  const { toast } = useToast()
  const { copy } = useClipboard()
  const { options } = useBase64Options()
  const sample = useSampleData()
  const fileUI = useBase64FileUI()

  // --- 1. State Management (Buffers & Tabs) ---
  const currentTab = ref<'encode' | 'decode'>('encode')
  const selectedFileName = ref('')
  const activePreviewUrl = ref<string | null>(null)
  
  // Use shallowRef for large strings to improve performance
  const singleInput = shallowRef('')
  const encodeBuffer = shallowRef('')
  const decodeBuffer = shallowRef('')

  // The "Master" input computed property that handles Preserve Mode
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

  // --- 2. Wiring Sub-Composables ---
  const ops = useBase64Operations(input, options)
  
  const fileOps = useFileOperations(
    input,
    selectedFileName,
    toast,
    currentTab,
    ops.rawFileBase64
  )

  // --- 3. Result Processing Logic ---
  const outputValidationError = ref('')

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

  // --- 4. User Actions ---

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

  // --- 5. File Handling Glue ---
  
  const isFileProcessing = ref(false)

  const onFileUpload = async (event: Event) => {
    try {
      isFileProcessing.value = true
      // Wait for file read + smart switch
      const success = await fileOps.handleFileUpload(event)
      if (success) {
        await ops.processInput(currentTab.value)
        applyProcessResult(true)
      }
    } finally {
      const target = event.target as HTMLInputElement
      if (target) target.value = ''
      setTimeout(() => (isFileProcessing.value = false), 150)
    }
  }

  const onDrop = async (event: DragEvent, realFileInputRef: Ref<HTMLInputElement | null>) => {
    try {
      isFileProcessing.value = true
      await fileUI.handleDropEvent(
        event,
        async (e, _) => {
          const success = await fileOps.handleDrop(e, realFileInputRef)
          if (success) await ops.processInput(currentTab.value)
        },
        ops.processInput,
        currentTab,
        options
      )
      applyProcessResult(false)
    } finally {
      setTimeout(() => (isFileProcessing.value = false), 150)
    }
  }

  // --- 6. Lifecycle & Watchers ---

  // Preview Memory Management
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

  // Auto Process Watcher
  watch([options, currentTab], async () => {
    if (options.value.autoProcess && input.value.trim()) {
      await ops.processInput(currentTab.value)
      applyProcessResult(false)
    }
  }, { deep: true })

  return {
    // State
    currentTab,
    input,
    options,
    selectedFileName,
    activePreviewUrl,
    isFileProcessing,
    outputValidationError,
    
    // Logic/Ops
    ops,
    fileOps,
    fileUI,
    
    // Actions
    handleInput,
    handleSwap,
    handleClear,
    handleSample,
    onFileUpload,
    onDrop,
    
    // Utilities
    toast,
    copy
  }
}