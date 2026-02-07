
<template>
  <div class="flex flex-col h-full min-h-0 gap-2">
    <!-- Header -->
    <div class="flex justify-between items-center px-1 flex-shrink-0 min-h-[36px]">
      <label class="text-sm font-medium text-foreground">Input</label>
      <div class="flex gap-1 justify-center items-center">
        <BaseButton
          v-tippy="{ content: 'Paste from clipboard' }"
          variant="ghost"
          size="icon"
          class="size-8"
          @click="handlePaste">
          <ClipboardPaste class="size-4" />
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="$emit('sample')">
          Sample
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          class="text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="$emit('clear')">
          Clear
        </BaseButton>
      </div>
    </div>

    <!-- Editor Area -->
    <div class="relative flex-1 min-h-0 border border-border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring flex flex-col">
      <div class="flex-1 relative flex overflow-hidden">
        <!-- Line Numbers -->
        <div
          ref="linesRef"
          class="hidden md:block w-10 flex-shrink-0 bg-muted/30 border-r border-border text-right pr-2 pt-4 font-mono text-xs text-muted-foreground select-none overflow-hidden leading-6"
          aria-hidden="true">
          <div
            v-for="n in lineCount"
            :key="n">
            {{ n }}
          </div>
        </div>

        <!-- Textarea -->
        <textarea
          ref="textareaRef"
          :value="modelValue"
          class="flex-1 h-full p-4 resize-none bg-transparent outline-none font-mono text-xs md:text-sm leading-6 whitespace-pre w-full"
          placeholder="Paste JSON here..."
          spellcheck="false"
          @input="handleInput"
          @scroll="syncScroll"></textarea>
      </div>

      <!-- Error Overlay -->
      <div
        v-if="error"
        class="absolute bottom-0 left-0 right-0 bg-destructive/10 border-t border-destructive/20 p-2 text-xs text-destructive flex items-center gap-2 backdrop-blur-sm z-10 animate-in slide-in-from-bottom-2">
        <AlertCircle class="size-4" />
        <span class="font-mono font-semibold">Line {{ error.line }}:</span>
        <span class="truncate">{{ error.message }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap gap-2 justify-between items-center bg-card border border-border p-2 rounded-lg flex-shrink-0">
      <div class="text-xs text-muted-foreground font-mono truncate px-1">
        <span v-if="modelValue">{{ stats }}</span>
      </div>
      <div class="flex gap-2 items-center ml-auto">
        <div class="w-28">
          <SelectBar
            :model-value="indentation"
            :options="indentOptions"
            placeholder="Indent"
            align="end"
            @update:model-value="$emit('update:indentation', $event)" />
        </div>
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="disableActions"
          @click="$emit('minify')">
          Minify
        </BaseButton>
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="disableActions"
          @click="$emit('format')">
          Beautify
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardPaste, AlertCircle } from 'lucide-vue-next'
import { BaseButton, SelectBar } from '@components/ui'
import { useToast } from '@composables/ui/useToast'
import type { ParseError } from '../composables/useJsonTool'

const props = defineProps<{
  modelValue: string
  error: ParseError | null
  indentation: number | string
  stats: string
  disableActions: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:indentation', value: number | string): void
  (e: 'format'): void
  (e: 'minify'): void
  (e: 'sample'): void
  (e: 'clear'): void
  (e: 'process', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const linesRef = ref<HTMLElement | null>(null)
const { toast } = useToast()

const indentOptions = [
  { value: 2, label: '2 Spaces' },
  { value: 4, label: '4 Spaces' },
  { value: 'tab', label: 'Tab' }
]

const lineCount = computed(() => {
  return props.modelValue.split('\n').length
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('process', target.value)
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
      emit('process', text)
      toast({ title: 'Pasted', description: 'Content pasted from clipboard', type: 'success' })
    }
  } catch (e) {
    toast({ title: 'Error', description: 'Failed to read clipboard', type: 'error' })
  }
}
</script>
