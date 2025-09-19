<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useClipboard } from "@vueuse/core";
import { 
  Copy, 
  ArrowDownUp, 
  Download, 
  X, 
  Loader2
} from "lucide-vue-next";
import { useToast } from "@composables/ui/useToast";
import Base64Actions from "../components/Base64Actions.vue";
import { useBase64Options } from "@base64/composables/useBase64Options";
import { useBase64Operations } from "@base64/composables/useBase64Operations";
import { useFileOperations } from "@base64/composables/useFileOperations";
import { useSampleData } from "@base64/composables/useSampleData";
import { useBase64FileUI } from "@base64/composables/useBase64FileUI";
import { Tab } from "../types/base64";
import { BaseButton } from '@components/ui'
import Base64Tabs from '@base64/components/Base64Tabs.vue';
import FileUpload from '@base64/components/FileUpload.vue';
import TextAreaField from '@base64/components/TextAreaField.vue';

const tabs: Tab[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

// Reactive state and mode buffers
const singleInput = ref("");
const encodeBuffer = ref("");
const decodeBuffer = ref("");
const currentTab = ref<'encode' | 'decode'>("encode");
const selectedFileName = ref("");
const inputArea = ref<HTMLTextAreaElement | null>(null);
const tabElements = ref<any>(null);
const outputValidationError = ref("");

// Composables
const { copy } = useClipboard();
const { toast } = useToast();
const base64Options = useBase64Options();

// Computed input that maps to the appropriate buffer based on preserveMode
const input = computed<string>({
  get() {
    // If preserveMode enabled, return the buffer for the active tab
    if (base64Options.options.value.preserveMode) {
      return currentTab.value === 'encode' ? encodeBuffer.value : decodeBuffer.value;
    }
    return singleInput.value;
  },
  set(v: string) {
    if (base64Options.options.value.preserveMode) {
      if (currentTab.value === 'encode') encodeBuffer.value = v;
      else decodeBuffer.value = v;
    } else {
      singleInput.value = v;
    }
  }
});
const { output, isProcessing, validationError, inputStats, outputStats, processInput } = 
  useBase64Operations(input, base64Options.options);
const { handleFileUpload, handleDrop, downloadOutput } = 
  useFileOperations(input, selectedFileName, toast);
const { loadSampleText, loadSampleBase64, generateRandomData } = 
  useSampleData(input, selectedFileName);

const outputFormat = computed(() => {
  const format = base64Options.options.value.outputFormat;
  switch (format) {
    case 'url-safe': return 'URL Safe';
    case 'mime': return 'MIME';
    default: return 'Standard';
  }
});

// File UI + drag state handled by composable to keep this file small
const { fileInput, isDragActive, triggerFilePicker, handleDropEvent } = useBase64FileUI();

const handleInput = async (): Promise<void> => {
  selectedFileName.value = "";
  if (base64Options.options.value.autoProcess) {
    const result = await processInput(currentTab.value);
    if (!result.success) {
      outputValidationError.value = result.error ?? "Processing failed";
    } else {
      outputValidationError.value = "";
    }
  }
};

const handleProcess = async (): Promise<void> => {
  const result = await processInput(currentTab.value);
  if (result.success && output.value) {
    outputValidationError.value = "";
    toast(
      `Successfully ${currentTab.value === "encode" ? "encoded" : "decoded"}!`,
      { type: "success" }
    );
  } else if (!result.success) {
    // show error by highlighting output instead of using a toast
    outputValidationError.value = result.error ?? "Processing failed";
  }
};

// File upload wrapper to trigger processing after the composable handles the file
const onFileUpload = async (event: Event): Promise<void> => {
  await handleFileUpload(event);
  if (base64Options.options.value.autoProcess) {
    const result = await processInput(currentTab.value);
    if (!result.success) {
      outputValidationError.value = result.error ?? "Processing failed";
    } else {
      outputValidationError.value = "";
    }
  }
};

// triggerFilePicker now provided by the composable

// Drop wrapper to trigger processing after file is assigned to the hidden input
const onDrop = async (event: DragEvent): Promise<void> => {
  await handleDropEvent(event, handleDrop, processInput, currentTab, base64Options.options);
};

const handleTabChange = async (tabValue: string): Promise<void> => {
  currentTab.value = tabValue as 'encode' | 'decode';
  
  if (input.value.trim() && base64Options.options.value.autoProcess) {
    await processInput(currentTab.value);
  }
  
  nextTick(() => {
    inputArea.value?.focus();
  });
};

const handleCopy = async (): Promise<void> => {
  if (!output.value) {
    toast("Nothing to copy", { type: "warning" });
    return;
  }

  try {
    await copy(output.value);
    toast("Copied to clipboard!", { type: "success" });
  } catch {
    toast("Failed to copy", { type: "error" });
  }
};

const handleSwap = (): void => {
  const currInput = input.value;
  const currOutput = output.value;

  if (base64Options.options.value.preserveMode) {
    // When preserving mode buffers, put the output into the other mode's buffer
    if (currentTab.value === 'encode') {
      // place output into decode buffer so user can decode it immediately
      decodeBuffer.value = currOutput;
    } else {
      encodeBuffer.value = currOutput;
    }

    // Move current input into output
    output.value = currInput;
  } else {
    // simpler swap when not preserving mode
    input.value = currOutput;
    output.value = currInput;
  }

  selectedFileName.value = "";

  const newTab = currentTab.value === "encode" ? "decode" : "encode";
  currentTab.value = newTab;

  toast("Input and output swapped!", { type: "success" });
};

const clearInput = (): void => {
  if (base64Options.options.value.preserveMode) {
    // Clear only the active buffer
    if (currentTab.value === 'encode') encodeBuffer.value = '';
    else decodeBuffer.value = '';
  } else {
    singleInput.value = '';
  }

  selectedFileName.value = "";
  if (base64Options.options.value.autoProcess) {
    output.value = "";
  }
};

const clearAll = (): void => {
  // Clear all buffers and output
  singleInput.value = '';
  encodeBuffer.value = '';
  decodeBuffer.value = '';
  output.value = '';
  selectedFileName.value = '';
  validationError.value = '';
  outputValidationError.value = '';
  toast("All fields cleared!", { type: "success" });
};

// Watchers
watch(currentTab, async (newTab) => {
  if (input.value.trim() && base64Options.options.value.autoProcess) {
    const result = await processInput(newTab);
    if (!result.success) {
      outputValidationError.value = result.error ?? "Processing failed";
    } else {
      outputValidationError.value = "";
    }
  }
});

watch(
  () => base64Options.options.value,
  async () => {
    if (base64Options.options.value.autoProcess && input.value.trim()) {
      const result = await processInput(currentTab.value);
      if (!result.success) {
        outputValidationError.value = result.error ?? "Processing failed";
      } else {
        outputValidationError.value = "";
      }
    }
  },
  { deep: true }
);

const pasteFromClipboard = async (): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text;
    selectedFileName.value = "";
    
    if (base64Options.options.value.autoProcess) {
      const result = await processInput(currentTab.value);
      if (!result.success) {
        outputValidationError.value = result.error ?? "Processing failed";
      } else {
        outputValidationError.value = "";
      }
    }
    toast("Pasted from clipboard!", { type: "success" });
  } catch {
    toast("Failed to paste", { type: "error" });
  }
};

