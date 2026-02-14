<template>
  <BaseEditor
    :model-value="currentTextContent || ''"
    :readonly="true"
    :show-line-numbers="true"
    :error="error"
    :textarea-class="getTextColorClass">
    <template #toolbar>
      <!-- Control Wrapper -->
      <div class="flex-1 min-w-0 mr-2 sm:mr-4" :class="{ 'opacity-50 pointer-events-none': !!error }">
        <SegmentedControl
          :model-value="viewMode"
          :options="viewOptions"
          class="w-full max-w-full"
          @update:model-value="$emit('update:viewMode', $event as ViewMode)" />
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
    </template>

    <!-- Custom Content Slot: Replaces textarea for Tree View or Empty State -->
    <template v-if="!currentTextContent" #default>
      <!-- Empty State -->
      <div v-if="!hasData && !error" class="absolute inset-0 flex flex-col gap-2 items-center justify-center text-muted-foreground/40 z-10 pointer-events-none">
        <FileJson class="size-10 opacity-20" />
        <span class="text-sm font-medium">Result will appear here...</span>
      </div>

      <!-- Tree View -->
      <div v-if="viewMode === 'tree' && parsed" class="h-full w-full overflow-auto p-4 custom-scrollbar bg-background text-foreground">
        <JsonTreeItem :value="parsed" :is-last="true" :depth="0" />
      </div>
    </template>

  </BaseEditor>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Copy, Code2, FileJson, FileType, Table, FileCode, Download } from 'lucide-vue-next'
import { BaseButton, SegmentedControl, BaseEditor } from '@components/ui'
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

defineEmits<{
  (e: 'update:viewMode', value: ViewMode): void
  (e: 'copy'): void
  (e: 'download'): void
}>()

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
</script>
