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
      <div
        class="border-b border-border bg-backdrop-surface/95 backdrop-blur-md shadow-sm"
      >
        <div class="flex relative justify-evenly">
          <Indicator :position="indicatorStyle" />
          <div
            v-for="tab in tabs"
            :key="tab.value"
            ref="tabElements"
            :data-path="tab.value"
            class="px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer"
            :class="[
              currentTab === tab.value
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="handleTabChange(tab.value, $event.target as HTMLElement)"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>
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
        <Button
          v-tippy="{ content: 'Clear History' }"
          variant="ghost"
          size="icon"
          class="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="showClearConfirmation = true"
        >
          <TrashIcon class="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          class="w-full md:hidden"
          @click="showClearConfirmation = true"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>

      <!-- Memory Tab Footer -->
      <div
        v-if="currentTab === 'memory'"
        class="flex justify-between items-center md:justify-end w-full"
      >
        <Button
          v-if="hasMemorySlots"
          variant="destructive"
          size="sm"
          class="md:hidden"
          @click="showClearMemoryConfirmation = true"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear All
        </Button>

        <div class="w-[80%] flex flex-row items-center gap-1 justify-end">
          <Button
            v-if="hasMemorySlots"
            v-tippy="{ content: 'Clear All Memory Slots' }"
            variant="ghost"
            size="icon"
            class="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10"
            @click="showClearMemoryConfirmation = true"
          >
            <TrashIcon class="w-4 h-4" />
          </Button>

          <Button
            v-tippy="{
              content: 'Creates a new memory slot',
            }"
            variant="default"
            size="sm"
            @click="handleAddCurrentToMemory"
          >
            <PlusIcon class="w-4 h-4" />
            Add New Slot
          </Button>
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
      <Button
        variant="outline"
        @click="showClearConfirmation = false"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        @click="handleClearHistory"
      >
        Clear All
      </Button>
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
      <Button
        variant="outline"
        @click="showClearMemoryConfirmation = false"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        @click="handleClearMemory"
      >
        Clear All Memory
      </Button>
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
import Button from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BasePanel from '@/components/base/BasePanel.vue'
import Indicator from '@/components/ui/PillIndicator.vue'
import { useHistory, type HistoryItem } from '@/composables/useHistory'
import { useMemoryUI, type MemorySlot } from '@/composables/useMemory'
import { useAnimation } from '@/composables/useAnimation'
import { useToast } from '@/composables/useToast'
import { usePills } from '@/composables/usePills'
import type { Calculator } from '@/services/factory/CalculatorFactory'
import type { CalculatorMode } from '@/composables/useCalculatorState'

// Types
interface Tab {
  label: string
  value: string
}

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
  () => import('@/components/ui/HistoryList.vue')
)
const MemoryList = defineAsyncComponent(
  () => import('@/components/ui/MemoryList.vue')
)

// Tabs configuration
const tabs: Ref<Tab[]> = ref([
  { label: 'History', value: 'history' },
  { label: 'Memory', value: 'memory' },
])

const tabElements: Ref<HTMLElement[]> = ref([])

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

// Tab navigation using usePills
const { currentPill, indicatorStyle, handleNavigation } = usePills({
  position: 'bottom',
  updateRoute: false,
  defaultPill: 'history',
  containerRef: tabElements,
})

// Local state
const showClearConfirmation: Ref<boolean> = ref(false)
const showClearMemoryConfirmation: Ref<boolean> = ref(false)

// Computed properties with explicit typing
const currentTab: ComputedRef<string> = computed(() => currentPill.value)
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

// Handle tab change
const handleTabChange = (value: string, tabElement: HTMLElement): void => {
  handleNavigation(value, tabElement)
}

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
