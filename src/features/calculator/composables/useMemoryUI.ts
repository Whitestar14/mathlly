import { type ComputedRef } from 'vue';
import { useToast } from '@composables/ui/useToast';
import { useMemoryStorage, type MemorySlot } from './useMemoryStorage';
import { useMemoryOperations } from './useMemoryOperations';
import type { CalculatorMode } from './useCalculatorState';
import type { Calculator } from '@calculator/services/factory/CalculatorFactory';

export interface UseMemoryUIReturn {
  // Re-export storage functionality
  memorySlots: ReturnType<typeof useMemoryStorage>['memorySlots'];
  isLoading: ReturnType<typeof useMemoryStorage>['isLoading'];
  hasMemory: (mode: CalculatorMode) => ComputedRef<boolean>;
  loadMemorySlots: (mode: CalculatorMode) => Promise<boolean>;
  addMemorySlot: (mode: CalculatorMode, value: number | any, label?: string) => Promise<void>;
  updateMemorySlot: (id: number, updates: Partial<MemorySlot>) => Promise<boolean>;
  deleteMemorySlot: (id: number) => Promise<boolean>;
  clearAllMemory: (mode: CalculatorMode) => Promise<boolean>;
  
  // Re-export operations
  handleMemoryOperation: ReturnType<typeof useMemoryOperations>['handleMemoryOperation'];
  
  // UI-specific methods
  selectMemorySlot: (params: {
    slot: MemorySlot;
    calculator: Calculator;
    activeBase?: string;
    updateState: (updates: any) => void;
    updateDisplayValues: (values: any) => void;
  }) => void;
  
  handleAddCurrentToMemory: (params: {
    currentInput: string;
    mode: CalculatorMode;
    calculator: Calculator;
    activeBase?: string;
  }) => Promise<void>;

  // Unified slot operations
  copySlot: (slot: MemorySlot) => Promise<void>;
  handleEditLabel: (id: number, newLabel: string) => Promise<void>;
  handleSlotOperation: (operation: 'add' | 'subtract' | 'save', slot: MemorySlot, value: number) => Promise<void>;
}

/**
 * UI-focused memory composable that combines storage and operations
 */
