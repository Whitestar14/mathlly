// Re-export everything from the new composables for backward compatibility
export { useMemoryStorage, type MemorySlot } from './useMemoryStorage';
export { useMemoryOperations, type MemoryOperationResult, type DisplayValues } from './useMemoryOperations';
export { useMemoryUI, type UseMemoryUIReturn } from './useMemoryUI';

// Default export for convenience
export { useMemoryUI as useMemory } from './useMemoryUI';
