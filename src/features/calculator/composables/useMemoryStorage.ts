import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { bignumber, type BigNumber } from 'mathjs'
import { useDebounceFn } from '@vueuse/core'
import type { CalculatorMode } from './useCalculatorState'
import db, { type MemoryItem } from '@services/storage/db'

export interface MemorySlot {
  id?: number;
  slot: number;
  value: number | BigNumber;
  label?: string;
  mode: CalculatorMode;
  timestamp: number;
}

export interface UseMemoryStorageReturn {
  memorySlots: Ref<MemorySlot[]>;
  isLoading: Ref<boolean>;
  hasMemory: (mode: CalculatorMode) => ComputedRef<boolean>;
  loadMemorySlots: (mode: CalculatorMode) => Promise<boolean>;
  addMemorySlot: (mode: CalculatorMode, value: number | BigNumber, label?: string) => Promise<void>;
  updateMemorySlot: (id: number, updates: Partial<MemorySlot>) => Promise<boolean>;
  deleteMemorySlot: (id: number) => Promise<boolean>;
  clearAllMemory: (mode: CalculatorMode) => Promise<boolean>;
  getFirstSlot: (mode: CalculatorMode) => MemorySlot | null;
}

const MAX_MEMORY_SLOTS = 10

const memorySlots: Ref<MemorySlot[]> = ref([])
const isLoading: Ref<boolean> = ref(false)

/**
 * Helper function to serialize BigNumber to string for database storage
 */
const serializeValue = (value: number | BigNumber): string => {
  if (typeof value === 'object' && value.toString) {
    return value.toString()
  }
  return String(value)
}

/**
 * Helper function to deserialize string from database to BigNumber
 */
const deserializeValue = (value: string): BigNumber => {
  try {
    return bignumber(value)
  } catch(error) {
    console.error('Error deserializing value:', error)
    return bignumber(0)
  }
}

/**
 * Core memory storage composable
 */
export function useMemoryStorage(): UseMemoryStorageReturn {
  /**
   * Check if a specific calculator mode has memory slots
   */
  const hasMemory = (mode: CalculatorMode): ComputedRef<boolean> =>
    computed(() => {
      const modeSlots = memorySlots.value.filter((slot: MemorySlot) => slot.mode === mode)
      return modeSlots.length > 0
    })

  /**
   * Get the first memory slot for a mode (for legacy button operations)
   */
  const getFirstSlot = (mode: CalculatorMode): MemorySlot | null => {
    const modeSlots = memorySlots.value.filter((slot: MemorySlot) => slot.mode === mode)
    return modeSlots.length > 0 ? modeSlots[0] : null
  }

  /**
   * Load memory slots from database for a specific mode
   */
  const loadMemorySlots = async(mode: CalculatorMode): Promise<boolean> => {
    if (isLoading.value) return false

    isLoading.value = true

    try {
      const slots = await db.memory
        .where('mode')
        .equals(mode)
        .toArray()

      const sortedSlots = slots.sort((a: MemoryItem, b: MemoryItem) => a.slot - b.slot)

      memorySlots.value = sortedSlots.map((slot: MemoryItem) => ({
        id: slot.id,
        slot: slot.slot,
        value: deserializeValue(slot.value),
        label: slot.label,
        mode: slot.mode as CalculatorMode,
        timestamp: slot.timestamp
      }))

      return true
    } catch(error) {
      console.error('Error loading memory slots:', error)
      memorySlots.value = []
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add a new memory slot with debouncing
   */
  const addMemorySlot = useDebounceFn(async(
    mode: CalculatorMode,
    value: number | BigNumber,
    label?: string
  ): Promise<void> => {
    try {
      const existingSlots = memorySlots.value.filter((slot: MemorySlot) => slot.mode === mode)
      const nextSlot = existingSlots.length > 0 ?
        Math.max(...existingSlots.map((s: MemorySlot) => s.slot)) + 1 :
        1

      if (nextSlot > MAX_MEMORY_SLOTS) {
        throw new Error(`Maximum ${MAX_MEMORY_SLOTS} memory slots allowed`)
      }

      const timestamp = Date.now()
      const serializedValue = serializeValue(value)

      const memoryItem: Omit<MemoryItem, 'id'> = {
        slot: nextSlot,
        value: serializedValue,
        label: label || `Memory ${nextSlot}`,
        mode,
        timestamp
      }

      const id = await db.memory.add(memoryItem)

      const newSlot: MemorySlot = {
        id,
        slot: nextSlot,
        value: deserializeValue(serializedValue),
        label: label || `Memory ${nextSlot}`,
        mode,
        timestamp
      }

      memorySlots.value = [...memorySlots.value, newSlot].sort((a: MemorySlot, b: MemorySlot) => a.slot - b.slot)
    } catch(error) {
      console.error('Error adding memory slot:', error)
      throw error
    }
  }, 300)

  /**
   * Update an existing memory slot
   */
  const updateMemorySlot = async(id: number, updates: Partial<MemorySlot>): Promise<boolean> => {
    try {
      const dbUpdates: Partial<MemoryItem> = {}

      if (updates.slot !== undefined) dbUpdates.slot = updates.slot
      if (updates.value !== undefined) dbUpdates.value = serializeValue(updates.value)
      if (updates.label !== undefined) dbUpdates.label = updates.label
      if (updates.mode !== undefined) dbUpdates.mode = updates.mode
      if (updates.timestamp !== undefined) dbUpdates.timestamp = updates.timestamp

      await db.memory.update(id, dbUpdates)

      const index = memorySlots.value.findIndex((slot: MemorySlot) => slot.id === id)
      if (index !== -1) {
        memorySlots.value[index] = { ...memorySlots.value[index], ...updates }
      }

      return true
    } catch(error) {
      console.error('Error updating memory slot:', error)
      return false
    }
  }

  /**
   * Delete a memory slot
   */
  const deleteMemorySlot = async(id: number): Promise<boolean> => {
    try {
      await db.memory.delete(id)
      memorySlots.value = memorySlots.value.filter((slot: MemorySlot) => slot.id !== id)
      return true
    } catch(error) {
      console.error('Error deleting memory slot:', error)
      return false
    }
  }

  /**
   * Clear all memory slots for a mode
   */
  const clearAllMemory = async(mode: CalculatorMode): Promise<boolean> => {
    try {
      await db.memory.where('mode').equals(mode).delete()
      memorySlots.value = memorySlots.value.filter((slot: MemorySlot) => slot.mode !== mode)
      return true
    } catch(error) {
      console.error('Error clearing memory:', error)
      return false
    }
  }

  return {
    memorySlots,
    isLoading,
    hasMemory,
    loadMemorySlots,
    addMemorySlot,
    updateMemorySlot,
    deleteMemorySlot,
    clearAllMemory,
    getFirstSlot
  }
}
