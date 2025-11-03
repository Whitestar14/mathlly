import { ref, onMounted, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import db from '@services/storage/db'
import type { CalculatorMode } from './useCalculatorState'

export interface HistoryItem {
  id?: number
  expression: string
  result: string
  timestamp: number
  mode: CalculatorMode
  base?: string
  baseValues?: Record<string, string>
}

const MAX_HISTORY_ITEMS = 100
const isLoading: Ref<boolean> = ref(false)

const historyMap: Record<CalculatorMode, Ref<HistoryItem[]>> = {
  Standard: ref([]),
  Scientific: ref([]),
  Programmer: ref([])
}

export interface UseHistoryReturn {
  historyItems: (mode: CalculatorMode) => Ref<HistoryItem[]>
  isLoading: Ref<boolean>
  addToHistory: (
    expression: string,
    result: string,
    mode: CalculatorMode,
    base?: string,
    baseValues?: Record<string, string>
  ) => Promise<void>
  deleteItem: (id: number, mode: CalculatorMode) => Promise<boolean>
  clearAll: (mode: CalculatorMode) => Promise<boolean>
  loadHistory: (mode: CalculatorMode) => Promise<boolean>
}

export function useHistory(): UseHistoryReturn {
  const loadHistory = async(mode: CalculatorMode): Promise<boolean> => {
    if (isLoading.value) return false
    isLoading.value = true
    try {
      const items = await db.history
        .where('mode')
        .equals(mode)
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .sortBy('timestamp')

      historyMap[mode].value = items.map(item => ({
        id: item.id,
        expression: item.expression ?? '',
        result: item.result ?? '',
        timestamp: item.timestamp,
        mode: item.mode as CalculatorMode,
        base: item.base,
        baseValues: item.baseValues
      }))
      return true
    } catch(err) {
      console.error('Error loading history:', err)
      historyMap[mode].value = []
      return false
    } finally {
      isLoading.value = false
    }
  }

  const addToHistory = useDebounceFn(
    async(
      expression: string,
      result: string,
      mode: CalculatorMode,
      base?: string,
      baseValues?: Record<string, string>
    ) => {
      try {
        const list = historyMap[mode].value
        const lastItem = list[0]
        if (
          lastItem?.expression === expression &&
          lastItem?.result === result &&
          lastItem?.base === base
        ) {
          return
        }

        const timestamp = Date.now()
        const id = await db.history.add({
          expression,
          result,
          timestamp,
          mode,
          base,
          baseValues
        })

        historyMap[mode].value = [
          { id, expression, result, timestamp, mode, base, baseValues },
          ...list
        ].slice(0, MAX_HISTORY_ITEMS)

        if (!isLoading.value) loadHistory(mode)
      } catch(err) {
        console.error('Error adding to history:', err)
      }
    },
    300
  )

  const deleteItem = async(id: number, mode: CalculatorMode): Promise<boolean> => {
    try {
      await db.history.delete(id)
      historyMap[mode].value = historyMap[mode].value.filter(item => item.id !== id)
      return true
    } catch(err) {
      console.error('Error deleting history item:', err)
      await loadHistory(mode)
      return false
    }
  }

  const clearAll = async(mode: CalculatorMode): Promise<boolean> => {
    try {
      const items = await db.history.where('mode').equals(mode).toArray()
      const ids = items.map(i => i.id!).filter(Boolean)
      if (ids.length) await db.history.bulkDelete(ids)
      historyMap[mode].value = []
      return true
    } catch(err) {
      console.error('Error clearing history:', err)
      return false
    }
  }

  onMounted(() => {
    (['Standard', 'Scientific', 'Programmer'] as CalculatorMode[]).forEach(m => {
      if (historyMap[m].value.length === 0) loadHistory(m)
    })
  })

  return {
    historyItems: (mode: CalculatorMode) => historyMap[mode],
    isLoading,
    addToHistory,
    deleteItem,
    clearAll,
    loadHistory
  }
}
