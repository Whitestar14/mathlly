
<template>
  <BasePage
    title="Base64 Converter"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] relative bg-background">

    <div class="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 flex flex-col gap-4 relative">

      <Transition name="scale-fade">
        <div
          v-if="isDragActive"
          class="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-primary/50 m-2 md:m-4">
          <BaseFileDrop
            variant="zone"
            class="h-full w-full border-none bg-transparent"
            title="Drop file to process"
            description="Auto-detects binary or text"
            :icon="UploadCloud"
            @files="handleGlobalDrop" />
        </div>
      </Transition>

      <!-- Top Control Bar -->
      <div class="flex flex-row justify-between items-center gap-3 px-1 flex-shrink-0">
        <!-- Spacer to push controls to right if needed, or hold secondary toggles -->
        <div class="w-auto">
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar justify-end">
          <div class="w-40 shrink-0">
            <SelectBar
              :model-value="tool.options.value.outputFormat"
              :options="[
                { value: 'standard', label: 'Standard' },
                { value: 'url-safe', label: 'URL Safe' },
                { value: 'mime', label: 'MIME' }
              ]"
              size="sm"
              @update:model-value="tool.options.value.outputFormat = $event" />
          </div>

          <div class="h-8 w-px bg-border shrink-0"></div>

          <BaseButton v-tippy="'Sample Text'" variant="outline" size="icon" class="size-9 shrink-0" @click="tool.handleSample('text')">
            <FileText class="size-4" />
          </BaseButton>
          <BaseButton v-tippy="'Sample Image'" variant="outline" size="icon" class="size-9 shrink-0" @click="tool.handleSample('base64')">
            <ImageIcon class="size-4" />
          </BaseButton>
          <BaseButton v-tippy="'Random Data'" variant="outline" size="icon" class="size-9 shrink-0" @click="tool.handleRandomData()">
            <Shuffle class="size-4" />
          </BaseButton>
        </div>
      </div>

      <div class="flex-1 min-h-0 relative">
        <Transition name="panel-switch" mode="out-in">
          <div v-if="tool" :key="tool.currentTab.value" class="h-full grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-4">

            <!-- Input Panel -->
            <Base64InputPanel
              :model-value="tool.input.value"
              :mode="tool.currentTab.value"
              :input-mode="tool.inputMode.value"
              :file-details="tool.fileDetails.value"
              :auto-process="tool.options.value.autoProcess"
              :show-stats="tool.options.value.showCharacterCount"
              :stats="tool.ops.inputStats.value"
              :is-processing="tool.isProcessing.value"
              @update:model-value="tool.setInput"
              @upload="tool.processFiles"
              @process="tool.triggerProcess"
              @clear="tool.handleClear" />

            <!-- Output Panel -->
            <Base64OutputPanel
              :model-value="tool.ops.output.value"
              :format-label="outputFormatLabel"
              :show-stats="tool.options.value.showCharacterCount"
              :stats="tool.ops.outputStats.value"
              :error="tool.outputValidationError.value"
              :preview-url="tool.activePreviewUrl.value"
              :preview-info="previewInfo"
              @copy="copyOutput"
              @download="downloadOutput"
              @swap="tool.handleSwap" />
          </div>

          <div v-else class="h-full grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-4 animate-pulse">
            <!-- Skeleton Input -->
            <div class="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
              <div class="flex items-center justify-between p-2 border-b border-border h-[53px] bg-muted/30">
                <div class="h-4 w-20 bg-muted rounded"></div>
                <div class="flex gap-1">
                  <div class="size-8 bg-muted rounded"></div>
                  <div class="size-8 bg-muted rounded"></div>
                  <div class="size-8 bg-muted rounded"></div>
                </div>
              </div>
              <div class="flex-1 bg-muted/5"></div>
              <div class="h-7 border-t border-border bg-muted/30 flex items-center justify-between px-3">
                <div class="h-3 w-16 bg-muted rounded"></div>
                <div class="h-3 w-24 bg-muted rounded"></div>
              </div>
            </div>

            <!-- Skeleton Output -->
            <div class="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
              <div class="flex items-center justify-between p-2 border-b border-border h-[53px] bg-muted/30">
                <div class="h-4 w-20 bg-muted rounded"></div>
                <div class="flex gap-1">
                  <div class="size-8 bg-muted rounded"></div>
                  <div class="size-8 bg-muted rounded"></div>
                </div>
              </div>
              <div class="flex-1 bg-muted/5"></div>
              <div class="h-7 border-t border-border bg-muted/30 flex items-center justify-between px-3">
                <div class="h-3 w-16 bg-muted rounded"></div>
                <div class="h-3 w-24 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { UploadCloud, FileText, Shuffle, Image as ImageIcon } from 'lucide-vue-next'
import { BasePage, BaseButton, BaseFileDrop, SelectBar } from '@components/ui'
import { useBase64Tool } from '../composables/useBase64Tool'
import { useDragDrop } from '@composables/useDragDrop'
import { useKeyboardStore } from '@stores/keyboard'

const Base64InputPanel = defineAsyncComponent(() => import('../components/Base64InputPanel.vue'))
const Base64OutputPanel = defineAsyncComponent(() => import('../components/Base64OutputPanel.vue'))

const tool = useBase64Tool()
const { isDragActive, resetDragState } = useDragDrop()
const keyboard = useKeyboardStore()

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'Base64 Converter' }]

const outputFormatLabel = computed(() => {
  const map: Record<string, string> = { 'url-safe': 'URL Safe', 'mime': 'MIME', 'standard': 'Standard' }
  return map[tool.options.value.outputFormat] || 'Standard'
})

const previewInfo = computed(() => {
  const result = tool.ops.processState.value
  if (result.success && result.isBinary) {
    const size = result.binary ? `${(result.binary.byteLength / 1024).toFixed(2)} KB` : '?? KB'
    return { mime: result.mime || 'Unknown', size, isBinary: true }
  }
  return null
})

const handleGlobalDrop = (files: FileList) => {
  resetDragState()
  tool.processFiles(files)
}

const copyOutput = async() => {
  if (tool.ops.output.value) {
    await tool.copy(tool.ops.output.value)
    tool.toast('Copied to clipboard', { type: 'success' })
  }
}

const downloadOutput = () => {
  tool.downloadOutput()
}

const handleProcess = async() => tool.triggerProcess()

const handlePasteShortcut = async() => {
  try {
    const text = await navigator.clipboard.readText()
    tool.setInput(text)
    tool.toast('Pasted!', { type: 'success' })
  } catch(err) {
    console.warn('Clipboard read failed:', err)
    tool.toast('Failed to read clipboard', { type: 'error' })
  }
}
onMounted(() => {
  keyboard.pushContext('tools.base64')
  keyboard.attachAllForContext('tools.base64', {
    'Ctrl+Enter': handleProcess,
    'Ctrl+V': handlePasteShortcut,
    'Ctrl+C': copyOutput,
    'Ctrl+S': tool.handleSwap,
    'Escape': tool.handleClear
  })
})

onUnmounted(() => {
  keyboard.popContext('tools.base64')
})
</script>

<style scoped>
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.2s ease-out;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.panel-switch-enter-active,
.panel-switch-leave-active {
  transition: all 0.15s ease-out;
}
.panel-switch-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(5px);
}
.panel-switch-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-5px);
}
</style>