// Initialize
nextTick(() => {
  if (tabElements.value) {
    tabElements.value.initializePills("encode");
  }
});
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Main Tool Interface -->
      <div class="rounded-lg border border-border dark:border-border overflow-hidden">
        <Base64Tabs
          ref="tabElements"
          :tabs="tabs"
          :current-tab="currentTab"
          @tab-change="handleTabChange"
        >
          <template #actions>
            <Base64Actions
              :load-sample-text="loadSampleText"
              :load-sample-base64="loadSampleBase64"
              :generate-random-data="generateRandomData"
              :clear-all="clearAll"
              :trigger-file-picker="triggerFilePicker"
            />
          </template>
        </Base64Tabs>

        <div class="p-6 bg-background dark:bg-background">
          <!-- File Upload Section (visually hidden - textarea becomes drop target) -->
          <!-- Hidden native file input used for mobile upload and programmatic triggers -->
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            @change="onFileUpload"
          >

          <div class="relative">
            <!-- Animated global drop overlay covering both input/output areas -->
            <div
              v-if="isDragActive"
              class="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto"
            >
              <transition
                name="fade-scale"
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <FileUpload
                  :handle-binary-files="true"
                  :current-tab="currentTab"
                  class="w-full max-w-md mx-auto"
                  @file-upload="onFileUpload"
                  @drop="onDrop"
                />
              </transition>
            </div>

            <div
              :class="{ 'invisible': isDragActive }"
              class="grid gap-6 lg:grid-cols-2"
            >
              <!-- Input Section -->
              <div class="space-y-3">
                <TextAreaField
                  v-model="input"
                  :label="`Input${selectedFileName ? ` (${selectedFileName})` : ''}`"
                  :placeholder="currentTab === 'encode' ? 'Enter text to encode or upload a file...' : 'Enter Base64 to decode...'"
                  :stats="inputStats"
                  :show-stats="base64Options.options.value.showCharacterCount"
                  :validation-error="validationError"
                  :validate-input="base64Options.options.value.validateInput"
                  :show-paste-button="true"
                  @input="handleInput"
                  @drop="onDrop"
                  @dragover.prevent
                  @dragenter.prevent
                  @paste="pasteFromClipboard"
                >
                  <template #actions>
                    <div class="flex items-center gap-2">
                      <BaseButton
                        v-if="!base64Options.options.value.autoProcess"
                        variant="outline"
                        size="sm"
                        :disabled="isProcessing"
                        @click="handleProcess"
                      >
                        <Loader2
                          v-if="isProcessing"
                          class="h-3 w-3 animate-spin mr-1"
                        />
                        {{ currentTab === 'encode' ? 'Encode' : 'Decode' }}
                      </BaseButton>
                      <BaseButton
                        v-if="input"
                        variant="ghost"
                        class="h-6 w-6"
                        size="icon"
                        @click="clearInput"
                      >
                        <X class="h-3 w-3" />
                      </BaseButton>
                    </div>
                  </template>
                </TextAreaField>
              </div>

              <!-- Output Section -->
              <div class="space-y-3">
                <TextAreaField
                  v-model="output"
                  :label="`Output (${outputFormat})`"
                  placeholder="Result will appear here..."
                  :stats="outputStats"
                  :show-stats="base64Options.options.value.showCharacterCount && !!output"
                  :read-only="true"
                  :validation-error="outputValidationError"
                  :validate-input="true"
                >
                  <template #actions>
                    <div class="flex items-center gap-2">
                      <BaseButton
                        v-tippy="{ content: 'Swap input/output' }"
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6"
                        :disabled="!output"
                        @click="handleSwap"
                      >
                        <ArrowDownUp class="h-3 w-3" />
                      </BaseButton>
                      <BaseButton
                        v-tippy="{ content: 'Download as file' }"
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6"
                        :disabled="!output"
                        @click="downloadOutput(output, currentTab)"
                      >
                        <Download class="h-3 w-3" />
                      </BaseButton>
                      <BaseButton
                        v-tippy="{ content: 'Copy to clipboard' }"
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6"
                        :disabled="!output"
                        @click="handleCopy"
                      >
                        <Copy class="h-3 w-3" />
                      </BaseButton>
                    </div>
                  </template>
                </TextAreaField>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>