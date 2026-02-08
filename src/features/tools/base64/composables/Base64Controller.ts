import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef, type DeepReadonly } from 'vue'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useKeyboardStore } from '@stores/keyboard'

// Inner Composables
import { useBase64Options } from './useBase64Options'
import { useBase64Operations } from './useBase64Operations'
import { useFileOperations } from './useFileOperations'
import { useSampleData } from './useSampleData'
import { useBase64FileUI } from './useBase64FileUI'

// Types
import type { Base64State, Base64StateUpdates, Base64Tab, Base64Options } from '../types/base64'

// Keyboard shortcuts
import { base64Manifest } from '../lib/shortcuts'

interface Base64ControllerOptions {
  state: DeepReadonly<Base64State>
  input: ComputedRef<string>
  updateState: (updates: Base64StateUpdates) => void
  updateInput: (value: string, options: Ref<Base64Options>) => void
  setTab: (tab: Base64Tab) => void
  clearBuffers: () => void
}

interface Base64ControllerReturn {
  // State
  currentTab: ComputedRef<Base64Tab>
  input: ComputedRef<string>
  options: Ref<Base64Options>
  selectedFileName: ComputedRef<string>
  activePreviewUrl: ComputedRef<string | null>
  isFileProcessing: ComputedRef<boolean>
  outputValidationError: ComputedRef<string>
  
  // Operations
  ops: ReturnType<typeof useBase64Operations>
  fileOps: ReturnType<typeof useFileOperations>
  fileUI: ReturnType<typeof useBase64FileUI>
  
  // Actions
  handleInput: () => Promise<void>
  handleSwap: () => void
  handleClear: () => void
  handleSample: (type: 'text' | 'base64') => Promise<void>
  onFileUpload: (event: Event) => Promise<void>
  onDrop: (event: DragEvent, realFileInputRef: Ref<HTMLInputElement | null>) => Promise<void>
  
  // Utilities
  toast: ReturnType<typeof useToast>['toast']
  copy: ReturnType<typeof useClipboard>['copy']
}

export function Base64Controller(options: Base64ControllerOptions): Base64ControllerReturn {
  const { state, input, updateState, updateInput, setTab, clearBuffers } = options

  const { toast } = useToast()
  const { copy } = useClipboard()
  const { options: base64Options } = useBase64Options()
  const sample = useSampleData()
  const fileUI = useBase64FileUI()
  const keyboard = useKeyboardStore()

  // Initialize sub-composables with state references
  const ops = useBase64Operations(input, base64Options)
  
  const fileOps = useFileOperations(
    input,
    computed(() => state.selectedFileName),
    toast,
    computed(() => state.currentTab),
    ops.rawFileBase64
  )

  // Result Processing Logic
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
        toast(`Successfully ${state.currentTab === 'encode' ? 'encoded' : 'decoded'}!`, { type: 'success' })
      }
    }
  }

  const debouncedProcess = useDebounceFn(async (tab: Base64Tab) => {
    if (!base64Options.value.autoProcess) return
    await ops.processInput(tab)
    applyProcessResult(false)
  }, 300)

  // Action handlers
  const handleInput = async () => {
    if (input.value.startsWith('[Binary File Loaded:')) {
      updateState({ selectedFileName: '' })
      ops.rawFileBase64.value = ''
    }
    await debouncedProcess(state.currentTab)
  }

  const handleSwap = () => {
    const currOutput = ops.output.value
    
    updateInput(currOutput, base64Options)
    updateState({ selectedFileName: '' })
    ops.rawFileBase64.value = ''
    setTab(state.currentTab === 'encode' ? 'decode' : 'encode')
    toast('Input and output swapped!', { type: 'success' })
  }

  const handleClear = () => {
    clearBuffers()
    ops.output.value = ''
    ops.rawFileBase64.value = ''
    ops.validationError.value = ''
    outputValidationError.value = ''
    ops.processState.value = { success: true }
    toast('All fields cleared!', { type: 'success' })
  }

  const handleSample = async (type: 'text' | 'base64') => {
    const sampleData = type === 'text' ? sample.loadSampleText() : sample.loadSampleBase64()
    updateInput(sampleData, base64Options)
    updateState({ selectedFileName: '' })
    ops.rawFileBase64.value = ''
    if (base64Options.value.autoProcess) {
      await ops.processInput(type === 'text' ? 'encode' : 'decode')
      applyProcessResult(true)
    }
  }

  const onFileUpload = async (event: Event) => {
    try {
      updateState({ isFileProcessing: true })
      // Wait for file read + smart switch
      const success = await fileOps.handleFileUpload(event)
      if (success) {
        await ops.processInput(state.currentTab)
        applyProcessResult(true)
      }
    } finally {
      const target = event.target as HTMLInputElement
      if (target) target.value = ''
      setTimeout(() => updateState({ isFileProcessing: false }), 150)
    }
  }

  const onDrop = async (event: DragEvent, realFileInputRef: Ref<HTMLInputElement | null>) => {
    try {
      updateState({ isFileProcessing: true })
      await fileUI.handleDropEvent(
        event,
        async (e, _) => {
          const success = await fileOps.handleDrop(e, realFileInputRef)
          if (success) await ops.processInput(state.currentTab)
        },
        ops.processInput,
        computed(() => state.currentTab),
        base64Options
      )
      applyProcessResult(false)
    } finally {
      setTimeout(() => updateState({ isFileProcessing: false }), 150)
    }
  }

  // Keyboard shortcuts
  onMounted(() => {
    keyboard.pushContext('tools.base64')
    keyboard.attachAllForContext('tools.base64', {
      'Ctrl+Enter': () => handleInput(),
      'Ctrl+S': () => handleSwap(),
      'Ctrl+C': () => copy(ops.output.value),
      'Escape': () => handleClear()
    })
  })

  onUnmounted(() => {
    keyboard.popContext('tools.base64')
  })

  // Watchers
  watch(() => ops.processState.value, (newState) => {
    if (state.activePreviewUrl) {
      URL.revokeObjectURL(state.activePreviewUrl)
    }
    let newUrl: string | null = null
    if (newState.success && newState.isBinary && newState.binary) {
      const mime = newState.mime || 'application/octet-stream'
      if (mime.startsWith('image/') || mime === 'application/pdf') {
        const blob = new Blob([newState.binary as unknown as BlobPart], { type: mime })
        newUrl = URL.createObjectURL(blob)
      }
    }
    updateState({ activePreviewUrl: newUrl })
  }, { immediate: true })

  onUnmounted(() => {
    if (state.activePreviewUrl) URL.revokeObjectURL(state.activePreviewUrl)
  })

  watch([base64Options, () => state.currentTab], async () => {
    if (base64Options.value.autoProcess && input.value.trim()) {
      await ops.processInput(state.currentTab)
      applyProcessResult(false)
    }
  }, { deep: true })

  return {
    // State
    currentTab: computed(() => state.currentTab),
    input,
    options: base64Options,
    selectedFileName: computed(() => state.selectedFileName),
    activePreviewUrl: computed(() => state.activePreviewUrl),
    isFileProcessing: computed(() => state.isFileProcessing),
    outputValidationError: computed(() => state.outputValidationError),
    
    // Operations
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

export type { Base64ControllerOptions, Base64ControllerReturn }