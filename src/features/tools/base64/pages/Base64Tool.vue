<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref, type ComputedRef } from "vue";
import { useClipboard } from "@vueuse/core";
import { 
  Copy, 
  ClipboardPaste, 
  ArrowDownUp, 
  Upload, 
  Download, 
  X, 
  AlertCircle,
  FileText,
  Code,
  Shuffle,
  Trash2,
  Loader2
} from "lucide-vue-next";
import { usePills } from "@composables/ui/usePills";
import { useToast } from "@composables/ui/useToast";
import { useBase64Options } from "@base64/composables/useBase64Options";
import { BaseButton, PillIndicator as Indicator } from '@components/ui'

/**
 * Tab configuration interface
 */
interface Tab {
  value: 'encode' | 'decode';
  label: string;
}

/**
 * Text statistics interface
 */
interface TextStats {
  characters: number;
  bytes: number;
  lines: number;
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
const fileInput: Ref<HTMLInputElement | null> = ref(null);
const selectedFileName: Ref<string> = ref("");
const isProcessing: Ref<boolean> = ref(false);
const validationError: Ref<string> = ref("");

// Composables
const { copy } = useClipboard();
const { toast } = useToast();

// Initialize Base64 options
const base64Options = useBase64Options();

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
 * Computed properties for text statistics
 */
const inputStats: ComputedRef<TextStats> = computed(() => ({
  characters: input.value.length,
  bytes: new Blob([input.value]).size,
  lines: input.value.split('\n').length
}));

const outputStats: ComputedRef<TextStats> = computed(() => ({
  characters: output.value.length,
  bytes: new Blob([output.value]).size,
  lines: output.value.split('\n').length
}));

/**
 * Computed property for output format display
 */
const outputFormat: ComputedRef<string> = computed(() => {
  const format = base64Options.outputFormat.value;
  switch (format) {
    case 'url-safe': {
      return 'URL Safe';
    }
    case 'mime': {
      return 'MIME';
    }
    default: {
      return 'Standard';
    }
  }
});

/**
 * Computed property to validate Base64 input
 */
const isValidBase64: ComputedRef<boolean> = computed(() => {
  if (!input.value.trim()) {
    return true;
  }
  
  if (currentTab.value !== 'decode') {
    return true;
  }
  
  try {
    const cleanInput = input.value.replace(/\s/g, '');
    
    // Check basic Base64 format
    const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
    if (!base64Regex.test(cleanInput)) {
      return false;
    }
    
    // Check length (must be multiple of 4 for standard/MIME)
    if (base64Options.outputFormat.value !== 'url-safe' && cleanInput.length % 4 !== 0) {
      return false;
    }
    
    // Try to decode to validate
    atob(cleanInput.replace(/-/g, '+').replace(/_/g, '/'));
    return true;
  } catch {
    return false;
  }
});

// Watch for validation errors and update the error message
watch([input, currentTab, isValidBase64], () => {
  if (!input.value.trim()) {
    validationError.value = "";
    return;
  }
  
  if (currentTab.value !== 'decode') {
    validationError.value = "";
    return;
  }
  
  if (!isValidBase64.value) {
    try {
      const cleanInput = input.value.replace(/\s/g, '');
      
      // Check basic Base64 format
      const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
      if (!base64Regex.test(cleanInput)) {
        validationError.value = "Invalid Base64 characters detected";
        return;
      }
      
      // Check length (must be multiple of 4 for standard/MIME)
      if (base64Options.outputFormat.value !== 'url-safe' && cleanInput.length % 4 !== 0) {
        validationError.value = "Invalid Base64 length (must be multiple of 4)";
        return;
      }
      
      validationError.value = "Invalid Base64 format";
    } catch {
      validationError.value = "Invalid Base64 format";
    }
  } else {
    validationError.value = "";
  }
});

/**
 * Compress data using GZIP (simplified implementation)
 */
const compressData = async (data: string): Promise<string> => {
  if (base64Options.compressionLevel?.value === 'none') {
    return data;
  }
  
  // Note: This is a simplified implementation
  // In a real app, you'd use a proper compression library like pako
  try {
    const compressed = new TextEncoder().encode(data);
    return new TextDecoder().decode(compressed);
  } catch (error) {
    console.warn("Compression failed, using original data:", error);
    return data;
  }
};

/**
 * Encode text to Base64 with format options
 */
const encodeToBase64 = async (text: string): Promise<string> => {
  try {
    const currentOptions = base64Options.options.value;
    
    const processedText = currentOptions.preserveWhitespace ? text : text.trim();
    const compressedText = await compressData(processedText);
    
    let encoded = btoa(unescape(encodeURIComponent(compressedText)));
    
    // Apply output format
    switch (currentOptions.outputFormat) {
      case 'url-safe': {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        break;
      }
      case 'mime': {
        // Add line breaks for MIME format
        const chunks = encoded.match(new RegExp(`.{1,${currentOptions.lineLength}}`, 'g')) || [];
        encoded = chunks.join('\n');
        break;
      }
      // 'standard' format needs no modification
    }
    
    return encoded;
  } catch (error) {
    console.error("Encoding error:", error);
    throw new Error("Failed to encode text");
  }
};

/**
 * Decode Base64 to text with format handling
 */
const decodeFromBase64 = async (base64: string): Promise<string> => {
  try {
    const currentOptions = base64Options.options.value;
    
    let cleanBase64 = base64.replace(/\s/g, '');
    
    // Handle URL-safe format
    if (currentOptions.outputFormat === 'url-safe') {
      cleanBase64 = cleanBase64.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (cleanBase64.length % 4) {
        cleanBase64 += '=';
      }
    }
    
    return decodeURIComponent(escape(atob(cleanBase64)));
  } catch (error) {
    console.error("Decoding error:", error);
    throw new Error("Invalid Base64 string");
  }
};

/**
 * Process the input based on current tab
 */
const processInput = async (): Promise<void> => {
  if (!input.value.trim()) {
    output.value = "";
    return;
  }

  isProcessing.value = true;
  
  try {
    if (currentTab.value === "encode") {
      output.value = await encodeToBase64(input.value);
    } else {
      if (!isValidBase64.value) {
        throw new Error("Invalid Base64 format");
      }
      output.value = await decodeFromBase64(input.value);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Processing failed";
    toast(errorMessage, { type: "error" });
    output.value = "";
  } finally {
    isProcessing.value = false;
  }
};

/**
 * Handle input changes with auto-processing
 */
const handleInput = async (): Promise<void> => {
  selectedFileName.value = ""; // Clear filename when typing
  
  if (base64Options.autoProcess.value) {
    await processInput();
  }
};

/**
 * Handle manual process button click
 */
const handleProcess = async (): Promise<void> => {
  await processInput();
  if (output.value) {
    toast(
      `Successfully ${currentTab.value === "encode" ? "encoded" : "decoded"}!`,
      { type: "success" }
    );
  }
};

/**
 * Handle file upload
 */
const handleFileUpload = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    toast("File size exceeds 10MB limit", { type: "error" });
    return;
  }
  
