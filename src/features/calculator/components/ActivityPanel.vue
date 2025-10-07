<template>
  <BasePanel
    id="activity"
    title="Activity"
    type="drawer"
    position="left"
    :max-height-ratio="0.8"
    :snap-threshold="0.4"
    :default-desktop-state="false"
  >
    <!-- Sticky Tab Navigation -->
    <template #sticky>
      <BaseTabs
        v-model="currentTab"
        :tabs="tabs"
      />
    </template>

    <!-- Scrollable Content -->
    <div class="p-3 overflow-x-hidden">
      <!-- History Tab Content -->
      <div v-if="currentTab === 'history'">
        <HistoryList
          :mode="mode"
          :is-mobile="isMobile"
          @select-item="handleSelectItem"
          @history-close="$emit('history-close')"
        />
      </div>

      <!-- Memory Tab Content -->
      <div v-if="currentTab === 'memory'">
        <MemoryList
          :mode="mode"
          :is-mobile="isMobile"
          @recall-slot="handleRecallSlot"
          @memory-close="$emit('memory-close')"
          @add-current-value="handleAddCurrentToMemory"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <!-- History Tab Footer -->
      <div
        v-if="currentTab === 'history' && showClearButton"
        class="flex justify-end"
      >
        <BaseButton
          v-tippy="{ content: 'Clear History' }"
          variant="ghost"
          size="icon"
          class="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="showClearConfirmation = true"
        >
          <TrashIcon class="w-4 h-4" />
        </BaseButton>
        <BaseButton
          variant="destructive"
          class="w-full md:hidden"
          @click="showClearConfirmation = true"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </BaseButton>
      </div>

      <!-- Memory Tab Footer -->
      <div
        v-if="currentTab === 'memory'"
        class="flex justify-between items-center md:justify-end w-full"
      >
        <BaseButton
          v-if="hasMemorySlots"
          variant="destructive"
          size="sm"
          class="md:hidden"
          @click="showClearMemoryConfirmation = true"
        >
          <TrashIcon class="w-4 h-4" />
          Clear
        </BaseButton>

        <div class="w-full flex flex-row items-center gap-2 justify-center">
          <BaseButton
            v-if="hasMemorySlots"
            v-tippy="{ content: 'Clear All Memory Slots' }"
            variant="ghost"
            size="icon"
            class="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10"
            @click="showClearMemoryConfirmation = true"
          >
            <TrashIcon class="w-4 h-4" />
          </BaseButton>

          <BaseButton
            v-tippy="{
              content: 'Creates a new memory slot',
            }"
            variant="default"
            size="sm"
            class="w-[80%]"
            @click="handleAddCurrentToMemory"
          >
            <PlusIcon class="w-4 h-4" />
            Add New Slot
          </BaseButton>
        </div>
      </div>
    </template>
  </BasePanel>

  <!-- Clear history confirmation modal -->
  <BaseModal
    v-model:open="showClearConfirmation"
    description="confirmation-dialog"
  >
    <template #title>
      <div class="flex items-center">
        <AlertTriangleIcon class="h-5 w-5 text-destructive mr-2" />
        Clear History
      </div>
    </template>
    <p class="text-sm text-muted-foreground mb-4">
      Are you sure you want to clear all history items? This action cannot be
      undone.
    </p>
    <div class="flex justify-end space-x-2">
      <BaseButton
        variant="outline"
        @click="showClearConfirmation = false"
      >
        Cancel
      </BaseButton>
      <BaseButton
        variant="destructive"
        @click="handleClearHistory"
      >
        Clear All
      </BaseButton>
    </div>
  </BaseModal>

  <!-- Clear memory confirmation modal -->
  <BaseModal
    v-model:open="showClearMemoryConfirmation"
    description="confirmation-dialog"
  >
    <template #title>
      <div class="flex items-center">
        <AlertTriangleIcon class="h-5 w-5 text-destructive mr-2" />
        Clear All Memory
      </div>
    </template>
    <p class="text-sm text-muted-foreground mb-4">
      Are you sure you want to clear all memory slots for {{ mode }} mode? This
      action cannot be undone.
    </p>
    <div class="flex justify-end space-x-2">
      <BaseButton
        variant="outline"
        @click="showClearMemoryConfirmation = false"
      >
        Cancel
      </BaseButton>
      <BaseButton
        variant="destructive"
        @click="handleClearMemory"
      >
        Clear All Memory
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  inject,
  defineAsyncComponent,
  type Ref,
  type ComputedRef,
} from 'vue'
import { TrashIcon, AlertTriangleIcon, PlusIcon } from 'lucide-vue-next'
import { BaseButton, BaseModal, BasePanel, BaseTabs } from '@components/ui'
import { useHistory, type HistoryItem } from '@calculator/composables/useHistory'
import { useMemoryUI, type MemorySlot } from '@calculator/composables/useMemory'
import { useAnimation } from '@shared/composables/ui/useAnimation'
import { useToast } from '@shared/composables/ui/useToast'
import type { Calculator } from '@calculator/services/factory/CalculatorFactory'
import type { CalculatorMode } from '@calculator/composables/useCalculatorState'

