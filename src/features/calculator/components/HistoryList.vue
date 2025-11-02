<template>
  <div>
    <!-- History Items List -->
    <TransitionGroup
      v-if="HistoryItems.length > 0"
      tag="div"
      class="space-y-2"
      name="history-list"
      @before-enter="historyAnimation.onBeforeEnter"
      @enter="historyAnimation.onEnter"
      @leave="historyAnimation.onLeave"
    >
      <HistoryItemComponent
        v-for="(item, index) in HistoryItems"
        :key="item.id"
        :item="item"
        :is-mobile="isMobile"
        :selected-id="selectedItemId"
        :data-index="index"
        @select="handleSelectItem"
        @delete="handleDelete(item.id!)"
        @copy="copyItem(item)"
        @copy-json="copyAsJson(item)"
      />
    </TransitionGroup>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-4 flex flex-col items-center justify-center h-full"
    >
      <div
        class="p-3 rounded-lg bg-muted/50 gap-2 font-medium min-w-[80%] flex flex-col items-center"
      >
        <p class="text-muted-foreground font-medium">
          No history items yet for {{ props.mode }} mode
        </p>
        <p class="text-muted-foreground text-xs">
          Your calculations will appear here as you work
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, type Ref } from "vue";
import { useHistory, type HistoryItem } from "@calculator/composables/useHistory";
import { useAnimation } from "@composables/ui/useAnimation";
import { useToast } from "@composables/ui/useToast";
import { useClipboard } from "@vueuse/core";

interface Props {
  mode: "Standard" | "Scientific" | "Programmer";
  isMobile?: boolean;
}

interface Emits {
  (e: "select-item", item: HistoryItem): void;
  (e: "history-close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "Standard",
  isMobile: false,
});

const emit = defineEmits<Emits>();

// Async component
const HistoryItemComponent = defineAsyncComponent(
  () => import("./HistoryItem.vue")
);

// Composables
const { historyItems, deleteItem } = useHistory();
const { toast } = useToast();
const { copy } = useClipboard();
const { createListAnimation } = useAnimation();

// Animation
const historyAnimation = createListAnimation({
  initialDelay: 50,
  initialDuration: 400,
  enterTransform: [-20, 0],
  leaveTransform: [0, 80],
  leaveAxis: "x",
  moveDuration: 300,
  moveEasing: "easeOutQuad",
  moveDelay: 150,
});

// Local state
const selectedItemId: Ref<number | null> = ref(null);

// Computed: use new API directly
const HistoryItems = computed(() => historyItems(props.mode).value);

// Handlers
const handleSelectItem = (item: HistoryItem): void => {
  if (item.id !== undefined) {
    selectedItemId.value = item.id;
    setTimeout(() => (selectedItemId.value = null), 300);
  }

  emit("select-item", {
    expression: item.expression.trim(),
    result: item.result,
    timestamp: item.timestamp,
    mode: item.mode,
    base: item.base,
    baseValues: item.baseValues,
  });

  if (props.isMobile) emit("history-close");
};

const handleDelete = async (id: number): Promise<void> => {
  await deleteItem(id, props.mode);
};

const copyItem = async (item: HistoryItem): Promise<void> => {
  try {
    await copy(`${item.expression} = ${item.result}`);
    toast({
      title: "Copied to clipboard",
      description: "The calculation has been copied to your clipboard",
    });
  } catch {
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
      2
    );
    await copy(jsonData);
    toast({
      title: "Copied as JSON",
      description: "The calculation has been copied in JSON format",
    });
  } catch {
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
