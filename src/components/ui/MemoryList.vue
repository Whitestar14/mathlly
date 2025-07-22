<template>
  <div class="relative">
    <!-- Memory Slots List -->
    <TransitionGroup 
      v-if="filteredMemorySlots.length > 0" 
      tag="div" 
      class="space-y-2 pb-16"
      name="memory-list" 
      @before-enter="memoryAnimation.onBeforeEnter" 
      @enter="memoryAnimation.onEnter" 
      @leave="memoryAnimation.onLeave"
    >
      <MemoryItemComponent 
        v-for="(slot, index) in filteredMemorySlots" 
        :key="slot.id" 
        :slot="slot" 
        :selected-id="selectedSlotId" 
        :data-index="index" 
        @recall="handleRecallSlot" 
        @delete="handleDeleteSlot"
        @copy="handleCopySlot"
        @edit-label="handleEditLabel"
        @add-to-slot="(slot, value) => handleSlotOperation('add', slot, value)"
        @subtract-from-slot="(slot, value) => handleSlotOperation('subtract', slot, value)"
        @save-to-slot="(slot, value) => handleSlotOperation('save', slot, value)"
      />
    </TransitionGroup>

    <!-- Empty State -->
    <div 
      v-show="!filteredMemorySlots.length && !isLoading"
      class="text-center py-8 flex flex-col items-center justify-center"
    >
      <div class="p-4 rounded-lg bg-muted/50 mb-4 max-w-sm">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3 mx-auto">
          <MemoryStickIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground font-medium mb-1">
          No memory slots yet
        </p>
        <p class="text-muted-foreground text-xs mb-3">
          Store values for quick access later
        </p>
        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">
            • Use <kbd class="px-1 py-0.5 bg-muted rounded text-xs">MS</kbd> button to store current value
          </p>
          <p class="text-xs text-muted-foreground">
            • Use <kbd class="px-1 py-0.5 bg-muted rounded text-xs">MR</kbd> button to recall stored value
          </p>
          <p class="text-xs text-muted-foreground">
            • Use <kbd class="px-1 py-0.5 bg-muted rounded text-xs">M+</kbd>/<kbd class="px-1 py-0.5 bg-muted rounded text-xs">M-</kbd> to add/subtract
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-2">
      <div 
        v-for="i in 3" 
        :key="i"
        class="rounded-lg bg-muted/30 p-3 animate-pulse"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-muted animate-pulse rounded"></div>
          <div class="flex-1">
            <div class="h-4 w-20 bg-muted animate-pulse rounded mb-1"></div>
            <div class="h-3 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Memory Slot Creation Modal -->
    <BaseModal
      v-model:open="showCreateSlot"
      description="create-memory-slot-dialog"
    >
      <template #title>
        <div class="flex items-center">
          <MemoryStickIcon class="h-5 w-5 text-primary mr-2" />
          Create Memory Slot
        </div>
      </template>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            Value
          </label>
          <BaseInput
            v-model="customValue"
            type="text"
            placeholder="Enter value..."
            autofocus
            @keydown.enter="handleCreateCustomSlot"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            Label (optional)
          </label>
          <BaseInput
            v-model="customLabel"
            type="text"
            placeholder="Enter label..."
            :maxlength="50"
            @keydown.enter="handleCreateCustomSlot"
          />
        </div>
        <div class="flex justify-end space-x-2">
          <Button variant="outline" @click="showCreateSlot = false">
            Cancel
          </Button>
          <Button @click="handleCreateCustomSlot">
            Create Slot
          </Button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, inject, type Ref, type ComputedRef } from "vue"
import { MemoryStickIcon } from "lucide-vue-next"
import { useMemoryUI, type MemorySlot } from "@/composables/useMemory"
import { useAnimation } from "@/composables/useAnimation"
import Button from "@/components/base/BaseButton.vue"
import BaseModal from "@/components/base/BaseModal.vue"
import BaseInput from "@/components/base/BaseInput.vue"
import type { CalculatorMode } from "@/composables/useCalculatorState"
import type { Calculator } from "@/services/factory/CalculatorFactory"

