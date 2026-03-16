
<template>
  <BasePage
    title="JSON Editor"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] relative bg-background">

    <BaseFileDrop
      variant="overlay"
      :show="isDragActive"
      title="Drop JSON file"
      description="Release to load content into the editor"
      :icon="FileJson"
      @files="handleDrop" />

    <div class="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-4">

      <!-- Input Panel -->
      <Suspense>
        <JsonInputPanel
          :model-value="input"
          :indentation="indentation"
          :error="error"
          :stats="getStats"
          :disable-actions="!parsed || !!error"
          :is-processing="isProcessing"
          @update:model-value="setInput"
          @update:indentation="indentation = $event"
          @format="formatInput"
          @minify="minifyInput"
          @sample="loadSample"
          @clear="clear"
          @upload="handleFileUpload" />
        <template #fallback>
          <div class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden animate-pulse">
            <!-- Header Skeleton -->
            <div class="flex justify-between items-center h-[53px] px-2 border-b border-border bg-muted/30">
              <div class="flex items-center gap-1">
                <div class="size-8 bg-muted rounded"></div>
                <div class="size-8 bg-muted rounded"></div>
                <div class="size-8 bg-muted rounded"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-7 w-24 bg-muted rounded"></div>
                <div class="h-7 w-12 bg-muted rounded"></div>
              </div>
            </div>
            <!-- Editor Skeleton -->
            <div class="flex-1 min-h-0 bg-muted/5 flex">
              <div class="w-10 border-r border-border/50 bg-muted/10"></div>
              <div class="flex-1 p-4 space-y-2">
                <div class="h-4 w-3/4 bg-muted/20 rounded"></div>
                <div class="h-4 w-1/2 bg-muted/20 rounded"></div>
                <div class="h-4 w-5/6 bg-muted/20 rounded"></div>
              </div>
            </div>
            <!-- Footer Skeleton -->
            <div class="h-7 border-t border-border bg-muted/30 flex items-center px-3">
              <div class="h-3 w-16 bg-muted rounded"></div>
            </div>
          </div>
        </template>
      </Suspense>

      <!-- Output Panel -->
      <Suspense>
        <JsonOutputPanel
          v-model:view-mode="viewMode"
          :parsed="parsed"
          :input="input"
          :error="error"
          :type-script-output="typeScriptOutput"
          :xml-output="xmlOutput"
          :csv-output="csvOutput"
          @copy="copyResult"
          @download="downloadFile" />
        <template #fallback>
          <div class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden animate-pulse">
            <!-- Header Skeleton -->
            <div class="flex justify-between items-center h-[53px] px-2 border-b border-border bg-muted/30">
              <div class="h-8 w-64 bg-muted rounded"></div>
              <div class="flex gap-1">
                <div class="size-8 bg-muted rounded"></div>
                <div class="size-8 bg-muted rounded"></div>
              </div>
            </div>
            <!-- Content Skeleton -->
            <div class="flex-1 min-h-0 bg-muted/5 flex items-center justify-center">
              <div class="text-center">
                <div class="size-10 bg-muted/30 rounded mb-2 mx-auto"></div>
                <div class="h-4 w-32 bg-muted/30 rounded"></div>
              </div>
            </div>
            <!-- Footer Skeleton -->
            <div class="h-7 border-t border-border bg-muted/30"></div>
          </div>
        </template>
      </Suspense>

    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { FileJson } from 'lucide-vue-next'
import { BasePage, BaseFileDrop } from '@components/ui'
import { useJsonTool } from '../composables/useJsonTool'
import { useDragDrop } from '@composables/useDragDrop'
import { useKeyboardStore } from '@stores/keyboard'

const JsonInputPanel = defineAsyncComponent(() => import('../components/JsonInputPanel.vue'))
const JsonOutputPanel = defineAsyncComponent(() => import('../components/JsonOutputPanel.vue'))

const {
  input,
  setInput,
  parsed,
  error,
  viewMode,
  indentation,
  isProcessing,
  formatInput,
  minifyInput,
  typeScriptOutput,
  xmlOutput,
  csvOutput,
  copyResult,
  clear,
  loadSample,
  handleFileUpload,
  downloadFile
} = useJsonTool()

const { isDragActive } = useDragDrop()
const keyboard = useKeyboardStore()

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'JSON Editor' }]

const getStats = computed(() => {
  if (!parsed.value) return ''
  // Safe length check
  const len = input.value?.length || 0
  return len > 1024 * 1024 ?
    `${(len / (1024 * 1024)).toFixed(2)} MB` :
    `${(len / 1024).toFixed(2)} KB`
})

const handleDrop = (files: FileList) => {
  if (files.length > 0) {
    handleFileUpload(files[0])
  }
}

onMounted(() => {
  keyboard.pushContext('tools.json')
  keyboard.attachAllForContext('tools.json', {
    'Ctrl+Enter': formatInput,
    'Ctrl+Shift+Enter': minifyInput,
    'Ctrl+S': copyResult
  })
})

onUnmounted(() => {
  keyboard.popContext('tools.json')
})
</script>
