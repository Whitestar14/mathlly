<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Copy, ArrowDownUp, Download, X, Loader2, FileIcon, EyeIcon, FileTextIcon } from 'lucide-vue-next'
import { useKeyboardStore } from '@stores/keyboard'

// Components
import Base64Actions from '../components/Base64Actions.vue'
import TextPanel from '../components/TextPanel.vue'
import FileUpload from '../components/FileUpload.vue'
import FileProcessingOverlay from '../components/FileProcessingOverlay.vue'
import { BaseButton, BaseTabs, BasePage, BaseCard } from '@components/ui'
import { type Tab } from '../types/base64'
import type { BreadcrumbItem } from '@components/ui/BasePage.vue'

// The new unified composable
import { useBase64Tool } from '../composables/useBase64Tool'

const keyboard = useKeyboardStore()
const tool = useBase64Tool()

const tabs: Tab[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' }
]

// UI Refs (must remain in component for DOM access)
const tabsRef = ref<InstanceType<typeof BaseTabs> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const inputArea = ref<HTMLTextAreaElement | null>(null)
const showPreview = ref(true)

// Computed helpers for View
const outputFormatLabel = computed(() => {
  const map: Record<string, string> = { 'url-safe': 'URL Safe', 'mime': 'MIME' }
  return map[tool.options.value.outputFormat] || 'Standard'
})

const previewInfo = computed(() => {
  const result = tool.ops.processState.value
  if (result.success && result.isBinary) {
    const size = result.binary ? `${(result.binary.byteLength / 1024).toFixed(2)} KB` : 'Unknown size'
    return { mime: result.mime || 'Unknown Type', size }
  }
  return null
})

// Tab Switch Handler (UI Focus logic stays in view)
const handleTabChange = (tabValue: string) => {
  tool.currentTab.value = tabValue as 'encode' | 'decode'
  nextTick(() => inputArea.value?.focus())
}

const handleProcess = async () => {
  await tool.ops.processInput(tool.currentTab.value)
}

const handleDropWrapper = (event: DragEvent) => {
  tool.onDrop(event, fileInputRef)
}

const triggerUiFilePicker = () => {
  fileInputRef.value?.click()
}

const handleUiPaste = async () => {
  try {
    // Check if clipboard API is supported
    if (!navigator.clipboard) {
      tool.toast('Clipboard API not supported', { type: 'error' })
      return
    }
    const text = await navigator.clipboard.readText()
    tool.input.value = text
    tool.handleInput() // trigger debounce processing
    tool.toast('Pasted from clipboard!', { type: 'success'})
  } catch (err) {
    console.error(err)
    tool.toast('Failed to read clipboard', { type: 'error' })
  }
}

// Keyboard shortcuts
onMounted(() => {
  keyboard.attachAllForContext('tools.base64', {
    'Ctrl+Enter': handleProcess,
    'Ctrl+V': async () => {
       const text = await navigator.clipboard.readText()
       tool.input.value = text
       tool.handleInput() // trigger debounce
       tool.toast('Pasted!', { type: 'success'})
    },
    'Ctrl+C': async () => tool.ops.output.value && (await tool.copy(tool.ops.output.value)) && tool.toast('Copied!', { type: 'success' }),
    'Ctrl+S': tool.handleSwap
  })
  keyboard.pushContext('tools.base64')
  nextTick(() => tabsRef.value?.initializePills(tool.currentTab.value))
})

onUnmounted(() => {
  keyboard.popContext('tools.base64')
})

const breadcrumbs: BreadcrumbItem[] = [{ label: 'Tools', path: '/' }, { label: 'Base64' }]
</script>

