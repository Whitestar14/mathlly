<template>
  <div class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden shadow-sm">
    
    <!-- HEADER / TOOLBAR -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px]">
      
      <!-- Control Wrapper: Allows shrinking -->
      <div class="w-full sm:flex-1 sm:min-w-0 mr-4" :class="{ 'opacity-50 pointer-events-none': !!error }">
        <SegmentedControl
          :model-value="viewMode"
          :options="viewOptions"
          class="w-full max-w-full"
          @update:model-value="$emit('update:viewMode', $event as ViewMode)" 
        />
      </div>
      
      <!-- Actions -->
      <div class="flex items-center gap-1 shrink-0">
        <BaseButton v-tippy="'Copy Content'" variant="ghost" size="icon" class="size-8" :disabled="!hasData" @click="$emit('copy')">
          <Copy class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Download File'" variant="ghost" size="icon" class="size-8" :disabled="!hasData" @click="$emit('download')">
          <Download class="size-4 text-muted-foreground" />
        </BaseButton>
      </div>
    </div>

    <!-- CONTENT AREA -->
    <div class="flex-1 min-h-0 relative flex flex-col bg-background">
      
      <!-- Empty State -->
      <div v-if="!hasData && !error" class="absolute inset-0 flex flex-col gap-2 items-center justify-center text-muted-foreground/40 z-10">
        <FileJson class="size-10 opacity-20" />
        <span class="text-sm font-medium">Result will appear here</span>
      </div>

      <!-- Tree View -->
      <div v-if="viewMode === 'tree' && parsed" class="h-full overflow-auto p-4 custom-scrollbar">
        <JsonTreeItem :value="parsed" :is-last="true" :depth="0" />
      </div>

      <!-- Code Views -->
      <div v-else-if="currentTextContent !== null" class="h-full flex overflow-hidden">
        <div ref="linesRef" class="hidden md:block w-10 flex-shrink-0 bg-muted/10 border-r border-border text-right py-4 pr-2 font-mono text-xs text-muted-foreground/50 select-none overflow-hidden leading-6">
          <div v-for="n in getLineCount(currentTextContent)" :key="n">{{ n }}</div>
        </div>
        <textarea
          ref="textareaRef"
          readonly
          class="flex-1 h-full p-4 resize-none bg-transparent outline-none font-mono text-xs md:text-sm leading-6 whitespace-pre w-full"
          :class="getTextColorClass"
          :value="currentTextContent"
          @scroll="syncScroll">
        </textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Copy, Code2, FileJson, FileType, Table, FileCode, Download } from 'lucide-vue-next'
import { BaseButton, SegmentedControl } from '@components/ui'
import JsonTreeItem from './JsonTreeItem.vue'
import type { ViewMode, ParseError } from '../composables/useJsonTool'

import { useDeviceStore } from "@stores/device"

const device = useDeviceStore();

const props = defineProps<{
  viewMode: ViewMode
  parsed: any
  input: string
  typeScriptOutput: string
  xmlOutput: string
  csvOutput: string
  error: ParseError | null
}>()

const emit = defineEmits<{
  (e: 'update:viewMode', value: ViewMode): void
  (e: 'copy'): void
  (e: 'download'): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const linesRef = ref<HTMLElement | null>(null)

const viewOptions = [
  { value: 'tree', label: 'Tree', icon: Code2 },
  { value: 'code', label: 'JSON', icon: FileJson },
  { value: 'typescript', label: 'TS', icon: FileCode },
  { value: 'xml', label: 'XML', icon: FileType },
  { value: 'csv', label: 'CSV', icon: Table }
]

const hasData = computed(() => props.parsed !== null)

const currentTextContent = computed(() => {
  switch (props.viewMode) {
    case 'code': return props.input
    case 'typescript': return props.typeScriptOutput
    case 'xml': return props.xmlOutput
    case 'csv': return props.csvOutput
    default: return null
  }
})

const getTextColorClass = computed(() => {
  switch (props.viewMode) {
    case 'typescript': return 'text-blue-600 dark:text-blue-400'
    case 'xml': return 'text-orange-600 dark:text-orange-400'
    case 'csv': return 'text-emerald-600 dark:text-emerald-400'
    default: return 'text-muted-foreground'
  }
})

const getLineCount = (text: string) => text.split('\n').length

const syncScroll = () => {
  if (textareaRef.value && linesRef.value) {
    linesRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

// Reset scroll on view change
watch(() => props.viewMode, () => {
  if (textareaRef.value) textareaRef.value.scrollTop = 0
  if (linesRef.value) linesRef.value.scrollTop = 0
})
</script>