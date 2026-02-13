<template>
  <div class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden shadow-sm">
    
    <!-- TOOLBAR (Top) -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px] flex-shrink-0">
      
      <!-- Left: File Actions -->
      <div class="flex items-center gap-1">
        <input ref="fileInputRef" type="file" accept=".json,.txt" class="hidden" @change="onFileSelected" />
        
        <BaseButton v-tippy="'Upload JSON'" variant="ghost" size="icon" class="size-8" :disabled="isProcessing" @click="fileInputRef?.click()">
          <UploadCloud class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Load Sample'" variant="ghost" size="icon" class="size-8" :disabled="isProcessing" @click="$emit('sample')">
          <FileText class="size-4 text-muted-foreground" />
        </BaseButton>
        <div class="w-px h-4 bg-border mx-1"></div>
        <BaseButton v-tippy="'Paste'" variant="ghost" size="icon" class="size-8" :disabled="isProcessing" @click="handlePaste">
          <ClipboardPaste class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Clear'" variant="ghost" size="icon" class="size-8 hover:text-destructive" :disabled="isProcessing" @click="$emit('clear')">
          <Trash2 class="size-4" />
        </BaseButton>
      </div>

      <!-- Right: Formatting Tools -->
      <div class="flex items-center gap-2">
        <div class="w-28">
          <SelectBar
            :model-value="indentation"
            :options="indentOptions"
            size="xs"
            @update:model-value="$emit('update:indentation', $event)" 
          />
        </div>
        <div class="w-px h-4 bg-border mx-1"></div>
        <BaseButton variant="ghost" size="sm" class="h-7 text-xs" :disabled="disableActions || isProcessing" @click="$emit('minify')">
          Minify
        </BaseButton>
        <BaseButton variant="ghost" size="sm" class="h-7 text-xs" :disabled="disableActions || isProcessing" @click="$emit('format')">
          Format
        </BaseButton>
      </div>
    </div>

    <!-- EDITOR AREA -->
    <div class="relative flex-1 min-h-0">
      
      <BaseEditor
        :model-value="modelValue"
        :error="error"
        :show-line-numbers="true"
        :readonly="isProcessing"
        :stats="stats"
        default-status="JSON Editor Ready"
        placeholder="Paste your JSON here..."
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <template #overlay>
          <!-- Processing Spinner (Overlay) -->
          <div v-if="isProcessing" class="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <div class="bg-card border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Loader2 class="size-4 animate-spin text-primary" />
              <span class="text-xs font-medium">Processing...</span>
            </div>
          </div>
        </template>
      </BaseEditor>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ClipboardPaste, UploadCloud, Loader2, FileText, Trash2 } from 'lucide-vue-next'
import { BaseButton, SelectBar, BaseEditor } from '@components/ui'
import { useToast } from '@composables/ui/useToast'
import type { ParseError } from '../composables/useJsonTool'

const props = defineProps<{
  modelValue: string
  error: ParseError | null
  indentation: number | string
  stats: string
  disableActions: boolean
  isProcessing: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:indentation', value: number | string): void
  (e: 'format'): void
  (e: 'minify'): void
  (e: 'sample'): void
  (e: 'clear'): void
  (e: 'upload', file: File): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const { toast } = useToast()

const indentOptions = [
  { value: 2, label: '2 Spaces' },
  { value: 4, label: '4 Spaces' },
  { value: 'tab', label: 'Tab' }
]

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      emit('update:modelValue', text)
      toast({ title: 'Pasted', description: 'Content pasted from clipboard', type: 'success' })
    }
  } catch (e) {
    toast({ title: 'Error', description: 'Failed to read clipboard', type: 'error' })
  }
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('upload', file)
  target.value = ''
}
</script>