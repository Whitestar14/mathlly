import type { CalculatorMode } from './useCalculatorState';
import type { Calculator } from '@calculator/services/factory/CalculatorFactory';
import { useMemoryStorage, type MemorySlot } from './useMemoryStorage';

// Types
export interface DisplayValues {
  [key: string]: {
    input: string;
    display: string;
  };
}

export interface MemoryOperationResult {
  input: string;
  error?: string;
  displayValues?: DisplayValues;
}

export interface UseMemoryOperationsReturn {
  handleMemoryOperation: (params: {
    operation: string;
    mode: CalculatorMode;
    calculator: Calculator;
    currentInput: string;
    activeBase?: string;
  }) => MemoryOperationResult;
  recallMemorySlot: (slot: MemorySlot, calculator: Calculator, activeBase?: string) => MemoryOperationResult;
}

/**
 * Memory operations composable
 */
export function useMemoryOperations(): UseMemoryOperationsReturn {
  const {
    getFirstSlot,
    addMemorySlot,
    updateMemorySlot,
    deleteMemorySlot
  } = useMemoryStorage();

  /**
   * Create a standardized response object
   */
  const createResponse = (
    input: string, 
    error: string = '', 
    displayValues: DisplayValues | null = null
  ): MemoryOperationResult => {
    const response: MemoryOperationResult = { input };
    if (error) response.error = error;
    if (displayValues) response.displayValues = displayValues;
    return response;
  };

  /**
   * Handle programmer memory recall
   */
  const handleProgrammerMemoryRecall = (
    calculator: Calculator,
    activeBase: string,
    memoryValue: any
  ): MemoryOperationResult => {
    try {
      const decimalValue = memoryValue.toString();
      const newStates: DisplayValues = {};
      const bases = ['DEC', 'HEX', 'OCT', 'BIN'];

      bases.forEach((base: string) => {
        try {
          const converted = calculator.convertToBase!(decimalValue, 'DEC', base);
          newStates[base] = { input: converted, display: converted };
        } catch (e) {
          console.error(`Error converting to ${base}:`, e);
          newStates[base] = { input: '0', display: '0' };
        }
      });

      const activeBaseValue = calculator.convertToBase!(decimalValue, 'DEC', activeBase);

      if ('states' in calculator) {
        (calculator as any).states = { ...newStates };
        calculator.input = activeBaseValue;
        calculator.currentExpression = activeBaseValue;
      }

      return createResponse(activeBaseValue, '', newStates);
    } catch (err) {
      console.error('Error in programmer memory recall:', err);
      return createResponse('Error', 'Memory recall failed');
    }
  };

  /**
   * Handle standard memory recall
   */
  const handleStandardMemoryRecall = (
    calculator: Calculator, 
    memoryValue: any
  ): MemoryOperationResult => {
    try {
      const formattedValue = calculator.formatResult(memoryValue);
      calculator.input = formattedValue;
      calculator.currentExpression = formattedValue;
      return createResponse(formattedValue);
    } catch (err) {
      console.error('Error in standard memory recall:', err);
      return createResponse('Error', 'Memory recall failed');
    }
  };

  /**
   * Recall a specific memory slot
   */
  const recallMemorySlot = (
    slot: MemorySlot, 
    calculator: Calculator, 
    activeBase?: string
  ): MemoryOperationResult => {
    try {
      if (slot.mode === 'Programmer' && activeBase) {
        return handleProgrammerMemoryRecall(calculator, activeBase, slot.value);
      } else {
        return handleStandardMemoryRecall(calculator, slot.value);
      }
    } catch (error) {
      console.error('Error recalling memory slot:', error);
      return createResponse('Error', 'Memory recall failed');
    }
  };

  /**
   * Evaluate expression based on calculator mode
   */
  const evaluateExpression = (
    mode: CalculatorMode, 
    calculator: Calculator, 
    input: string, 
    activeBase?: string
  ): any => {
    if (mode === 'Programmer' && activeBase) {
      return calculator.evaluateExpression(input, activeBase);
    } else {
      return calculator.evaluateExpression(input);
    }
  };

  /**
   * Convert programmer value to decimal if needed
   */
  const convertToDecimal = (
    value: any, 
    calculator: Calculator, 
    activeBase: string
  ): string => {
    if (activeBase !== 'DEC' && calculator.convertToBase) {
      return calculator.convertToBase(value, activeBase, 'DEC');
    }
    return value.toString();
  };

  /**
   * Store value in first slot or create new slot (MS operation)
   * MS should ALWAYS overwrite the first slot, never create additional slots
   */
  const storeInFirstSlot = async (mode: CalculatorMode, value: any): Promise<boolean> => {
    try {
      const firstSlot = getFirstSlot(mode);
      
      if (firstSlot && firstSlot.id) {
        // Update existing first slot - this is the correct MS behavior
        return await updateMemorySlot(firstSlot.id, { 
          value: value,
          timestamp: Date.now()
        });
      } else {
        // Only create new slot if no memory exists at all
        await addMemorySlot(mode, value, 'Memory 1');
        return true;
      }
    } catch (error) {
      console.error('Memory store error:', error);
      return false;
    }
  };

  /**
   * Add to first slot (M+ operation)
   * M+ should create a slot with the value if none exists, or add to existing first slot
   */
  const addToFirstSlot = async (mode: CalculatorMode, value: any): Promise<boolean> => {
    try {
      const firstSlot = getFirstSlot(mode);
      
      if (!firstSlot) {
        // Create new slot with the value if no memory exists
        await addMemorySlot(mode, value, 'Memory 1');
        return true;
      }

      // Add to existing first slot
      const currentValue = typeof firstSlot.value === 'object' ? 
        parseFloat(firstSlot.value.toString()) : firstSlot.value;
      const addValue = typeof value === 'object' ? 
        parseFloat(value.toString()) : parseFloat(String(value));
      
      const result = currentValue + addValue;
      return await updateMemorySlot(firstSlot.id!, { 
        value: result,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Memory add error:', error);
      return false;
    }
  };

  /**
   * Subtract from first slot (M- operation)
   * M- should create a slot with negative value if none exists, or subtract from existing first slot
   */
  const subtractFromFirstSlot = async (mode: CalculatorMode, value: any): Promise<boolean> => {
    try {
      const firstSlot = getFirstSlot(mode);
      
      if (!firstSlot) {
        // Create new slot with negative value if no memory exists
        const negativeValue = typeof value === 'object' ? 
          -parseFloat(value.toString()) : -parseFloat(String(value));
        await addMemorySlot(mode, negativeValue, 'Memory 1');
        return true;
      }

      // Subtract from existing first slot
      const currentValue = typeof firstSlot.value === 'object' ? 
        parseFloat(firstSlot.value.toString()) : firstSlot.value;
      const subtractValue = typeof value === 'object' ? 
        parseFloat(value.toString()) : parseFloat(String(value));
      
      const result = currentValue - subtractValue;
      return await updateMemorySlot(firstSlot.id!, { 
        value: result,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Memory subtract error:', error);
      return false;
    }
  };

  /**
   * Clear first slot (MC operation)
   */
  const clearFirstSlot = async (mode: CalculatorMode): Promise<boolean> => {
    const firstSlot = getFirstSlot(mode);
    if (firstSlot && firstSlot.id) {
      return await deleteMemorySlot(firstSlot.id);
    }
    return true;
  };

  /**
   * Handle memory operations from calculator buttons
   */
  const handleMemoryOperation = (params: {
    operation: string;
    mode: CalculatorMode;
    calculator: Calculator;
    currentInput: string;
    activeBase?: string;
  }): MemoryOperationResult => {
    const { operation, mode, calculator, currentInput, activeBase } = params;
    
    try {
      switch (operation) {
        case 'MC': {
          // Clear first memory slot
          clearFirstSlot(mode);
          return createResponse(currentInput);
        }

        case 'MR': {
          // Recall first memory slot
          const firstSlot = getFirstSlot(mode);
          if (!firstSlot) {
            return createResponse(currentInput);
          }

          return mode === 'Programmer' && activeBase
            ? handleProgrammerMemoryRecall(calculator, activeBase, firstSlot.value)
            : handleStandardMemoryRecall(calculator, firstSlot.value);
        }

        case 'MS': {
          // Store current value in first slot (overwrite existing)
          try {
            const storeValue = evaluateExpression(mode, calculator, currentInput, activeBase);
            const valueToStore = mode === 'Programmer' && activeBase
              ? convertToDecimal(storeValue, calculator, activeBase)
              : storeValue;

            storeInFirstSlot(mode, valueToStore);
            return createResponse(currentInput);
          } catch (err) {
            console.error('Error in memory store:', err);
            return createResponse(currentInput, 'Memory store failed');
          }
        }

        case 'M+': {
          // Add current value to first slot
          try {
            const addValue = evaluateExpression(mode, calculator, currentInput, activeBase);
            const valueToAdd = mode === 'Programmer' && activeBase
              ? convertToDecimal(addValue, calculator, activeBase)
              : addValue;

            addToFirstSlot(mode, valueToAdd);
            return createResponse(currentInput);
          } catch (err) {
            console.error('Error in memory add:', err);
            return createResponse(currentInput, 'Memory add failed');
          }
        }

        case 'M-': {
          // Subtract current value from first slot
          try {
            const subtractValue = evaluateExpression(mode, calculator, currentInput, activeBase);
            const valueToSubtract = mode === 'Programmer' && activeBase
              ? convertToDecimal(subtractValue, calculator, activeBase)
              : subtractValue;

            subtractFromFirstSlot(mode, valueToSubtract);
            return createResponse(currentInput);
          } catch (err) {
            console.error('Error in memory subtract:', err);
            return createResponse(currentInput, 'Memory subtract failed');
          }
        }

        default:
          return createResponse(currentInput, 'Unknown memory operation');
      }
    } catch (err) {
      console.error('Memory operation error:', err);
      return createResponse(currentInput, 'Memory operation failed');
    }
  };

  return {
    handleMemoryOperation,
    recallMemorySlot,
  };
}
