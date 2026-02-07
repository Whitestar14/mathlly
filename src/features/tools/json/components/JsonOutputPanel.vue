
<template>
  <div class="flex flex-col h-full min-h-0 gap-2">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2 flex-shrink-0 min-h-[36px]">
      <div class="w-full sm:max-w-sm">
        <SegmentedControl
          :model-value="viewMode"
          :options="viewOptions"
          :disable-overflow="true"
          @update:model-value="$emit('update:viewMode', $event as ViewMode)" />
      </div>
      <BaseButton
        variant="ghost"
        size="sm"
        class="ml-auto sm:ml-0"
        :disabled="!hasData"
        @click="$emit('copy')">
        <Copy class="size-4 mr-1.5" /> Copy
      </BaseButton>
    </div>

    <!-- Content -->
    <div class="flex-1 min-h-0 border border-border rounded-lg bg-card overflow-hidden relative flex flex-col">
      <div
        v-if="!hasData && !error"
        class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm z-10 bg-background/50 backdrop-blur-[1px]">
        Waiting for valid JSON...
      </div>

      <!-- Tree View -->
      <div
        v-if="viewMode === 'tree' && parsed"
        class="h-full overflow-auto p-4 custom-scrollbar bg-background">
        <JsonTreeItem
          :value="parsed"
          :is-last="true"
          :depth="0" />
      </div>

      <!-- Code Views (JSON, TS, XML, CSV) -->
      <div
        v-else-if="currentTextContent !== null"
        class="h-full flex overflow-hidden bg-background">
        <div
          ref="linesRef"
          class="hidden md:block w-10 flex-shrink-0 bg-muted/30 border-r border-border text-right pr-2 pt-4 font-mono text-xs text-muted-foreground select-none overflow-hidden leading-6">
          <div
            v-for="n in getLineCount(currentTextContent)"
            :key="n">
            {{ n }}
          </div>
        </div>
        <textarea
          ref="textareaRef"
          readonly
          class="flex-1 h-full p-4 resize-none bg-transparent outline-none font-mono text-xs md:text-sm leading-6 whitespace-pre w-full"
          :class="getTextColorClass"
          :value="currentTextContent"
          @scroll="syncScroll"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Copy, Code2, FileJson, FileType, Table, FileCode } from 'lucide-vue-next'
import { BaseButton, SegmentedControl } from '@components/ui'
import JsonTreeItem from './JsonTreeItem.vue'
import type { ViewMode, ParseError } from '../composables/useJsonTool'

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
    case 'csv': return 'text-green-600 dark:text-green-400'
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: oklch(var(--color-muted-foreground) / 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: oklch(var(--color-muted-foreground) / 0.5);
}
</style>
