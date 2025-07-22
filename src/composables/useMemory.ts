// Re-export everything from the new composables for backward compatibility
export { useMemoryStorage, type MemorySlot } from '@/composables/useMemoryStorage';
export { useMemoryOperations, type MemoryOperationResult, type DisplayValues } from '@/composables/useMemoryOperations';
export { useMemoryUI, type UseMemoryUIReturn } from '@/composables/useMemoryUI';

// Default export for convenience
export { useMemoryUI as useMemory } from '@/composables/useMemoryUI';
