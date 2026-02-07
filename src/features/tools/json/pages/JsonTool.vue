<template>
  <BasePage
    title="JSON Editor"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] relative bg-background">
    
    <JsonFileOverlay 
      :active="isDragActive"
      @file-dropped="handleDrop"
    />

    <!-- Using flex-1 to fill the page, p-4 to give breathing room -->
    <div class="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      
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
          @upload="handleFileUpload"
        />
        <template #fallback>
          <div class="flex flex-col h-full min-h-0 gap-2 animate-pulse">
            <!-- Header Skeleton -->
            <div class="flex justify-between items-center h-9 px-1 flex-shrink-0">
              <div class="h-4 w-20 bg-muted/40 rounded"></div>
              <div class="flex items-center gap-1">
                <div class="size-8 bg-muted/40 rounded"></div>
                <div class="size-8 bg-muted/40 rounded"></div>
                <div class="size-8 bg-muted/40 rounded"></div>
                <div class="w-px h-4 bg-border/50 mx-1"></div>
                <div class="size-8 bg-muted/40 rounded"></div>
                <div class="size-8 bg-muted/40 rounded"></div>
              </div>
            </div>
            <!-- Editor Skeleton -->
            <div class="flex-1 min-h-0 border border-border/40 rounded-lg bg-muted/5"></div>
            <!-- Toolbar Skeleton -->
            <div class="flex items-center justify-between gap-2 p-1.5 bg-card border border-border/40 rounded-lg flex-shrink-0 h-[46px]">
               <div class="w-32 h-8 bg-muted/40 rounded"></div>
               <div class="flex gap-2">
                 <div class="h-8 w-16 bg-muted/40 rounded"></div>
                 <div class="h-8 w-16 bg-muted/40 rounded"></div>
               </div>
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
          @download="downloadFile"
        />
        <template #fallback>
          <div class="flex flex-col h-full min-h-0 gap-2 animate-pulse">
            <!-- Header Skeleton -->
            <div class="flex flex-col sm:flex-row justify-between sm:items-center h-auto sm:h-9 gap-2 flex-shrink-0">
              <div class="w-full sm:max-w-xs h-8 bg-muted/40 rounded"></div>
              <div class="flex items-center gap-1 self-end sm:self-auto">
                 <div class="size-8 bg-muted/40 rounded"></div>
                 <div class="h-8 w-16 bg-muted/40 rounded"></div>
              </div>
            </div>
            <!-- Content Skeleton -->
            <div class="flex-1 min-h-0 border border-border/40 rounded-lg bg-muted/5"></div>
          </div>
        </template>
      </Suspense>

    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { BasePage } from '@components/ui'
import { useJsonTool } from '../composables/useJsonTool'
import { useJsonFileUI } from '../composables/useJsonFileUI'
import { useKeyboardStore } from '@stores/keyboard'
import JsonFileOverlay from '../components/JsonFileOverlay.vue'

const JsonInputPanel = defineAsyncComponent(() => import('../components/JsonInputPanel.vue'))
const JsonOutputPanel = defineAsyncComponent(() => import('../components/JsonOutputPanel.vue'))

const { 
  input, 
  setInput, // Import the setter!
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

const { isDragActive } = useJsonFileUI()
const keyboard = useKeyboardStore()

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'JSON Editor' }]

const getStats = computed(() => {
    if (!parsed.value) return ''
    const size = new TextEncoder().encode(input.value).length
    return `${(size / 1024).toFixed(2)} KB`
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