interface Emits {
  (e: 'recall-slot', slot: MemorySlot): void
  (e: 'memory-close'): void
  (e: 'add-current-value'): void
}

interface AnimationController {
  onBeforeEnter: (el: Element) => void
  onEnter: (el: Element, done: () => void) => void
  onLeave: (el: Element, done: () => void) => void
}

const emit = defineEmits<Emits>()

// Inject dependencies from parent components
const mode = inject<ComputedRef<CalculatorMode>>('mode')!
const isMobile = inject<ComputedRef<boolean>>('isMobile')!
const calculator = inject<Ref<Calculator>>('calculator')!
const activeBase = inject<ComputedRef<string>>('activeBase')!
const updateState = inject<(updates: any) => void>('updateState')!
const updateDisplayValues = inject<(values: any) => void>('updateDisplayValues')!

// Async component
const MemoryItemComponent = defineAsyncComponent(() => import("@/components/ui/MemoryItem.vue"))

// Use the unified memory UI composable
const {
  memorySlots,
  isLoading,
  deleteMemorySlot,
  selectMemorySlot,
  copySlot,
  handleEditLabel,
  handleSlotOperation,
  addMemorySlot,
  loadMemorySlots
} = useMemoryUI()

const { createListAnimation } = useAnimation()

// Create memory animation
const memoryAnimation: AnimationController = createListAnimation({
  initialDelay: 50,
  initialDuration: 400,
  enterTransform: [-20, 0],
  leaveTransform: [0, 80],
  leaveAxis: 'x',
  moveDuration: 300,
  moveEasing: 'easeOutQuad',
  moveDelay: 150
})

// Local state 
const selectedSlotId: Ref<number | null> = ref(null)
const showCreateSlot: Ref<boolean> = ref(false)
const customValue: Ref<string> = ref('')
const customLabel: Ref<string> = ref('')

// Computed properties
const filteredMemorySlots: ComputedRef<MemorySlot[]> = computed(() => 
  memorySlots.value.filter((slot: MemorySlot) => slot.mode === mode.value)
)

// Handle memory slot recall
const handleRecallSlot = (slot: MemorySlot): void => {
  if (slot.id !== undefined) {
    selectedSlotId.value = slot.id
    setTimeout(() => {
      selectedSlotId.value = null
    }, 300)
  }

  selectMemorySlot({
    slot,
    calculator: calculator.value,
    activeBase: activeBase.value,
    updateState,
    updateDisplayValues,
  })

  emit("recall-slot", slot)

  if (isMobile.value) {
    emit('memory-close')
  }
}

// Handle slot deletion
const handleDeleteSlot = async (id: number): Promise<void> => {
  await deleteMemorySlot(id)
}

// Handle copying slot
const handleCopySlot = async (slot: MemorySlot): Promise<void> => {
  await copySlot(slot)
}

// Handle creating custom memory slot
const handleCreateCustomSlot = async (): Promise<void> => {
  if (!customValue.value.trim()) return

  try {
    const existingSlots = filteredMemorySlots.value
    const nextSlot = existingSlots.length > 0 
      ? Math.max(...existingSlots.map((s: MemorySlot) => s.slot)) + 1 
      : 1
    
    const label = customLabel.value.trim() || `Memory ${nextSlot}`

    await addMemorySlot(mode.value, parseFloat(customValue.value), label)

    // Reset form and close modal
    customValue.value = ''
    customLabel.value = ''
    showCreateSlot.value = false

    // Reload memory slots
    await loadMemorySlots(mode.value)
  } catch (error) {
    console.error('Error creating custom memory slot:', error)
  }
}
</script>

<style scoped>
.memory-list-move {
  transition: transform 0.3s cubic-bezier(0.2, 1, 0.2, 1);
}
</style>
