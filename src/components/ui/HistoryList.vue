<template>
  <div>
    <!-- History Items List -->
    <TransitionGroup 
      v-if="!isProgrammerMode && historyItems.length > 0" 
      tag="div" 
      class="space-y-2"
      name="history-list" 
      @before-enter="historyAnimation.onBeforeEnter" 
      @enter="historyAnimation.onEnter" 
      @leave="historyAnimation.onLeave"
    >
      <history-item-component 
        v-for="(item, index) in historyItems" 
        :key="item.id" 
        :item="item" 
        :is-mobile="isMobile"
        :selected-id="selectedItemId" 
        :data-index="index" 
        @select="handleSelectItem" 
        @delete="handleDelete"
        @copy="copyItem"
        @copy-json="copyAsJson"
      />
    </TransitionGroup>

    <div 
      v-show="!historyItems.length || isProgrammerMode"
      class="text-center py-4 flex flex-col items-center justify-center h-full"
    >
      <div class="p-3 rounded-lg bg-muted/80 mb-3 font-medium min-w-[80%] flex flex-col items-center">
        <div v-show="isProgrammerMode">
          <p class="text-muted-foreground">
            History feature coming soon
          </p>
          <p class="text-muted-foreground text-xs">
            History is currently unavailable for Programmer Mode
          </p>
        </div>

        <div v-show="!isProgrammerMode">
          <p class="text-muted-foreground font-medium">
            No history items yet
          </p>
          <p class="text-muted-foreground text-xs">
            Your calculations will appear here as you work
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, type Ref, type ComputedRef } from "vue";
import { useHistory, type HistoryItem } from "@/composables/useHistory";
import { useAnimation } from "@/composables/useAnimation";
import { useToast } from "@/composables/useToast";
import { useClipboard } from "@vueuse/core";

interface Props {
  mode?: string;
  isMobile?: boolean;
}

interface Emits {
  (e: 'select-item', item: HistoryItem): void;
  (e: 'history-close'): void;
}

interface AnimationController {
  onBeforeEnter: (el: Element) => void;
  onEnter: (el: Element, done: () => void) => void;
  onLeave: (el: Element, done: () => void) => void;
}

interface ToastService {
  toast: (options: {
    title: string;
    description: string;
  }) => void;
}

interface ClipboardService {
  copy: (text: string) => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "Standard",
  isMobile: false,
});

const emit = defineEmits<Emits>();

// Async component
const HistoryItemComponent = defineAsyncComponent(() => import("@/components/ui/HistoryItem.vue"));

// Composables
const { historyItems, deleteItem } = useHistory();
const { toast }: ToastService = useToast();
const { copy }: ClipboardService = useClipboard();
const { createListAnimation } = useAnimation();

// Create history animation with custom options
const historyAnimation: AnimationController = createListAnimation({
  initialDelay: 50,
  initialDuration: 400,
  enterTransform: [-20, 0],
  leaveTransform: [0, 80],
  leaveAxis: 'x',
  moveDuration: 300,
  moveEasing: 'easeOutQuad',
  moveDelay: 150
});

// Local state 
const selectedItemId: Ref<number | null> = ref(null);

// Computed properties
const isProgrammerMode: ComputedRef<boolean> = computed(() => props.mode === "Programmer");

// Handle history item selection
const handleSelectItem = (item: HistoryItem): void => {
  if (isProgrammerMode.value) return;

  if (item.id !== undefined) {
    selectedItemId.value = item.id;
    setTimeout(() => {
      selectedItemId.value = null;
    }, 300);
  }

  const selectionData: HistoryItem = {
    expression: item.expression.trim(),
    result: item.result,
    timestamp: item.timestamp,
  };

  emit("select-item", selectionData);

  if (props.isMobile) {
    emit('history-close');
  }
};

const handleDelete = async (id: number): Promise<void> => {
  await deleteItem(id);
};

const copyItem = async (item: HistoryItem): Promise<void> => {
  try {
    await copy(`${item.expression} = ${item.result}`);
    toast({
      title: "Copied to clipboard",
      description: "The calculation has been copied to your clipboard",
    });
  } catch (error) {
    console.error('Failed to copy item:', error);
    toast({
      title: "Copy failed",
      description: "Failed to copy the calculation to clipboard",
    });
  }
};

const copyAsJson = async (item: HistoryItem): Promise<void> => {
  try {
    const jsonData = JSON.stringify(
      {
        expression: item.expression,
        result: item.result,
        timestamp: item.timestamp,
      },
      null,
      2,
    );
    
    await copy(jsonData);
    toast({
      title: "Copied as JSON",
      description: "The calculation has been copied in JSON format",
    });
  } catch (error) {
    console.error('Failed to copy as JSON:', error);
    toast({
      title: "Copy failed",
      description: "Failed to copy the calculation as JSON",
    });
  }
};
</script>

<style scoped>
.history-list-move {
  transition: transform 0.3s cubic-bezier(0.2, 1, 0.2, 1);
}
</style>