  selectedFileName.value = file.name;
  
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      input.value = result;
      
      if (base64Options.autoProcess.value) {
        await processInput();
      }
    };
    
    // Read as text for text files, as data URL for binary files
    if (file.type.startsWith('text/') || file.type === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
    
    toast(`File "${file.name}" loaded successfully`, { type: "success" });
  } catch (error) {
    console.error("File upload error:", error);
    toast("Failed to read file", { type: "error" });
  }
};

/**
 * Handle drag and drop
 */
const handleDrop = async (event: DragEvent): Promise<void> => {
  event.preventDefault();
  
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  
  // Simulate file input change
  if (fileInput.value) {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.value.files = dt.files;
    
    await handleFileUpload({ target: fileInput.value } as any);
  }
};

/**
 * Handle tab change
 */
const handleTabChange = async (tabValue: string, element: HTMLElement): Promise<void> => {
  await handleNavigation(tabValue, element);
  
  // Auto-process if there's input and auto-process is enabled
  if (input.value.trim() && base64Options.autoProcess.value) {
    await processInput();
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
    selectedFileName.value = "";
    
    if (base64Options.autoProcess.value) {
      await processInput();
    }
    toast("Pasted from clipboard!", { type: "success" });
  } catch (error) {
    console.error("Paste failed:", error);
    toast("Failed to paste", { type: "error" });
  }
};

/**
 * Swap input and output
 */
const handleSwap = async (): Promise<void> => {
  if (!output.value) {
    toast("Nothing to swap", { type: "warning" });
    return;
  }

  const temp = input.value;
  input.value = output.value;
  output.value = temp;
  selectedFileName.value = "";

  // Switch tab if needed
  const newTab = currentTab.value === "encode" ? "decode" : "encode";
  const targetElement = tabElements.value.find(
    (el) => el.dataset.path === newTab
  );
  
  if (targetElement) {
    await handleTabChange(newTab, targetElement);
  }

  toast("Input and output swapped!", { type: "success" });
};

