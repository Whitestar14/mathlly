import { type ComputedRef } from 'vue';
import { useToast } from '@/composables/useToast';
import { useMemoryStorage, type MemorySlot } from '@/composables/useMemoryStorage';
import { useMemoryOperations } from '@/composables/useMemoryOperations';
import type { CalculatorMode } from '@/composables/useCalculatorState';
import type { Calculator } from '@/services/factory/CalculatorFactory';

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

  // Additional UI methods
  copySlot: (slot: MemorySlot) => Promise<void>;
  handleEditLabel: (id: number, newLabel: string) => Promise<void>;
  handleAddToSlot: (slot: MemorySlot, value: number) => Promise<void>;
  handleSubtractFromSlot: (slot: MemorySlot, value: number) => Promise<void>;
}

/**
 * UI-focused memory composable that combines storage and operations
 */
export function useMemoryUI(): UseMemoryUIReturn {
  const storage = useMemoryStorage();
  const operations = useMemoryOperations();
  const { toast } = useToast();

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

      toast({
        title: "Memory recalled",
        description: `Recalled value from ${slot.label}`,
      });
    } catch (error) {
      console.error('Error recalling memory slot:', error);
      toast({
        title: "Recall failed",
        description: "Failed to recall memory value",
      });
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
        toast({
          title: "Cannot store value",
          description: "No valid value to store in memory",
        });
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
      } catch (evalError) {
        // If evaluation fails, use the raw input
        valueToStore = currentInput;
      }

      // Generate a label for the new memory slot
      const existingSlots = storage.memorySlots.value.filter(slot => slot.mode === mode);
      const nextSlot = existingSlots.length > 0 
        ? Math.max(...existingSlots.map(s => s.slot)) + 1 
        : 1;
      
      const label = `Memory ${nextSlot}`;

      // This creates a NEW slot (different from MS button behavior)
      await storage.addMemorySlot(mode, valueToStore, label);

      toast({
        title: "Value stored",
        description: `Current value stored in ${label}`,
      });

      // Reload memory slots to update the UI
      await storage.loadMemorySlots(mode);
    } catch (error) {
      console.error('Error adding current value to memory:', error);
      toast({
        title: "Store failed",
        description: "Failed to store current value in memory",
      });
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
      toast({
        title: "Copied to clipboard",
        description: `${slot.label}: ${value}`,
      });
    } catch (error) {
      console.error('Failed to copy slot:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy the memory value to clipboard",
      });
    }
  };

  /**
   * Handle label editing
   */
  const handleEditLabel = async (id: number, newLabel: string): Promise<void> => {
    const success = await storage.updateMemorySlot(id, { label: newLabel });
    if (success) {
      toast({
        title: "Label updated",
        description: "Memory slot label has been updated",
      });
    }
  };

  /**
   * Handle adding to slot (M+ equivalent for specific slot)
   */
  const handleAddToSlot = async (slot: MemorySlot, value: number): Promise<void> => {
    try {
      const currentValue = typeof slot.value === 'object' ? parseFloat(slot.value.toString()) : slot.value;
      const newValue = currentValue + value;
      
      const success = await storage.updateMemorySlot(slot.id!, { 
        value: newValue,
        timestamp: Date.now()
      });
      
      if (success) {
        toast({
          title: "Added to memory",
          description: `Added ${value} to ${slot.label}`,
        });
      }
    } catch (error) {
      console.error('Error adding to memory slot:', error);
      toast({
        title: "Error",
        description: "Failed to add to memory slot",
      });
    }
  };

  /**
   * Handle subtracting from slot (M- equivalent for specific slot)
   */
  const handleSubtractFromSlot = async (slot: MemorySlot, value: number): Promise<void> => {
    try {
      const currentValue = typeof slot.value === 'object' ? parseFloat(slot.value.toString()) : slot.value;
      const newValue = currentValue - value;
      
      const success = await storage.updateMemorySlot(slot.id!, { 
        value: newValue,
        timestamp: Date.now()
      });
      
      if (success) {
        toast({
          title: "Subtracted from memory",
          description: `Subtracted ${value} from ${slot.label}`,
        });
      }
    } catch (error) {
      console.error('Error subtracting from memory slot:', error);
      toast({
        title: "Error",
        description: "Failed to subtract from memory slot",
      });
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
    handleAddToSlot,
    handleSubtractFromSlot,
  };
}

// Re-export the MemorySlot type for consistency
export type { MemorySlot } from '@/composables/useMemoryStorage';
