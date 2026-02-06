
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { ClipboardPaste, AlertCircle } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { TextStats } from '../types/base64'

defineProps<{
  modelValue: string;
  label: string;
  placeholder: string;
  stats?: TextStats;
  showStats?: boolean;
  validationError?: string;
  readOnly?: boolean;
  showPasteButton?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'input'): void;
  (e: 'drop', event: DragEvent): void;
  (e: 'paste'): void;
}>()

const textareaRef: Ref<HTMLTextAreaElement | null> = ref(null)

const handleInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input')
}

const handlePaste = (): void => {
  emit('paste')
}

defineExpose({
  focus: () => textareaRef?.value?.focus()
})
</script>

<template>
  <div class="space-y-2 h-full grid grid-cols-1 grid-rows-[1fr_4fr]">
    <div class="flex items-center justify-between flex-shrink-0 min-h-[25px]">
      <label class="text-sm font-medium text-foreground dark:text-muted-foreground">
        {{ label }}
      </label>

      <div class="flex-1 flex items-center justify-end">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="relative flex-1 min-h-0">
      <slot name="content">
        <textarea
          ref="textareaRef"
          :value="modelValue"
          :placeholder="validationError ? '' : placeholder"
          :readonly="readOnly"
          class="w-full h-full rounded-md border min-h-[192px] border-border bg-background px-3 py-2 text-sm resize-none font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-ring"
          :class="{
            'border-destructive/50 bg-destructive/5 focus:ring-destructive/20': validationError
          }"
          @input="handleInput"
          @drop="$emit('drop', $event)"
          @dragover.prevent
          @dragenter.prevent></textarea>

        <div
          v-if="showPasteButton"
          class="absolute bottom-0 right-0 m-2 mb-2 flex items-center">
          <BaseButton
            v-tippy="{ content: 'Paste' }"
            variant="secondary"
            size="icon"
            class="size-8"
            @click="handlePaste">
            <ClipboardPaste class="size-4" />
          </BaseButton>
        </div>
      </slot>
    </div>

    <div class="flex-shrink-0 min-h-[20px] flex items-center">
      <div
        v-if="validationError"
        class="text-xs text-destructive flex items-center gap-1.5 font-medium animate-in slide-in-from-left-2 duration-200">
        <AlertCircle class="h-3.5 w-3.5" />
        {{ validationError }}
      </div>

      <div
        v-else-if="showStats && stats"
        class="flex items-center justify-between text-xs text-muted-foreground w-full">
        <span>{{ stats.characters.toLocaleString() }} chars, {{ stats.bytes.toLocaleString() }} bytes</span>
        <span v-if="stats.lines > 1">{{ stats.lines.toLocaleString() }} lines</span>
      </div>
    </div>
  </div>
</template>