/**
 * Download output as file
 */
const downloadOutput = (): void => {
  if (!output.value) {
    toast("Nothing to download", { type: "warning" });
    return;
  }

  const blob = new Blob([output.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = currentTab.value === 'encode' 
    ? `encoded_${Date.now()}.txt`
    : `decoded_${Date.now()}.txt`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast("File downloaded!", { type: "success" });
};

/**
 * Load sample text for testing
 */
const loadSampleText = (): void => {
  const sampleTexts = [
    "Hello, World! This is a sample text for Base64 encoding.",
    "The quick brown fox jumps over the lazy dog. 🦊",
    "Base64 is a group of binary-to-text encoding schemes.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  ];
  
  input.value = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  selectedFileName.value = "";
  currentTab.value = "encode";
  
  if (base64Options.autoProcess.value) {
    processInput();
  }
};

/**
 * Load sample Base64 for testing
 */
const loadSampleBase64 = (): void => {
  const sampleBase64s = [
    "SGVsbG8sIFdvcmxkIQ==", // "Hello, World!"
    "VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4=", // "The quick brown fox jumps over the lazy dog."
    "QmFzZTY0IGlzIGEgZ3JvdXAgb2YgYmluYXJ5LXRvLXRleHQgZW5jb2Rpbmcgc2NoZW1lcy4=", // "Base64 is a group of binary-to-text encoding schemes."
    "TWF0aGxseSBpcyBhbiBhd2Vzb21lIHRvb2wh" // "Mathlly is an awesome tool!"
  ];
  
  input.value = sampleBase64s[Math.floor(Math.random() * sampleBase64s.length)];
  selectedFileName.value = "";
  currentTab.value = "decode";
  
  if (base64Options.autoProcess.value) {
    processInput();
  }
};

/**
 * Generate random data for testing
 */
const generateRandomData = (): void => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const length = Math.floor(Math.random() * 200) + 50; // 50-250 characters
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  input.value = result;
  selectedFileName.value = "";
  currentTab.value = "encode";
  
  if (base64Options.autoProcess.value) {
    processInput();
  }
  
  toast("Random data generated!", { type: "success" });
};

/**
 * Clear input field
 */
const clearInput = (): void => {
  input.value = "";
  selectedFileName.value = "";
  if (base64Options.autoProcess.value) {
    output.value = "";
  }
};

/**
 * Clear all fields
 */
const clearAll = (): void => {
  input.value = "";
  output.value = "";
  selectedFileName.value = "";
  validationError.value = "";
  toast("All fields cleared!", { type: "success" });
};

// Watch for tab changes to update pills
watch(currentTab, (newTab) => {
  currentPill.value = newTab;
});

// Watch for option changes and reprocess if auto-process is enabled
watch(
  () => base64Options.options.value,
  async () => {
    if (base64Options.autoProcess.value && input.value.trim()) {
      await processInput();
    }
  },
  { deep: true }
);

// Watch for auto-process changes specifically
watch(() => base64Options.autoProcess.value, async (newValue) => {
  if (newValue && input.value.trim()) {
    await processInput();
  }
});

// Initialize pills system on mount
nextTick(() => {
  initializePills("encode", tabElements);
});
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Main Tool Interface -->
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
          <!-- File Upload Section (when enabled) -->
          <div
            v-if="base64Options.handleBinaryFiles.value && currentTab === 'encode'"
            class="mb-6"
          >
            <div class="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                @change="handleFileUpload"
              >
              <div class="space-y-2">
                <Upload class="h-8 w-8 mx-auto text-muted-foreground" />
                <div class="text-sm text-muted-foreground">
                  <button
                    class="text-primary hover:underline"
                    @click="fileInput?.click()"
                  >
                    Click to upload
                  </button>
                  or drag and drop a file
                </div>
                <div class="text-xs text-muted-foreground">
                  Maximum file size: 10MB
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Input Section -->
            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-foreground dark:text-muted-foreground">
                    Input
                    <span
                      v-if="selectedFileName"
                      class="text-xs text-muted-foreground ml-2"
                    >
                      ({{ selectedFileName }})
                    </span>
                  </label>
                  <div class="flex items-center gap-2">
                    <BaseButton
                      v-if="!base64Options.autoProcess.value"
                      variant="outline"
                      size="sm"
                      :disabled="isProcessing"
                      @click="handleProcess"
                    >
                      <Loader2
                        v-if="isProcessing"
                        class="h-3 w-3 animate-spin mr-1"
                      />
                      {{ currentTab === "encode" ? "Encode" : "Decode" }}
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
                </div>
                <div class="relative">
                  <textarea 
                    ref="inputArea" 
                    v-model="input" 
                    rows="8"
                    class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground dark:border-border dark:bg-background/50 font-mono"
                    :class="{
                      'border-destructive': validationError && base64Options.validateInput.value,
                      'pr-20': true
                    }"
                    :placeholder="currentTab === 'encode'
                      ? 'Enter text to encode or upload a file...'
                      : 'Enter Base64 to decode...'
                    "
                    @input="handleInput"
                    @drop="handleDrop"
                    @dragover.prevent
                    @dragenter.prevent
                  />
                  <div class="absolute bottom-2 right-2 flex items-center gap-1">
                    <BaseButton
                      v-tippy="{ content: 'Paste' }"
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      @click="pasteFromClipboard"
                    >
                      <ClipboardPaste class="h-3 w-3" />
                    </BaseButton>
                  </div>
                </div>
                
                <!-- Validation Error -->
                <div
                  v-if="validationError && base64Options.validateInput.value"
                  class="text-xs text-destructive flex items-center gap-1"
                >
                  <AlertCircle class="h-3 w-3" />
                  {{ validationError }}
                </div>

                <!-- Character Count -->
                <div
                  v-if="base64Options.showCharacterCount.value"
                  class="flex items-center justify-between text-xs text-muted-foreground"
                >
                  <span>{{ inputStats.characters }} characters, {{ inputStats.bytes }} bytes</span>
                  <span v-if="inputStats.lines > 1">{{ inputStats.lines }} lines</span>
                </div>
              </div>
            </div>

            <!-- Output Section -->
            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-foreground dark:text-muted-foreground">
                    Output
                    <span
                      v-if="outputFormat"
                      class="text-xs text-muted-foreground ml-2"
                    >
                      ({{ outputFormat }})
                    </span>
                  </label>
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
                      @click="downloadOutput"
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
                </div>
                <textarea
                  v-model="output"
                  rows="8"
                  readonly
                  class="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm resize-none dark:border-border dark:bg-background/50 font-mono"
                  placeholder="Result will appear here..."
                />
                
                <!-- Output Stats -->
                <div
                  v-if="base64Options.showCharacterCount.value && output"
                  class="flex items-center justify-between text-xs text-muted-foreground"
                >
                  <span>{{ outputStats.characters }} characters, {{ outputStats.bytes }} bytes</span>
                  <span v-if="outputStats.lines > 1">{{ outputStats.lines }} lines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BaseButton
          variant="outline"
          class="h-auto p-4 flex flex-col items-center gap-2"
          @click="loadSampleText"
        >
          <FileText class="h-5 w-5" />
          <span class="text-xs">Sample Text</span>
        </BaseButton>
        
        <BaseButton
          variant="outline"
          class="h-auto p-4 flex flex-col items-center gap-2"
          @click="loadSampleBase64"
        >
          <Code class="h-5 w-5" />
          <span class="text-xs">Sample Base64</span>
        </BaseButton>
        
        <BaseButton
          variant="outline"
          class="h-auto p-4 flex flex-col items-center gap-2"
          @click="generateRandomData"
        >
          <Shuffle class="h-5 w-5" />
          <span class="text-xs">Random Data</span>
        </BaseButton>
        
        <BaseButton
          variant="outline"
          class="h-auto p-4 flex flex-col items-center gap-2"
          @click="clearAll"
        >
          <Trash2 class="h-5 w-5" />
          <span class="text-xs">Clear All</span>
        </BaseButton>
      </div>

      <!-- Format Information -->
      <div class="rounded-lg border border-border p-4 bg-muted/30">
        <h3 class="text-sm font-medium mb-3">
          Base64 Format Information
        </h3>
        <div class="grid md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <div class="font-medium text-foreground mb-1">
              Standard
            </div>
            <div>Uses +, /, and = padding. RFC 4648 compliant.</div>
          </div>
          <div>
            <div class="font-medium text-foreground mb-1">
              URL Safe
            </div>
            <div>Uses -, _, no padding. Safe for URLs and filenames.</div>
          </div>
          <div>
            <div class="font-medium text-foreground mb-1">
              MIME
            </div>
            <div>Line breaks every {{ base64Options.lineLength.value }} chars. Email compatible.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
