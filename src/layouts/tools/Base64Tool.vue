<template>
  <div class="container mx-auto p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="rounded-lg border border-border dark:border-border overflow-hidden">
        <div class="flex border-b border-border dark:border-border bg-muted/50 dark:bg-background/50 relative">
          <Indicator :position="indicatorStyle" />                   
          <div
            v-for="tab in tabs"
            :key="tab.value"
            ref="tabElements"
            :data-path="tab.value"
            class="px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer"
            :class="[
              currentTab === tab.value
                ? 'text-primary dark:text-primary'
                : 'text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground',
            ]"
            @click="handleTabChange(tab.value, $event.target as HTMLElement)"
          >
            {{ tab.label }}
          </div>
        </div>

        <div class="p-6 bg-background dark:bg-background">
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-foreground dark:text-muted-foreground">Input</label>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="handleProcess"
                  >
                    {{ currentTab === "encode" ? "Encode" : "Decode" }}
                  </BaseButton>
                </div>
                <div class="relative">
                  <textarea 
                    ref="inputArea" 
                    v-model="input" 
                    rows="6"
                    class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground dark:border-border dark:bg-background/50"
                    :placeholder="currentTab === 'encode'
                      ? 'Enter text to encode...'
                      : 'Enter Base64 to decode...'
                    "
                    @input="handleInput"
                  />
                  <div class="absolute bottom-4 right-2">
                    <BaseButton
                      v-tippy="{ content: 'Paste' }"
                      variant="ghost"
                      size="icon"
                      @click="pasteFromClipboard"
                    >
                      <ClipboardPaste class="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-foreground dark:text-muted-foreground">Output</label>
                  <div class="flex items-center gap-2">
                    <BaseButton
                      v-tippy="{ content: 'Swap' }"
                      variant="ghost"
                      size="icon"
                      @click="handleSwap"
                    >
                      <ArrowDownUp class="h-4 w-4" />
                    </BaseButton>
                    <BaseButton
                      v-tippy="{ content: 'Copy to clipboard' }"
                      variant="ghost"
                      size="icon"
                      @click="handleCopy"
                    >
                      <Copy class="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
                <textarea
                  v-model="output"
                  rows="6"
                  readonly
                  class="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm resize-none dark:border-border dark:bg-background/50"
                  placeholder="Result will appear here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref, type ComputedRef } from "vue";
import { useClipboard } from "@vueuse/core";
import { Copy, ClipboardPaste, ArrowDownUp } from "lucide-vue-next";
import { usePills } from "@/composables/usePills.ts";
import { useToast } from "@/composables/useToast";
import BaseButton from "@/components/base/BaseButton.vue";
import Indicator from "@/components/ui/PillIndicator.vue";

/**
 * Tab configuration interface
 */
interface Tab {
  value: 'encode' | 'decode';
  label: string;
}

/**
 * Available tabs for the Base64 tool
 */
const tabs: Tab[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

// Reactive state
const input: Ref<string> = ref("");
const output: Ref<string> = ref("");
const currentTab: Ref<'encode' | 'decode'> = ref("encode");
const tabElements: Ref<HTMLElement[]> = ref([]);
const inputArea: Ref<HTMLTextAreaElement | null> = ref(null);

// Composables
const { copy } = useClipboard();
const { toast } = useToast();

// Pills system for tab navigation
const {
  currentPill,
  indicatorStyle,
  handleNavigation,
  initializePills,
} = usePills({
  position: "bottom",
  updateRoute: false,
  defaultPill: "encode",
  containerRef: tabElements,
  onNavigate: (tabValue: string) => {
    currentTab.value = tabValue as 'encode' | 'decode';
  },
});

/**
 * Computed property to determine if input is valid Base64
 */
const isValidBase64: ComputedRef<boolean> = computed(() => {
  if (!input.value.trim()) return true;
  
  try {
    // Check if it's valid Base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(input.value.replace(/\s/g, ''));
  } catch {
    return false;
  }
});

/**
 * Encode text to Base64
 */
const encodeToBase64 = (text: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    console.error("Encoding error:", error);
    throw new Error("Failed to encode text");
  }
};

/**
 * Decode Base64 to text
 */
const decodeFromBase64 = (base64: string): string => {
  try {
    const cleanBase64 = base64.replace(/\s/g, '');
    return decodeURIComponent(escape(atob(cleanBase64)));
  } catch (error) {
    console.error("Decoding error:", error);
    throw new Error("Invalid Base64 string");
  }
};

/**
 * Process the input based on current tab
 */
const processInput = (): void => {
  if (!input.value.trim()) {
    output.value = "";
    return;
  }

  try {
    if (currentTab.value === "encode") {
      output.value = encodeToBase64(input.value);
    } else {
      if (!isValidBase64.value) {
        throw new Error("Invalid Base64 format");
      }
      output.value = decodeFromBase64(input.value);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Processing failed";
    toast(errorMessage, {type: "error"});
    output.value = "";
  }
};

/**
 * Handle input changes with debouncing
 */
const handleInput = (): void => {
  processInput();
};

/**
 * Handle manual process button click
 */
const handleProcess = (): void => {
  processInput();
  if (output.value) {
    toast(
      `Successfully ${currentTab.value === "encode" ? "encoded" : "decoded"}!`,
      { type: "success" }
    );
  }
};

/**
 * Handle tab change
 */
const handleTabChange = async (tabValue: string, element: HTMLElement): Promise<void> => {
  await handleNavigation(tabValue, element);
  
  // Auto-process if there's input
  if (input.value.trim()) {
    processInput();
  }
  
  // Focus input area
  nextTick(() => {
    inputArea.value?.focus();
  });
};

/**
 * Copy output to clipboard
 */
const handleCopy = async (): Promise<void> => {
  if (!output.value) {
    toast("Nothing to copy", { type: "warning" });
    return;
  }

  try {
    await copy(output.value);
    toast("Copied to clipboard!", { type: "success" });
  } catch (error) {
    console.error("Copy failed:", error);
    toast("Failed to copy", { type: "error" });
  }
};

/**
 * Paste from clipboard to input
 */
const pasteFromClipboard = async (): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text;
    processInput();
    toast("Pasted from clipboard!", { type: "success" });
  } catch (error) {
    console.error("Paste failed:", error);
    toast("Failed to paste", { type: "error" });
  }
};

/**
 * Swap input and output
 */
const handleSwap = (): void => {
  if (!output.value) {
    toast("Nothing to swap", { type: "warning" });
    return;
  }

  const temp = input.value;
  input.value = output.value;
  output.value = temp;

  // Switch tab if needed
  const newTab = currentTab.value === "encode" ? "decode" : "encode";
  const targetElement = tabElements.value.find(
    (el) => el.dataset.path === newTab
  );
  
  if (targetElement) {
    handleTabChange(newTab, targetElement);
  }

  toast("Input and output swapped!", { type: "success" });
};

// Watch for tab changes to update pills
watch(currentTab, (newTab) => {
  currentPill.value = newTab;
});

// Initialize pills system on mount
nextTick(() => {
  initializePills("encode", tabElements);
});
</script>
