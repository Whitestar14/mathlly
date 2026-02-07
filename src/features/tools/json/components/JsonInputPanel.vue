<template>
  <div class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden shadow-sm">
    
    <!-- TOOLBAR (Top) -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30">
      
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
    <div class="relative flex-1 min-h-0 flex bg-background group">
      
      <!-- Line Numbers -->
      <div
        ref="linesRef"
        class="hidden md:block w-10 flex-shrink-0 bg-muted/10 border-r border-border text-right py-4 pr-2 font-mono text-xs text-muted-foreground/50 select-none overflow-hidden leading-6"
        aria-hidden="true">
        <div
          v-for="n in lineCount"
          :key="n"
          :class="{ 'text-destructive font-bold bg-destructive/10 -mr-2 pr-2': error && error.line === n }">
          {{ n }}
        </div>
      </div>

      <!-- Textarea -->
      <textarea
        ref="textareaRef"
        :value="modelValue"
        class="flex-1 h-full p-4 resize-none bg-transparent outline-none font-mono text-xs md:text-sm leading-6 whitespace-pre w-full placeholder:text-muted-foreground/30"
        placeholder="// Paste your JSON here..."
        spellcheck="false"
        :disabled="isProcessing"
        @input="handleInput"
        @scroll="syncScroll">
      </textarea>

      <!-- Processing Spinner (Overlay) -->
      <div v-if="isProcessing" class="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
        <div class="bg-card border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Loader2 class="size-4 animate-spin text-primary" />
          <span class="text-xs font-medium">Processing...</span>
        </div>
      </div>
    </div>

    <!-- STATUS BAR (Bottom) -->
    <div 
      class="flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider font-medium border-t border-border bg-muted/30 h-7 select-none"
      :class="error ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'text-muted-foreground'">
      
      <!-- Left: Error or Ready state -->
      <div class="flex items-center gap-2 overflow-hidden">
        <template v-if="error">
          <AlertCircle class="size-3" />
          <span class="truncate">Error on line {{ error.line }}: {{ error.message }}</span>
        </template>
        <template v-else>
          <span class="opacity-70">JSON Editor Ready</span>
        </template>
      </div>

      <!-- Right: Stats -->
      <div class="flex items-center gap-3 shrink-0">
        <span v-if="modelValue">Ln {{ lineCount }}</span>
        <span v-if="stats">{{ stats }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardPaste, AlertCircle, UploadCloud, Loader2, FileText, Trash2 } from 'lucide-vue-next'
import { BaseButton, SelectBar } from '@components/ui'
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

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const linesRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const { toast } = useToast()

const indentOptions = [
  { value: 2, label: '2 Spaces' },
  { value: 4, label: '4 Spaces' },
  { value: 'tab', label: 'Tab' }
]

const lineCount = computed(() => {
  if (!props.modelValue) return 1
  return props.modelValue.split('\n').length
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const syncScroll = () => {
  if (textareaRef.value && linesRef.value) {
    linesRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

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