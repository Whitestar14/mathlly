<template>
  <BaseEditor
    :model-value="modelValue"
    :readonly="true"
    :show-line-numbers="true"
    :error="error"
    :stats="statsString"
    :default-status="statusString"
    :placeholder="!modelValue && !error ? 'Result will appear here...' : ''"
    :textarea-class="!modelValue ? 'text-muted-foreground' : 'text-foreground'"
  >
    <template #toolbar>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-foreground px-2">Output</label>
        <div
          class="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono uppercase">
          {{ formatLabel }}
        </div>
      </div>
      <div class="flex items-center gap-1">
        <BaseButton v-if="hasPreview" v-tippy="showPreview ? 'Show Text' : 'Show Preview'" variant="ghost" size="icon"
          class="size-8" @click="showPreview = !showPreview">
          <component :is="showPreview ? FileTextIcon : EyeIcon" class="size-4 text-muted-foreground" />
        </BaseButton>
        <div v-if="hasPreview" class="w-px h-4 bg-border mx-1"></div>
        <BaseButton v-tippy="'Swap'" variant="ghost" size="icon" class="size-8" :disabled="!modelValue || !!error"
          @click="$emit('swap')">
          <ArrowDownUp class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Download'" variant="ghost" size="icon" class="size-8" :disabled="!modelValue || !!error"
          @click="$emit('download')">
          <Download class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Copy'" variant="ghost" size="icon" class="size-8" :disabled="!modelValue || !!error"
          @click="$emit('copy')">
          <Copy class="size-4 text-muted-foreground" />
        </BaseButton>
      </div>
    </template>

    <!-- Custom Content: Preview Mode or Warning Overlay -->
    <template #default v-if="(showPreview && hasPreview && !error) || (showBinaryWarning && !error)">
      
      <!-- Preview Mode -->
      <div v-if="showPreview && hasPreview && !error" class="flex-1 flex flex-col items-center justify-center p-4 bg-muted/5 w-full h-full">
        <div class="relative max-w-full max-h-full flex flex-col items-center justify-center gap-4">
          <img v-if="previewUrl && previewInfo?.mime.startsWith('image/')" :src="previewUrl"
            class="max-h-[300px] object-contain rounded-md border border-border shadow-sm bg-[url('/img/transparent-grid.png')]" />
          <iframe v-else-if="previewUrl && previewInfo?.mime === 'application/pdf'" :src="previewUrl"
            class="w-full h-[300px] border border-border rounded shadow-sm"></iframe>
          <div v-else
            class="flex flex-col items-center text-muted-foreground p-8 border border-dashed border-border rounded-lg">
            <FileIcon class="size-12 mb-2 opacity-50" />
            <span class="text-sm">Binary Data</span>
          </div>
          <div class="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {{ previewInfo?.mime }} • {{ previewInfo?.size }}
          </div>
        </div>
      </div>

      <!-- Binary Warning Overlay (replaces text editor content if active) -->
      <div v-if="showBinaryWarning && !error" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 p-6 text-center space-y-3 animate-in fade-in">
           <AlertTriangle class="size-10 text-amber-500 mb-1" />
           <h3 class="text-sm font-medium text-foreground">Binary Content Detected</h3>
           <p class="text-xs text-muted-foreground max-w-xs leading-relaxed">
             The file is not displayed in the editor because it is either binary or uses an unsupported text encoding.
           </p>
           <BaseButton variant="secondary" size="sm" @click="forceShowText = true" class="pointer-events-auto">
             Show Anyway
           </BaseButton>
      </div>

    </template>
  </BaseEditor>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy, Download, ArrowDownUp, Eye as EyeIcon, FileText as FileTextIcon, File as FileIcon, AlertCircle, AlertTriangle } from 'lucide-vue-next'
import { BaseButton, BaseEditor } from '@components/ui'

const props = defineProps<{
  modelValue: string
  formatLabel: string
  stats?: { characters: number }
  showStats?: boolean
  error?: string
  previewUrl?: string | null
  previewInfo?: { mime: string, size: string, isBinary?: boolean } | null
}>()

const emit = defineEmits(['copy', 'download', 'swap'])
const showPreview = ref(true)
const forceShowText = ref(false)

const hasPreview = computed(() => !!props.previewUrl || !!props.previewInfo)

// Show warning if: content is binary AND not showing preview AND user hasn't forced text AND no error
const showBinaryWarning = computed(() => {
  return props.previewInfo?.isBinary && !forceShowText.value && !props.error
})

const statsString = computed(() => {
  if (!props.showStats || props.error) return ''
  return props.stats?.characters != null ? `${props.stats.characters.toLocaleString()} chars` : ''
})

const statusString = computed(() => {
  return props.modelValue ? 'Success' : 'Idle'
})

// Reset force flag when content changes
watch([() => props.modelValue, () => props.previewInfo], () => {
  forceShowText.value = false
  // Auto-switch to preview if binary content arrives
  if (props.previewInfo?.isBinary) {
    showPreview.value = true
  }
})
</script>