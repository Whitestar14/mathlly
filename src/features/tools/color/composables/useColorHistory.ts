import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { RGBA } from '@color/lib/color'

export interface ColorHistoryItem {
  color: RGBA
  timestamp: number
}

const MAX_HISTORY_ITEMS = 25

const historyItems: Ref<ColorHistoryItem[]> = ref([])
const currentIndex: Ref<number> = ref(-1)

export interface UseColorHistoryReturn {
  historyItems: Ref<ColorHistoryItem[]>
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  addToHistory: (color: RGBA) => void
  undo: () => RGBA | null
  redo: () => RGBA | null
  clearHistory: () => void
}

export function useColorHistory(): UseColorHistoryReturn {
  const addToHistory = useDebounceFn((color: RGBA): void => {
    const current = historyItems.value[currentIndex.value]

    if (
      current &&
      current.color.r === color.r &&
      current.color.g === color.g &&
      current.color.b === color.b &&
      current.color.a === color.a
    ) {
      return
    }

    if (currentIndex.value < historyItems.value.length - 1) {
      historyItems.value = historyItems.value.slice(0, currentIndex.value + 1)
    }

    const newItem: ColorHistoryItem = { color, timestamp: Date.now() }
    historyItems.value.push(newItem)

    if (historyItems.value.length > MAX_HISTORY_ITEMS) {
      historyItems.value.shift()
    }

    currentIndex.value = historyItems.value.length - 1
  }, 300)

  const undo = (): RGBA | null => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      return historyItems.value[currentIndex.value].color
    }
    return null
  }

  const redo = (): RGBA | null => {
    if (currentIndex.value < historyItems.value.length - 1) {
      currentIndex.value++
      return historyItems.value[currentIndex.value].color
    }
    return null
  }

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < historyItems.value.length - 1)

  const clearHistory = (): void => {
    historyItems.value = []
    currentIndex.value = -1
  }

  return {
    historyItems,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    clearHistory,
  }
}
