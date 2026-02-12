<template>
  <div
    class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden shadow-sm relative group">

    <!-- Toolbar -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px] flex-shrink-0">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-foreground px-2">Input</label>
      </div>

      <div class="flex items-center gap-1">
        <!-- Manual Process Button (Only visible if Auto-Process is OFF) -->
        <BaseButton v-tippy="'Run'" v-if="!autoProcess" variant="secondary" size="icon" class="size-8 mr-2 animate-in fade-in"
          :disabled="isProcessing" @click="$emit('process')">
          <Play class="size-3.5" />
        </BaseButton>

        <input ref="fileInputRef" type="file" class="hidden" @change="onFileSelected" />
        <BaseButton v-tippy="'Upload File'" variant="ghost" size="icon" class="size-8" @click="fileInputRef?.click()">
          <UploadCloud class="size-4 text-muted-foreground" />
        </BaseButton>
        <div class="w-px h-4 bg-border mx-1"></div>
        <BaseButton v-tippy="'Paste'" variant="ghost" size="icon" class="size-8" @click="handlePaste">
          <ClipboardPaste class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Clear'" variant="ghost" size="icon" class="size-8 hover:text-destructive"
          @click="$emit('clear')">
          <Trash2 class="size-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Editor Area -->
    <div class="relative flex-1 min-h-0 bg-background">
      
      <!-- File Mode UI -->
      <div v-if="inputMode === 'file' && fileDetails" class="absolute inset-0 flex items-center justify-center p-6">
        <div class="w-full max-w-sm p-4 rounded-lg border border-border bg-muted/20 flex flex-col items-center gap-3 text-center animate-in zoom-in-95">
           <div class="p-3 bg-primary/10 rounded-full text-primary">
             <FileIcon class="size-8" />
           </div>
           <div>
             <h3 class="font-medium text-foreground text-sm truncate max-w-[250px]">{{ fileDetails.name }}</h3>
             <p class="text-xs text-muted-foreground mt-0.5">{{ formatFileSize(fileDetails.size) }} • {{ fileDetails.type || 'Unknown Type' }}</p>
           </div>
           <BaseButton variant="outline" size="sm" class="mt-2" @click="$emit('clear')">
             Remove File
           </BaseButton>
        </div>
      </div>

      <!-- Text Mode UI -->
      <template v-else>
        <div v-if="!modelValue" class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div class="text-center space-y-2 opacity-30 select-none">
            <UploadCloud class="size-12 mx-auto" />
            <p class="text-sm font-medium">Type, Paste or Drop File</p>
          </div>
        </div>

        <textarea :value="modelValue"
          class="absolute inset-0 w-full h-full p-4 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed z-10 custom-scrollbar"
          spellcheck="false" 
          @input="handleInput"></textarea>
      </template>

      <!-- Loader with fade transition -->
      <Transition name="fade">
        <div v-if="isProcessing"
          class="absolute inset-0 z-20 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
          <div class="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-lg">
            <Loader2 class="size-4 animate-spin text-accent" />
            <span class="text-xs font-medium">Processing...</span>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Footer Stats (Hidden if showStats is false) -->
    <div v-if="showStats"
      class="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium border-t border-border bg-muted/30 text-muted-foreground h-8 flex-shrink-0 select-none">
      <div class="flex gap-3">
        <span v-if="stats && inputMode === 'text'">{{ stats.characters.toLocaleString() }} chars</span>
        <span v-if="stats">{{ stats.bytes.toLocaleString() }} bytes</span>
      </div>
      <div>{{ (modelValue || inputMode === 'file') ? 'Ready' : 'Waiting' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, ClipboardPaste, Trash2, Loader2, Play, File as FileIcon } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { useToast } from '@composables/ui/useToast'
import type { InputMode, FileDetails } from '../types/base64'
import { formatFileSize } from '../utils/formatters/base64Formatter'

defineProps<{
  modelValue: string
  mode: 'encode' | 'decode'
  inputMode?: InputMode
  fileDetails?: FileDetails | null
  autoProcess: boolean
  placeholder?: string
  stats?: any
  showStats?: boolean
  isProcessing?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'upload', files: FileList): void
  (e: 'process'): void
  (e: 'clear'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const { toast } = useToast()

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) emit('upload', target.files)
  target.value = ''
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    emit('update:modelValue', text)
    toast({ title: 'Pasted', description: 'Content from clipboard', type: 'success' })
  } catch (e) {
    toast({ title: 'Error', description: 'Could not read clipboard', type: 'error' })
  }
}
</script>

<style lang="css" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
