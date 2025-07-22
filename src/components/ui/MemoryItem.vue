<template>
  <div class="group relative">
    <ContextMenu
      :side-offset="5"
      align="start"
    >
      <template #trigger>
        <div
          class="rounded-lg hover:bg-secondary/80 bg-secondary p-3 transition-colors cursor-pointer"
          :class="{ 'animate-highlight': selectedId === slot.id }"
          @click="$emit('recall', slot)"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <span class="text-xs font-medium text-primary">{{ slot.slot }}</span>
              </div>
              <span class="text-sm font-medium text-foreground/90">
                {{ slot.label }}
              </span>
            </div>
            <Button
              v-if="slot.id !== undefined"
              v-tippy="{ content: 'Delete slot' }"
              variant="ghost"
              size="icon"
              class="w-6 h-6"
              :class="isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              @click.stop="handleDelete"
            >
              <TrashIcon class="h-3 w-3" />
            </Button>
          </div>
          
          <div class="text-lg font-medium text-foreground break-all">
            {{ formatValue(slot.value) }}
          </div>
          
          <div class="text-xs text-muted-foreground mt-1">
            {{ formatTimestamp(slot.timestamp) }}
          </div>
        </div>
      </template>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('recall', slot)"
      >
        <CheckIcon class="mr-2 h-4 w-4" />
        <span>Recall Value</span>
      </ContextMenuItem>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('copy', slot)"
      >
        <CopyIcon class="mr-2 h-4 w-4" />
        <span>Copy Value</span>
      </ContextMenuItem>

      <ContextMenuItem
        v-if="slot.id !== undefined"
        class="context-menu-item"
        @click="handleEditLabel"
      >
        <EditIcon class="mr-2 h-4 w-4" />
        <span>Edit Label</span>
      </ContextMenuItem>

      <ContextMenuSeparator class="h-px bg-muted my-1" />

      <ContextMenuItem
        class="context-menu-item"
        @click="handleAddToSlot"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        <span>Add Current Value</span>
      </ContextMenuItem>

      <ContextMenuItem
        class="context-menu-item"
        @click="handleSubtractFromSlot"
      >
        <MinusIcon class="mr-2 h-4 w-4" />
        <span>Subtract Current Value</span>
      </ContextMenuItem>

      <ContextMenuSeparator class="h-px bg-muted my-1" />

      <ContextMenuItem
        v-if="slot.id !== undefined"
        class="context-menu-item-danger"
        @click="handleDelete"
      >
        <TrashIcon class="mr-2 h-4 w-4" />
        <span>Delete Slot</span>
      </ContextMenuItem>
    </ContextMenu>

    <!-- Edit Label Modal -->
    <BaseModal
      v-if="slot.id !== undefined"
      v-model:open="showEditLabel"
      description="edit-label-dialog"
    >
      <template #title>
        <div class="flex items-center">
          <EditIcon class="h-5 w-5 text-primary mr-2" />
          Edit Memory Label
        </div>
      </template>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            Label for Memory Slot {{ slot.slot }}
          </label>
          <input
            v-model="editLabelValue"
            type="text"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter label..."
            maxlength="50"
            @keydown.enter="handleSaveLabel"
          >
        </div>
        <div class="flex justify-end space-x-2">
          <Button
            variant="outline"
            @click="showEditLabel = false"
          >
            Cancel
          </Button>
          <Button @click="handleSaveLabel">
            Save Label
          </Button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref, type ComputedRef } from "vue";
import { 
  TrashIcon, 
  CheckIcon, 
  CopyIcon, 
  EditIcon, 
  PlusIcon, 
  MinusIcon 
} from "lucide-vue-next";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "radix-vue";
import Button from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import ContextMenu from "@/components/base/ContextMenu.vue";
import type { MemorySlot } from "@/composables/useMemory";
import type { Calculator } from "@/services/factory/CalculatorFactory";

interface Props {
  slot: MemorySlot;
  selectedId?: number | null;
}

interface Emits {
  (e: 'recall', slot: MemorySlot): void;
  (e: 'delete', id: number): void;
  (e: 'copy', slot: MemorySlot): void;
  (e: 'edit-label', id: number, label: string): void;
  (e: 'add-to-slot', slot: MemorySlot, value: number): void;
  (e: 'subtract-from-slot', slot: MemorySlot, value: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: null,
});

const emit = defineEmits<Emits>();

// Inject dependencies from parent components
const calculator = inject<Ref<Calculator>>('calculator')!;
const currentInput = inject<ComputedRef<string>>('currentInput')!;
const isMobile = inject<ComputedRef<boolean>>('isMobile')!;

// Local state
const showEditLabel: Ref<boolean> = ref(false);
const editLabelValue: Ref<string> = ref(props.slot.label || '');

// Format value for display
const formatValue = (value: any): string => {
  if (typeof value === 'object' && value.toString) {
    return value.toString();
  }
  return String(value);
};

// Format timestamp for display
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

// Handle delete with proper type checking
const handleDelete = (): void => {
  if (props.slot.id !== undefined) {
    emit('delete', props.slot.id);
  }
};

// Handle edit label
const handleEditLabel = (): void => {
  editLabelValue.value = props.slot.label || '';
  showEditLabel.value = true;
};

// Handle save label with proper type checking
const handleSaveLabel = (): void => {
  if (editLabelValue.value.trim() && props.slot.id !== undefined) {
    emit('edit-label', props.slot.id, editLabelValue.value.trim());
  }
  showEditLabel.value = false;
};

// Handle add to slot - now gets current value from injected calculator
const handleAddToSlot = (): void => {
  if (!calculator.value || !currentInput.value) {
    console.warn('Calculator or current input not available');
    return;
  }

  try {
    const value = calculator.value.evaluateExpression(currentInput.value);
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
    emit('add-to-slot', props.slot, numericValue);
  } catch (error) {
    console.error('Error evaluating current input for add operation:', error);
    emit('add-to-slot', props.slot, 0);
  }
};

// Handle subtract from slot - now gets current value from injected calculator
const handleSubtractFromSlot = (): void => {
  if (!calculator.value || !currentInput.value) {
    console.warn('Calculator or current input not available');
    return;
  }

  try {
    const value = calculator.value.evaluateExpression(currentInput.value);
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
    emit('subtract-from-slot', props.slot, numericValue);
  } catch (error) {
    console.error('Error evaluating current input for subtract operation:', error);
    emit('subtract-from-slot', props.slot, 0);
  }
};
</script>

<style>
.animate-highlight {
  animation: highlight 0.3s ease-out;
}

@keyframes highlight {
  0% {
    @apply bg-muted/30;
  }
  100% {
    @apply bg-muted;
  }
}
</style>