<template>
  <BasePage
    title="Base64"
    :main-class="'flex'"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true">
    <div class="container mx-auto p-2 md:p-3">
      <div class="max-w-6xl mx-auto space-y-3">
        <div class="rounded-lg border border-border dark:border-border overflow-hidden">
          
          <BaseTabs
            ref="tabsRef"
            v-model:model-value="tool.currentTab.value"
            :tabs="tabs"
            @tab-change="handleTabChange">
            <template #actions>
              <Base64Actions
                :options="tool.options.value"
                :load-sample-text="() => tool.handleSample('text')"
                :load-sample-base64="() => tool.handleSample('base64')"
                :generate-random-data="() => { tool.input.value = 'Random...'; tool.selectedFileName.value = ''; }"
                :clear-all="tool.handleClear"
                :trigger-file-picker="triggerUiFilePicker" />
            </template>
          </BaseTabs>

          <div class="p-3 md:p-6 bg-card">
            <!-- Hidden File Input -->
            <input
              ref="fileInputRef"
              type="file"
              class="hidden"
              @change="tool.onFileUpload" />
            
            <FileProcessingOverlay :open="tool.isFileProcessing.value" />

            <div class="relative">
              <!-- Drag Overlay -->
              <div
                v-if="tool.fileUI.isDragActive.value"
                class="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto bg-background/80 backdrop-blur-sm rounded-lg">
                <Transition name="fade-scale" appear>
                  <FileUpload
                    :handle-binary-files="true"
                    :current-tab="tool.currentTab.value"
                    class="w-full max-w-4/5 mx-auto"
                    @file-upload="tool.onFileUpload"
                    @drop="handleDropWrapper" />
                </Transition>
              </div>

              <!-- Main Grid -->
              <div
                :class="{ invisible: tool.fileUI.isDragActive.value }"
                class="grid gap-2 md:gap-3 lg:grid-cols-2">

                <!-- Input Panel -->
                <BaseCard class="border-none">
                  <TextPanel
                    ref="inputArea"
                    v-model="tool.input.value"
                    :label="tool.selectedFileName.value ? `Input (${tool.selectedFileName.value})` : 'Input'"
                    :placeholder="tool.currentTab.value === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'"
                    :stats="tool.ops.inputStats.value"
                    :show-stats="tool.options.value.showCharacterCount"
                    :validation-error="tool.ops.validationError.value"
                    :show-paste-button="true"
                    @input="tool.handleInput"
                    @drop="handleDropWrapper"
                    @paste="handleUiPaste">
                    <template #actions>
                      <div class="flex items-center gap-2">
                        <BaseButton
                          v-if="!tool.options.value.autoProcess"
                          variant="outline"
                          size="sm"
                          :disabled="tool.ops.isProcessing.value"
                          @click="handleProcess">
                          <Loader2 v-if="tool.ops.isProcessing.value" class="h-3 w-3 animate-spin mr-1" />
                          {{ tool.currentTab.value === 'encode' ? 'Encode' : 'Decode' }}
                        </BaseButton>

                        <BaseButton
                          v-if="tool.input.value"
                          variant="ghost"
                          class="h-6 w-6"
                          size="icon"
                          @click="tool.input.value = ''; tool.selectedFileName.value = ''">
                          <X class="h-3 w-3" />
                        </BaseButton>
                      </div>
                    </template>
                  </TextPanel>
                </BaseCard>

                <!-- Output Panel -->
                <BaseCard class="border-none">
                  <div class="space-y-3 h-full flex flex-col">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-foreground dark:text-muted-foreground">
                        Output ({{ outputFormatLabel }})
                      </span>
                      
                      <div class="flex items-center gap-2">
                         <BaseButton
                           v-if="tool.activePreviewUrl.value || previewInfo"
                           v-tippy="{ content: showPreview ? 'Show Text' : 'Show Preview' }"
                           variant="ghost"
                           size="icon"
                           class="h-6 w-6"
                           @click="showPreview = !showPreview">
                           <component :is="showPreview ? FileTextIcon : EyeIcon" class="h-3 w-3" />
                         </BaseButton>
                         
                         <div v-if="tool.activePreviewUrl.value || previewInfo" class="h-4 w-px bg-border mx-1"></div>

                        <BaseButton
                          v-tippy="{ content: 'Swap' }"
                          variant="ghost"
                          size="icon"
                          class="h-6 w-6"
                          :disabled="!tool.ops.output.value"
                          @click="tool.handleSwap">
                          <ArrowDownUp class="h-3 w-3" />
                        </BaseButton>

                        <BaseButton
                          v-tippy="{ content: 'Download' }"
                          variant="ghost"
                          size="icon"
                          class="h-6 w-6"
                          :disabled="!tool.ops.output.value && !tool.ops.processState.value.binary"
                          @click="tool.fileOps.downloadOutput(tool.ops.output.value, tool.currentTab.value, tool.ops.processState.value)">
                          <Download class="h-3 w-3" />
                        </BaseButton>

                        <BaseButton
                          v-tippy="{ content: 'Copy' }"
                          variant="ghost"
                          size="icon"
                          class="h-6 w-6"
                          :disabled="!tool.ops.output.value"
                          @click="async () => { await tool.copy(tool.ops.output.value); tool.toast('Copied!', {type:'success'}); }">
                          <Copy class="h-3 w-3" />
                        </BaseButton>
                      </div>
                    </div>
                    
                    <div class="relative flex-1">
                      <!-- File Preview -->
                      <template v-if="showPreview && (tool.activePreviewUrl.value || previewInfo)">
                         <div class="w-full h-full min-h-[192px] rounded-md border border-border bg-background p-4 flex flex-col items-center justify-center gap-4">
                            <img 
                              v-if="tool.activePreviewUrl.value && previewInfo?.mime.startsWith('image/')" 
                              :src="tool.activePreviewUrl.value" 
                              class="max-h-48 max-w-full object-contain rounded border border-border/50 bg-checkerboard" 
                            />
                            <iframe 
                              v-else-if="tool.activePreviewUrl.value && previewInfo?.mime === 'application/pdf'" 
                              :src="tool.activePreviewUrl.value" 
                              class="w-full h-full min-h-[250px] border border-border rounded" 
                              title="PDF Preview">
                            </iframe>
                            <div v-else class="flex flex-col items-center text-muted-foreground">
                               <FileIcon class="h-12 w-12 mb-2 opacity-50" />
                               <span class="text-sm font-medium">Binary Data</span>
                            </div>
                            <div class="text-xs text-muted-foreground text-center">
                               <p class="font-medium text-foreground">{{ previewInfo?.mime }}</p>
                               <p>{{ previewInfo?.size }}</p>
                            </div>
                         </div>
                      </template>
                      
                      <!-- Text Output -->
                      <textarea
                        v-show="!showPreview || (!tool.activePreviewUrl.value && !previewInfo)"
                        :value="tool.ops.output.value"
                        readonly
                        class="w-full h-full min-h-[192px] rounded-md border border-border bg-background px-3 py-2 text-sm resize-none font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        :class="{ 'border-destructive/50 bg-destructive/10': tool.outputValidationError.value }"
                        placeholder="Result will appear here..."></textarea>
                    </div>

                    <div v-if="tool.outputValidationError.value" class="text-xs text-destructive flex items-center gap-1">
                      {{ tool.outputValidationError.value }}
                    </div>

                    <div
                      v-if="tool.options.value.showCharacterCount && !!tool.ops.output.value"
                      class="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{{ tool.ops.outputStats.value.characters }} characters, {{ tool.ops.outputStats.value.bytes }} bytes</span>
                      <span v-if="tool.ops.outputStats.value.lines > 1">{{ tool.ops.outputStats.value.lines }} lines</span>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>