export function useMemoryUI(): UseMemoryUIReturn {
  const storage = useMemoryStorage();
  const operations = useMemoryOperations();
  const { toast } = useToast();

  // Helper function to get safe label
  const getSafeLabel = (slot: MemorySlot): string => {
    return slot.label || `Memory ${slot.slot}` || 'Memory Slot';
  };

  // Toast messages configuration
  const toastMessages = {
    recall: (label: string) => ({
      title: "Memory recalled",
      description: `Recalled value from ${label}`,
    }),
    recallFailed: {
      title: "Recall failed",
      description: "Failed to recall memory value",
    },
    store: (label: string) => ({
      title: "Value stored",
      description: `Current value stored in ${label}`,
    }),
    storeFailed: {
      title: "Store failed",
      description: "Failed to store current value in memory",
    },
    cannotStore: {
      title: "Cannot store value",
      description: "No valid value to store in memory",
    },
    copied: (label: string, value: string) => ({
      title: "Copied to clipboard",
      description: `${label}: ${value}`,
    }),
    copyFailed: {
      title: "Copy failed",
      description: "Failed to copy the memory value to clipboard",
    },
    labelUpdated: {
      title: "Label updated",
      description: "Memory slot label has been updated",
    },
    operationSuccess: (operation: string, value: number, label: string) => {
      const operationMap = {
        save: { past: 'Saved', preposition: 'to' },
        add: { past: 'Added', preposition: 'to' },
        subtract: { past: 'Subtracted', preposition: 'from' }
      };
      
      const { past, preposition } = operationMap[operation as keyof typeof operationMap] || 
        { past: operation, preposition: 'to' };
      
      return {
        title: `${past} ${preposition} memory`,
        description: operation === 'save' 
          ? `Saved current value to ${label}`
          : `${past} ${value} ${preposition} ${label}`,
      };
    },
    operationFailed: (operation: string) => ({
      title: "Error",
      description: `Failed to ${operation} memory slot`,
    })
  };

  /**
   * Handle memory slot recall with UI feedback
   */
  const selectMemorySlot = (params: {
    slot: MemorySlot;
    calculator: Calculator;
    activeBase?: string;
    updateState: (updates: any) => void;
    updateDisplayValues: (values: any) => void;
  }): void => {
    const { slot, calculator, activeBase, updateState, updateDisplayValues } = params;
    
    try {
      const result = operations.recallMemorySlot(slot, calculator, activeBase);
      
      updateState({
        input: result.input,
        error: result.error || ""
      });

      // For Programmer mode memory recall, update display values
      if (result.displayValues) {
        updateDisplayValues(result.displayValues);
      }

      toast(toastMessages.recall(getSafeLabel(slot)));
    } catch (error) {
      console.error('Error recalling memory slot:', error);
      toast(toastMessages.recallFailed);
    }
  };

  /**
   * Handle adding current value to memory with UI feedback
   * NOTE: This creates a NEW memory slot, different from MS button behavior
   * MS button overwrites the first slot, this creates additional slots
   */
  const handleAddCurrentToMemory = async (params: {
    currentInput: string;
    mode: CalculatorMode;
    calculator: Calculator;
    activeBase?: string;
  }): Promise<void> => {
    const { currentInput, mode, calculator, activeBase } = params;
    
    try {
      if (!currentInput || currentInput === "Error" || currentInput === "0") {
        toast(toastMessages.cannotStore);
        return;
      }

      // Evaluate the current input to get the actual value
      let valueToStore: any;
      try {
        if (mode === 'Programmer') {
          valueToStore = calculator.evaluateExpression(currentInput, activeBase);
          // Convert to decimal for storage
          if (activeBase !== 'DEC' && calculator.convertToBase) {
            valueToStore = calculator.convertToBase(valueToStore, activeBase as string, 'DEC');
          }
        } else {
          valueToStore = calculator.evaluateExpression(currentInput);
        }
      } catch (err) {
        valueToStore = currentInput;
        console.error('Error evaluating current input:', err);
      }

      // Generate a label for the new memory slot
      const existingSlots = storage.memorySlots.value.filter(slot => slot.mode === mode);
      const nextSlot = existingSlots.length > 0 
        ? Math.max(...existingSlots.map(s => s.slot)) + 1 
        : 1;
      
      const label = `Memory ${nextSlot}`;

      // This creates a NEW slot (different from MS button behavior)
      await storage.addMemorySlot(mode, valueToStore, label);

      toast(toastMessages.store(label));

      // Reload memory slots to update the UI
      await storage.loadMemorySlots(mode);
    } catch (error) {
      console.error('Error adding current value to memory:', error);
      toast(toastMessages.storeFailed);
    }
  };

  /**
   * Copy slot value to clipboard
   */
  const copySlot = async (slot: MemorySlot): Promise<void> => {
    try {
      const { useClipboard } = await import('@vueuse/core');
      const { copy } = useClipboard();
      
      const value = slot.value.toString();
      await copy(value);
      toast(toastMessages.copied(getSafeLabel(slot), value));
    } catch (error) {
      console.error('Failed to copy slot:', error);
      toast(toastMessages.copyFailed);
    }
  };

  /**
   * Handle label editing
   */
  const handleEditLabel = async (id: number, newLabel: string): Promise<void> => {
    const success = await storage.updateMemorySlot(id, { label: newLabel });
    if (success) {
      toast(toastMessages.labelUpdated);
    }
  };

  /**
   * Unified handler for slot operations (add, subtract, save)
   */
  const handleSlotOperation = async (
    operation: 'add' | 'subtract' | 'save', 
    slot: MemorySlot, 
    value: number
  ): Promise<void> => {
    try {
      let newValue: number;
      
      if (operation === 'save') {
        newValue = value;
      } else {
        const currentValue = typeof slot.value === 'object' 
          ? parseFloat(slot.value.toString()) 
          : slot.value;
        newValue = operation === 'add' ? currentValue + value : currentValue - value;
      }
      
      const success = await storage.updateMemorySlot(slot.id!, { 
        value: newValue,
        timestamp: Date.now()
      });
      
      if (success) {
        toast(toastMessages.operationSuccess(operation, value, getSafeLabel(slot)));
      }
    } catch (error) {
      console.error(`Error ${operation} memory slot:`, error);
      toast(toastMessages.operationFailed(operation));
    }
  };

  return {
    // Re-export storage functionality
    ...storage,
    
    // Re-export operations
    handleMemoryOperation: operations.handleMemoryOperation,
    
    // UI-specific methods
    selectMemorySlot,
    handleAddCurrentToMemory,
    copySlot,
    handleEditLabel,
    handleSlotOperation,
  };
}

// Re-export the MemorySlot type for consistency
export type { MemorySlot } from './useMemoryStorage';