// Types
interface Emits {
  (e: 'select-item', item: HistoryItem): void
  (e: 'history-close'): void
  (e: 'memory-close'): void
}

// Props and emits
const props = defineProps<{
  mode: CalculatorMode
  isMobile: boolean
  isOpen: boolean
}>()

const emit = defineEmits<Emits>()

// Inject dependencies from parent
const calculator = inject<Ref<Calculator>>('calculator')!
const currentInput = inject<ComputedRef<string>>('currentInput')!
const activeBase = inject<ComputedRef<string>>('activeBase')!
const updateState = inject<(updates: any) => void>('updateState')!
const updateDisplayValues = inject<(values: any) => void>('updateDisplayValues')!

// Async components
const HistoryList = defineAsyncComponent(
  () => import('./HistoryList.vue')
)
const MemoryList = defineAsyncComponent(
  () => import('./MemoryList.vue')
)

// Tabs configuration
const tabs = [
  { label: 'History', value: 'history' },
  { label: 'Memory', value: 'memory' },
]

// Local state
const currentTab = ref('history')
const showClearConfirmation: Ref<boolean> = ref(false)
const showClearMemoryConfirmation: Ref<boolean> = ref(false)

// Composables
const { historyItems, clearAll: clearAllHistory, loadHistory } = useHistory()
const {
  memorySlots,
  clearAllMemory,
  loadMemorySlots,
  selectMemorySlot,
  handleAddCurrentToMemory: addCurrentToMemory,
} = useMemoryUI()
const { toast } = useToast()
const { setInitialAnimation } = useAnimation()

// Computed properties with explicit typing
const isProgrammerMode: ComputedRef<boolean> = computed(
  () => props.mode === 'Programmer'
)

// Fixed: Remove the isProgrammerMode condition - history should be clearable in all modes
const showClearButton: ComputedRef<boolean> = computed(
  () => historyItems.value.length > 0 && !isProgrammerMode.value
)

const hasMemorySlots: ComputedRef<boolean> = computed(
  () => memorySlots.value.filter((slot: MemorySlot) => slot.mode === props.mode).length > 0
)

// Watch for panel open/close
watch(
  () => props.isOpen,
  async (isOpen: boolean) => {
    if (isOpen) {
      if (currentTab.value === 'history') {
        setInitialAnimation(true)
        await loadHistory()
        setTimeout(() => setInitialAnimation(false), 500)
      } else if (currentTab.value === 'memory') {
        await loadMemorySlots(props.mode)
      }
    }
  },
  { immediate: true }
)

// Watch for mode changes
watch(
  () => props.mode,
  async () => {
    if (props.isOpen) {
      if (currentTab.value === 'history') {
        await loadHistory()
      } else if (currentTab.value === 'memory') {
        await loadMemorySlots(props.mode)
      }
    }
  }
)

// Watch for tab changes
watch(currentTab, async (newTab: string) => {
  if (props.isOpen) {
    if (newTab === 'history') {
      setInitialAnimation(true)
      await loadHistory()
      setTimeout(() => setInitialAnimation(false), 500)
    } else if (newTab === 'memory') {
      await loadMemorySlots(props.mode)
    }
  }
})

// Handle history item selection
const handleSelectItem = (item: HistoryItem): void => {
  emit('select-item', item)
}

// Handle memory slot recall - now uses the composable
const handleRecallSlot = (slot: MemorySlot): void => {
  selectMemorySlot({
    slot,
    calculator: calculator.value,
    activeBase: activeBase.value,
    updateState,
    updateDisplayValues,
  })

  if (props.isMobile) {
    emit('memory-close')
  }
}

// Handle adding current value to memory - now uses the composable
const handleAddCurrentToMemory = async (): Promise<void> => {
  await addCurrentToMemory({
    currentInput: currentInput.value,
    mode: props.mode,
    calculator: calculator.value,
    activeBase: activeBase.value,
  })

  // Reload memory slots to update the UI
  await loadMemorySlots(props.mode)
}

// Handle clear history confirmation
const handleClearHistory = async (): Promise<void> => {
  await clearAllHistory()
  showClearConfirmation.value = false
  toast({
    title: 'History cleared',
    description: 'All history items have been removed',
  })
}

// Handle clear memory confirmation
const handleClearMemory = async (): Promise<void> => {
  await clearAllMemory(props.mode)
  showClearMemoryConfirmation.value = false
  toast({
    title: 'Memory cleared',
    description: `All memory slots for ${props.mode} mode have been removed`,
  })
}
</script>