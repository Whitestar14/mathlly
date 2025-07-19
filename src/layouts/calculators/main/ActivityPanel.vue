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
      <div class="border-b border-border bg-backdrop-surface/95 backdrop-blur-md shadow-sm">
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
          <div
            v-show="currentTab === 'memory'"
            class="text-center py-4 flex flex-col items-center justify-center h-full"
          >
            <div class="p-3 rounded-lg bg-muted/80 mb-3 font-medium min-w-[80%] flex flex-col items-center">
              <p class="text-muted-foreground font-medium">
                Memory feature coming soon
              </p>
              <p class="text-muted-foreground text-xs">
                Save and recall values for your calculations
              </p>
            </div>
          </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div v-if="showClearButton && currentTab === 'history'" class="flex justify-end">
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
    </template>
  </BasePanel>

  <!-- Clear confirmation modal -->
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
      Are you sure you want to clear all history items? This action cannot
      be undone.
    </p>
    <div class="flex justify-end space-x-2">
      <Button variant="outline" @click="showClearConfirmation = false">
        Cancel
      </Button>
      <Button variant="destructive" @click="handleClear">
        Clear All
      </Button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Ref, type ComputedRef } from "vue"
import { TrashIcon, AlertTriangleIcon } from "lucide-vue-next"
import Button from "@/components/base/BaseButton.vue"
import BaseModal from "@/components/base/BaseModal.vue"
import BasePanel from "@/components/base/BasePanel.vue"
import HistoryList from "@/components/ui/HistoryList.vue"
import Indicator from "@/components/ui/PillIndicator.vue"
import { useHistory, type HistoryItem } from "@/composables/useHistory"
import { useAnimation } from "@/composables/useAnimation"
import { useToast } from "@/composables/useToast"
import { usePills } from "@/composables/usePills"

// Types
interface Props {
  mode?: string;
  isMobile?: boolean;
  isOpen?: boolean;
}

interface Tab {
  label: string;
  value: string;
}

interface Emits {
  (e: 'select-item', item: HistoryItem): void;
  (e: 'history-close'): void;
}

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  mode: "Standard",
  isMobile: false,
  isOpen: false,
});

const emit = defineEmits<Emits>();

// Tabs configuration
const tabs: Ref<Tab[]> = ref([
  { label: "History", value: "history" },
  { label: "Memory", value: "memory" },
]);

const tabElements: Ref<HTMLElement[]> = ref([]);

// Composables
const { historyItems, clearAll, loadHistory } = useHistory();
const { toast } = useToast();
const { setInitialAnimation } = useAnimation();

// Tab navigation using usePills
const {
  currentPill,
  indicatorStyle,
  handleNavigation
} = usePills({ 
  position: "bottom", 
  updateRoute: false, 
  defaultPill: "history",
  containerRef: tabElements
});

// Local state 
const showClearConfirmation: Ref<boolean> = ref(false);

// Computed properties
const currentTab: ComputedRef<string> = computed(() => currentPill.value);
const isProgrammerMode: ComputedRef<boolean> = computed(() => props.mode === "Programmer");
const showClearButton: ComputedRef<boolean> = computed(() => 
  historyItems.value.length > 0 && !isProgrammerMode.value
);

// Handle tab change
const handleTabChange = (value: string, tabElement: HTMLElement): void => {
  handleNavigation(value, tabElement);
};

// Watch for panel open/close
watch(
  () => props.isOpen,
  async (isOpen: boolean) => {
    if (isOpen && !isProgrammerMode.value && currentTab.value === 'history') {
      setInitialAnimation(true);
      await loadHistory();
      setTimeout(() => setInitialAnimation(false), 500);
    }
  },
  { immediate: true },
);

// Watch for mode changes
watch(
  () => props.mode,
  () => {
    if (!isProgrammerMode.value && props.isOpen && currentTab.value === 'history') {
      loadHistory();
    }
  },
);

// Watch for tab changes
watch(
  currentTab,
  (newTab: string) => {
    if (newTab === 'history' && !isProgrammerMode.value && props.isOpen) {
      loadHistory();
    }
  }
);

// Handle history item selection
const handleSelectItem = (item: HistoryItem): void => {
  emit("select-item", item);
};

// Handle clear confirmation
const handleClear = async (): Promise<void> => {
  await clearAll();
  showClearConfirmation.value = false;
  toast({
    title: "History cleared",
    description: "All history items have been removed",
  });
};
</script>
