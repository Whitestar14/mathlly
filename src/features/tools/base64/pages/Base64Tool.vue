<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useClipboard, useDebounceFn } from '@vueuse/core';
import { Copy, ArrowDownUp, Download, X, Loader2 } from 'lucide-vue-next';
import { useToast } from '@composables/ui/useToast';

import Base64Actions from '../components/Base64Actions.vue';
import { useBase64Options } from '../composables/useBase64Options';
import { useBase64Operations } from '../composables/useBase64Operations';
import { useFileOperations } from '../composables/useFileOperations';
import { useSampleData } from '../composables/useSampleData';
import { useBase64FileUI } from '../composables/useBase64FileUI';
import { Tab } from '../types/base64';

import TextPanel from '../components/TextPanel.vue';
import FileUpload from '../components/FileUpload.vue';
import FileProcessingOverlay from '../components/FileProcessingOverlay.vue';
import { BaseButton, BaseTabs, BasePage, BaseCard } from '@components/ui';
import type { BreadcrumbItem } from '@components/ui/BasePage.vue';

import { useKeyboardStore } from '@stores/keyboard'

const keyboard = useKeyboardStore()

const tabs: Tab[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
];

const singleInput = ref('');
const encodeBuffer = ref('');
const decodeBuffer = ref('');
const currentTab = ref<'encode' | 'decode'>('encode');
const selectedFileName = ref('');

const inputArea = ref<HTMLTextAreaElement | null>(null);
const tabsRef = ref<InstanceType<typeof BaseTabs> | null>(null as any);
const isFileProcessing = ref(false);

const outputValidationError = ref('');

const { copy } = useClipboard();
const { toast } = useToast();
const base64Options = useBase64Options();

const input = computed<string>({
  get() {
    return base64Options.options.value.preserveMode
      ? currentTab.value === 'encode'
        ? encodeBuffer.value
        : decodeBuffer.value
      : singleInput.value;
  },
  set(v: string) {
    if (base64Options.options.value.preserveMode) {
      if (currentTab.value === 'encode') encodeBuffer.value = v;
      else decodeBuffer.value = v;
    } else {
      singleInput.value = v;
    }
  },
});

const {
  output,
  isProcessing,
  validationError,
  inputStats,
  outputStats,
  processInput,
  processState,
} = useBase64Operations(input, base64Options.options);

const { handleFileUpload, handleDrop, downloadOutput } = useFileOperations(
  input,
  selectedFileName,
  toast
);
const { fileInput, isDragActive, triggerFilePicker, handleDropEvent } =
  useBase64FileUI();

const sample = useSampleData();

function applyProcessResult(showToastOnSuccess = false) {
  const result = processState.value;
  if (!result) return;

  if (!result.success) {
    if (result.error?.includes('Invalid Base64')) {
      outputValidationError.value = result.error;
    } else {
      outputValidationError.value = '';
      toast(result.error ?? 'Processing failed', { type: 'error' });
    }
  } else {
    outputValidationError.value = '';
    if (showToastOnSuccess) {
      toast(
        `Successfully ${
          currentTab.value === 'encode' ? 'encoded' : 'decoded'
        }!`,
        { type: 'success' }
      );
    }
  }
}

const debouncedProcess = useDebounceFn(async (tab: 'encode' | 'decode') => {
  if (!base64Options.options.value.autoProcess) return;
  await processInput(tab);
  applyProcessResult(false);
}, 300);

const outputFormat = computed(() => {
  const format = base64Options.options.value.outputFormat;
  return format === 'url-safe'
    ? 'URL Safe'
    : format === 'mime'
    ? 'MIME'
    : 'Standard';
});

const handleInput = async (): Promise<void> => {
  selectedFileName.value = '';
  await debouncedProcess(currentTab.value);
};

const handleProcess = async (): Promise<void> => {
  await processInput(currentTab.value);
  applyProcessResult(true);
};

const onFileUpload = async (event: Event): Promise<void> => {
  try {
    isFileProcessing.value = true;
    await handleFileUpload(event);
    if (base64Options.options.value.autoProcess) {
      await processInput(currentTab.value);
      applyProcessResult(false);
    }
  } finally {
    setTimeout(() => (isFileProcessing.value = false), 150);
  }
};

const onDrop = async (event: DragEvent): Promise<void> => {
  try {
    isFileProcessing.value = true;
    await handleDropEvent(
      event,
      handleDrop,
      processInput,
      currentTab,
      base64Options.options
    );
    applyProcessResult(false);
  } finally {
    setTimeout(() => (isFileProcessing.value = false), 150);
  }
};

const handleTabChange = async (tabValue: string): Promise<void> => {
  currentTab.value = tabValue as 'encode' | 'decode';
  if (input.value.trim() && base64Options.options.value.autoProcess) {
    await processInput(currentTab.value);
    applyProcessResult(false);
  }
  nextTick(() => inputArea.value?.focus());
};

const pasteFromClipboard = async (): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text;
    selectedFileName.value = '';
    if (base64Options.options.value.autoProcess) {
      await processInput(currentTab.value);
      applyProcessResult(false);
    }
    toast('Pasted from clipboard!', { type: 'success' });
  } catch {
    toast('Failed to paste', { type: 'error' });
  }
};

