<template>
  <BasePage
    title="JSON Editor"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
    
    <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full w-full max-w-[1920px] mx-auto p-2 md:p-4">
      
      <!-- Input Panel -->
      <JsonInputPanel
        v-model="input"
        v-model:indentation="indentation"
        :error="error"
        :stats="getStats"
        :disable-actions="!parsed || !!error"
        @process="parseJson"
        @format="formatInput"
        @minify="minifyInput"
        @sample="loadSample"
        @clear="clear"
      />

      <!-- Output Panel -->
      <JsonOutputPanel
        v-model:view-mode="viewMode"
        :parsed="parsed"
        :input="input"
        :error="error"
        :type-script-output="typeScriptOutput"
        :xml-output="xmlOutput"
        :csv-output="csvOutput"
        @copy="copyResult"
      />

    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { BasePage } from '@components/ui'
import { useJsonTool } from '../composables/useJsonTool'
import { useKeyboardStore } from '@stores/keyboard'

// Async Components for performance
const JsonInputPanel = defineAsyncComponent(() => import('../components/JsonInputPanel.vue'))
const JsonOutputPanel = defineAsyncComponent(() => import('../components/JsonOutputPanel.vue'))

const { 
    input, 
    parsed, 
    error, 
    viewMode, 
    indentation,
    parseJson, 
    formatInput, 
    minifyInput, 
    typeScriptOutput,
    xmlOutput,
    csvOutput,
    copyResult, 
    clear, 
    loadSample 
} = useJsonTool()

const keyboard = useKeyboardStore()

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'JSON Editor' }]

const getStats = computed(() => {
    if (!parsed.value) return ''
    const size = new TextEncoder().encode(input.value).length
    return `${(size / 1024).toFixed(2)} KB`
})

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
