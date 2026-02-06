import { reactive, readonly, computed, shallowRef, type Ref, type DeepReadonly, type ComputedRef } from 'vue'
import type { Base64Options, Base64State, Base64StateUpdates, Base64Tab } from '../types/base64'

export const DEFAULT_TAB = 'encode' as const
export const TABS = ['encode', 'decode'] as const

export type Base64Tab = typeof TABS[number]

export interface UseBase64StateReturn {
  state: DeepReadonly<Base64State>
  input: ComputedRef<string>
  updateState: (updates: Base64StateUpdates) => void
  updateInput: (value: string, options: Ref<Base64Options>) => void
  reset: () => void
  setTab: (tab: Base64Tab) => void
  clearBuffers: () => void
}

function createInitialState(): Base64State {
  return {
    currentTab: DEFAULT_TAB,
    selectedFileName: '',
    activePreviewUrl: null,
    singleInput: '',
    encodeBuffer: '',
    decodeBuffer: '',
    isFileProcessing: false,
    outputValidationError: ''
  }
}

export function useBase64State(options: Ref<Base64Options>): UseBase64StateReturn {
  const state = reactive<Base64State>(createInitialState())

  const input = computed(() => {
    if (options.value.preserveMode) {
      return state.currentTab === 'encode' ? state.encodeBuffer : state.decodeBuffer
    }
    return state.singleInput
  })

  function updateState(updates: Base64StateUpdates): void {
    Object.assign(state, updates)
  }

  function updateInput(value: string, options: Ref<Base64Options>): void {
    if (options.value.preserveMode) {
      if (state.currentTab === 'encode') {
        state.encodeBuffer = value
      } else {
        state.decodeBuffer = value
      }
    } else {
      state.singleInput = value
    }
  }

  function reset(): void {
    const initialState = createInitialState()
    Object.assign(state, initialState)
  }

  function setTab(tab: Base64Tab): void {
    if (TABS.includes(tab)) {
      state.currentTab = tab
    } else {
      console.warn(`Invalid tab: ${tab}`)
    }
  }

  function clearBuffers(): void {
    state.singleInput = ''
    state.encodeBuffer = ''
    state.decodeBuffer = ''
    state.selectedFileName = ''
    state.activePreviewUrl = null
    state.isFileProcessing = false
    state.outputValidationError = ''
  }

  return {
    state: readonly(state),
    input,
    updateState,
    updateInput,
    reset,
    setTab,
    clearBuffers
  }
}