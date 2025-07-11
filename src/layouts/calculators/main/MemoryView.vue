<template>
  <div class="p-4 text-center">
    <div
      v-if="hasMemoryValue"
      class="space-y-4"
    >
      <p class="text-muted-foreground dark:text-muted-foreground">
        Current Memory Value ({{ mode }} Mode):
      </p>
      <div class="text-lg font-mono p-3 bg-muted dark:bg-muted rounded break-all">
        {{ memoryDisplayValue }}
      </div>
      <Button 
        variant="outline" 
        class="w-full"
        @click="handleClearMemory"
      >
        <TrashIcon class="w-4 h-4 mr-2" />
        Clear Memory (MC)
      </Button>
    </div>
    <div
      v-else
      class="text-center py-4 flex flex-col items-center justify-center h-full"
    >
      <div class="p-3 rounded-lg bg-muted dark:bg-muted/30 mb-3 font-medium min-w-[80%] flex flex-col items-center">
        <p class="text-muted-foreground dark:text-muted-foreground font-medium">
          Memory is Empty
        </p>
        <p class="text-muted-foreground dark:text-muted-foreground text-xs">
          Use 'MS' to store a value.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useMemory } from '@/composables/useMemory';
import { useToast } from "@/composables/useToast";
import Button from "@/components/base/BaseButton.vue";
import { TrashIcon } from "lucide-vue-next";
import { DisplayFormatter } from '@/services/display/DisplayFormatter';

const props = defineProps({ 
    mode: { type: String, required: true } 
});

// Inject the calculator instance provided in MainCalculator.vue
const calculator = inject('calculator'); 
const { state } = inject('calculatorState');

// Get the memory functions from the composable
const { hasMemory, handleMemoryOperation } = useMemory();
const { toast } = useToast();

// Use the computed property returned by hasMemory
const hasMemoryValue = hasMemory(props.mode);

const memoryDisplayValue = computed(() => {
    // Use MR operation to get the memory value instead of direct recall
    const result = handleMemoryOperation({
        operation: 'MR',
        mode: props.mode,
        calculator: calculator.value,
        currentInput: calculator.value?.input || '0',
        activeBase: props.mode === 'Programmer' ? state.activeBase : 'DEC'
    });
    
    // The MR operation returns the memory value in the input property
    const val = result.input;
    
    if (val === null || val === undefined || (val === '0' && !hasMemoryValue.value)) return '0';

    try {
        // For Programmer mode, memory is stored as decimal.
        // We should display it in the currently active base.
        if (props.mode === 'Programmer' && calculator.value && state.activeBase) {
            // The handleMemoryOperation already converts to the active base for Programmer mode
            return val;
        }
        // For Standard mode, or if Programmer mode details aren't available, format as standard.
        return DisplayFormatter.format(val.toString(), { 
            mode: 'Standard', // Use Standard format for general readability
            base: 'DEC' 
        });
    } catch(e) {
        console.error("Error formatting memory display value:", e);
        return val.toString(); // Fallback
    }
});

const handleClearMemory = () => {
    // Ensure calculator.value and activeBase are available
    const currentCalculator = calculator.value;
    const currentActiveBase = props.mode === 'Programmer' ? state.activeBase : 'DEC';

    if (!currentCalculator) {
        toast({ title: "Error", description: "Calculator instance not available.", variant: "destructive" });
        return;
    }
    
    handleMemoryOperation({
        operation: 'MC',
        mode: props.mode,
        calculator: currentCalculator, 
        currentInput: currentCalculator.input || '', // Provide current input from calculator
        activeBase: currentActiveBase 
    });
    toast({
        title: "Memory Cleared",
        description: `Memory for ${props.mode} mode has been cleared.`,
    });
};
</script>