const handleCopy = async (): Promise<void> => {
  if (!output.value) return toast('Nothing to copy', { type: 'warning' });
  try {
    await copy(output.value);
    toast('Copied to clipboard!', { type: 'success' });
  } catch {
    toast('Failed to copy', { type: 'error' });
  }
};

const handleSampleText = async () => {
  input.value = sample.loadSampleText();
  selectedFileName.value = '';
  if (base64Options.options.value.autoProcess) {
    await processInput('encode');
    applyProcessResult(true);
  }
};

const handleSampleBase64 = async () => {
  input.value = sample.loadSampleBase64();
  selectedFileName.value = '';
  if (base64Options.options.value.autoProcess) {
    await processInput('decode');
    applyProcessResult(true);
  }
};

const handleRandomData = () => {
  input.value = sample.generateRandomData();
  selectedFileName.value = '';
};

const handleSwap = (): void => {
  const currInput = input.value;
  const currOutput = output.value;

  if (base64Options.options.value.preserveMode) {
    if (currentTab.value === 'encode') decodeBuffer.value = currOutput;
    else encodeBuffer.value = currOutput;
    output.value = currInput;
  } else {
    input.value = currOutput;
    output.value = currInput;
  }

  selectedFileName.value = '';
  currentTab.value = currentTab.value === 'encode' ? 'decode' : 'encode';
  toast('Input and output swapped!', { type: 'success' });
};

const clearInput = (): void => {
  if (base64Options.options.value.preserveMode) {
    if (currentTab.value === 'encode') encodeBuffer.value = '';
    else decodeBuffer.value = '';
  } else {
    singleInput.value = '';
  }
  selectedFileName.value = '';
  if (base64Options.options.value.autoProcess) output.value = '';
};

const clearAll = (): void => {
  singleInput.value = '';
  encodeBuffer.value = '';
  decodeBuffer.value = '';
  output.value = '';
  selectedFileName.value = '';
  validationError.value = '';
  outputValidationError.value = '';
  toast('All fields cleared!', { type: 'success' });
};

watch(currentTab, async (newTab) => {
  if (input.value.trim() && base64Options.options.value.autoProcess) {
    await processInput(newTab);
    applyProcessResult(false);
  }
});

watch(
  () => base64Options.options.value,
  async () => {
    if (base64Options.options.value.autoProcess && input.value.trim()) {
      await processInput(currentTab.value);
      applyProcessResult(false);
    }
  },
  { deep: true }
);

nextTick(() => {
  if (tabsRef.value?.initializePills) tabsRef.value.initializePills('encode');
});

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Tools', path: '/' },
  { label: 'Base64' }
];

onMounted(() => {
  keyboard.attachAllForContext('tools.base64', {
    'Ctrl+Enter': () => handleProcess(),
    'Ctrl+V': () => pasteFromClipboard(),
    'Ctrl+C': () => handleCopy(),
    'Ctrl+S': () => handleSwap(),
  })
  keyboard.pushContext('tools.base64')
})

onUnmounted(() => {
  keyboard.popContext('tools.base64')
})

</script>

<template>
  <BasePage title="Base64" :breadcrumbs="breadcrumbs" :is-tool-layout="true">
    <div class="container mx-auto p-2 md:p-3">
      <div class="max-w-6xl mx-auto space-y-3">
        <!-- Main Tool Interface -->
        <div
          class="rounded-lg border border-border dark:border-border overflow-hidden"
        >
          <BaseTabs
            ref="tabsRef"
            v-model:model-value="currentTab"
            :tabs="tabs"
            @tab-change="handleTabChange"
          >
            <template #actions>
              <Base64Actions
                :load-sample-text="handleSampleText"
                :load-sample-base64="handleSampleBase64"
                :generate-random-data="handleRandomData"
                :clear-all="clearAll"
                :trigger-file-picker="triggerFilePicker"
              />
            </template>
          </BaseTabs>

          <div class="p-3 md:p-6 bg-background dark:bg-background">
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              @change="onFileUpload"
            />
            <FileProcessingOverlay :open="isFileProcessing" />

            <div class="relative">
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
                :class="{ invisible: isDragActive }"
                class="grid gap-2 md:gap-3 lg:grid-cols-2"
              >
                <!-- Input -->
                <BaseCard class="border-none">
                  <TextPanel
                    :model-value="input"
                    :label="`Input${
                      selectedFileName ? ` (${selectedFileName})` : ''
                    }`"
                    :placeholder="
                      currentTab === 'encode'
                        ? 'Enter text to encode or upload a file...'
                        : 'Enter Base64 to decode...'
                    "
                    :stats="inputStats"
                    :show-stats="base64Options.options.value.showCharacterCount"
                    :validation-error="validationError"
                    :show-paste-button="true"
                    @update:model-value="(v) => (input = v)"
                    @input="handleInput"
                    @drop="onDrop"
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
                  </TextPanel>
                </BaseCard>

                <!-- Output -->
                <BaseCard class="border-none">
                  <TextPanel
                    :model-value="output"
                    :label="`Output (${outputFormat})`"
                    placeholder="Result will appear here..."
                    :stats="outputStats"
                    :show-stats="
                      base64Options.options.value.showCharacterCount && !!output
                    "
                    :read-only="true"
                    :validation-error="outputValidationError"
                    @update:model-value="(v) => (output = v)"
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
                  </TextPanel>
                </BaseCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>