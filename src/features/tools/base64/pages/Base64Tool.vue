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
                :generate-random-data="() => { tool.input.value = 'Random...'; tool.selectedFileName.value = '' }"
                :clear-all="tool.handleClear" 
                :trigger-file-picker="triggerUiFilePicker" 
              />
            </template>
          </BaseTabs>

          <div class="p-3 md:p-6 bg-card">
            <!-- Hidden Native Input -->
            <input 
              ref="fileInputRef" 
              type="file" 
              class="hidden" 
              @change="onNativeInputChange" 
            />

            <FileProcessingOverlay :open="tool.isFileProcessing.value" />

            <!-- 
               CONTAINER: Relative positioning allows the drop zone to overlay 
               the grid without shifting layout. 
            -->
            <div class="relative min-h-[400px]">
              
              <!-- 
                 DROP OVERLAY 
                 Only visible when dragging. Covers the entire grid.
              -->
              <Transition name="fade">
                <div 
                  v-if="isDragActive"
                  class="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-[2px] rounded-lg border-2 border-dashed border-primary/50"
                >
                  <BaseFileDrop
                    variant="zone"
                    class="h-full w-full border-none bg-transparent"
                    title="Drop file to process"
                    description="Supports Encode & Decode mode"
                    :icon="UploadCloud"
                    @files="handleDropFiles"
                  />
                </div>
              </Transition>

              <!-- MAIN GRID (Input/Output) -->
              <div class="grid gap-2 md:gap-3 lg:grid-cols-2 h-full">
                <!-- Input Panel -->
                <BaseCard class="border-none h-full">
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
                    @paste="handleUiPaste">
                    
                    <template #actions>
                      <div class="flex items-center gap-2">
                        <BaseButton 
                          v-if="!tool.options.value.autoProcess" 
                          variant="outline"
                          :disabled="tool.ops.isProcessing.value" 
                          @click="handleProcess">
                          <Loader2 v-if="tool.ops.isProcessing.value" class="size-4 animate-spin" />
                          {{ tool.currentTab.value === 'encode' ? 'Encode' : 'Decode' }}
                        </BaseButton>

                        <BaseButton 
                          v-if="tool.input.value" 
                          variant="ghost"
                          class="size-8 hover:bg-destructive/10 hover:text-destructive"
                          size="icon" 
                          @click="tool.handleClear">
                          <X class="size-4" />
                        </BaseButton>
                      </div>
                    </template>
                  </TextPanel>
                </BaseCard>

                <!-- Output Panel -->
                <BaseCard class="border-none h-full">
                  <TextPanel 
                    :model-value="tool.ops.output.value"
                    :label="`Output (${outputFormatLabel})`"
                    :placeholder="'Result will appear here...'" 
                    :stats="tool.ops.outputStats.value"
                    :show-stats="tool.options.value.showCharacterCount"
                    :validation-error="tool.outputValidationError.value" 
                    :read-only="true">
                    
                    <template #actions>
                      <div class="flex items-center gap-2">
                        <BaseButton 
                          v-if="tool.activePreviewUrl.value || previewInfo"
                          v-tippy="{ content: showPreview ? 'Show Text' : 'Show Preview' }"
                          variant="ghost" size="icon" class="size-8"
                          @click="showPreview = !showPreview">
                          <component :is="showPreview ? FileTextIcon : EyeIcon" class="h-4" />
                        </BaseButton>

                        <div v-if="tool.activePreviewUrl.value || previewInfo" class="h-4 w-px bg-border mx-1"></div>

                        <BaseButton 
                          v-tippy="{ content: 'Swap' }" 
                          variant="ghost" size="icon" class="size-8" 
                          :disabled="!tool.ops.output.value"
                          @click="tool.handleSwap">
                          <ArrowDownUp class="size-4" />
                        </BaseButton>

                        <BaseButton 
                          v-tippy="{ content: 'Download' }" 
                          variant="ghost" size="icon" class="size-8"
                          :disabled="!tool.ops.output.value && !tool.ops.processState.value.binary"
                          @click="tool.fileOps.downloadOutput(tool.ops.output.value, tool.currentTab.value, tool.ops.processState.value)">
                          <Download class="size-4" />
                        </BaseButton>

                        <BaseButton 
                          v-tippy="{ content: 'Copy' }" 
                          variant="ghost" size="icon" class="size-8" 
                          :disabled="!tool.ops.output.value"
                          @click="async () => { await tool.copy(tool.ops.output.value); tool.toast('Copied!', { type: 'success' }) }">
                          <Copy class="size-4" />
                        </BaseButton>
                      </div>
                    </template>
                    
                    <template #content>
                      <div class="relative flex-1">
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

                        <textarea
                          v-show="!showPreview || (!tool.activePreviewUrl.value && !previewInfo)"
                          :value="tool.ops.output.value" 
                          readonly
                          class="w-full h-full min-h-[192px] rounded-md border border-border bg-background px-3 py-2 text-sm resize-none font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                          :class="{ 'border-destructive/50 bg-destructive/10': tool.outputValidationError.value }"
                          placeholder="Result will appear here...">
                        </textarea>
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

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Copy, ArrowDownUp, Download, X, Loader2, FileIcon, EyeIcon, FileTextIcon, UploadCloud } from 'lucide-vue-next'
import { useKeyboardStore } from '@stores/keyboard'
import { BaseButton, BaseTabs, BasePage, BaseCard, BaseFileDrop } from '@components/ui'
import { useBase64Tool } from '../composables/useBase64Tool'
import { useDragDrop } from '@composables/useDragDrop'

import Base64Actions from '../components/Base64Actions.vue'
import TextPanel from '../components/TextPanel.vue'
import FileProcessingOverlay from '../components/FileProcessingOverlay.vue'
import type { Tab } from '../types/base64'
import type { BreadcrumbItem } from '@components/ui/BasePage.vue'

const keyboard = useKeyboardStore()
const tool = useBase64Tool()

const { isDragActive } = useDragDrop()

const tabs: Tab[] = [
    { value: 'encode', label: 'Encode' },
    { value: 'decode', label: 'Decode' }
]

const tabsRef = ref<InstanceType<typeof BaseTabs> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const inputArea = ref<HTMLTextAreaElement | null>(null)
const showPreview = ref(true)

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

const handleTabChange = (tabValue: string) => {
    tool.currentTab.value = tabValue as 'encode' | 'decode'
    nextTick(() => inputArea.value?.focus())
}

const handleProcess = async () => {
    await tool.ops.processInput(tool.currentTab.value)
}

const triggerUiFilePicker = () => {
    fileInputRef.value?.click()
}

const onNativeInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files) tool.processFiles(target.files)
    target.value = ''
}

const handleDropFiles = (files: FileList) => {
    isDragActive.value = false 
    tool.processFiles(files)
}

const handleUiPaste = async () => {
    try {
        if (!navigator.clipboard) return
        const text = await navigator.clipboard.readText()
        tool.input.value = text
        tool.handleInput()
        tool.toast('Pasted from clipboard!', { type: 'success' })
    } catch (err) {
        tool.toast('Failed to read clipboard', { type: 'error' })
    }
}

onMounted(() => {
    keyboard.attachAllForContext('tools.base64', {
        'Ctrl+Enter': handleProcess,
        'Ctrl+V': handleUiPaste,
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

<style scoped>
/* Smooth fade for the overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>