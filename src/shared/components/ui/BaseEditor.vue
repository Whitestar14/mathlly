<template>
  <div class="flex flex-col h-full w-full min-h-0 border border-border rounded-lg bg-card overflow-hidden shadow-sm group">

    <!-- Toolbar Slot -->
    <div
      v-if="$slots.toolbar"
      class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px] flex-shrink-0 overflow-x-auto no-scrollbar">
      <slot name="toolbar"></slot>
    </div>

    <!-- Content Area (Editor or Custom View) -->
    <div class="relative flex-1 flex min-h-0 w-full overflow-hidden bg-background">

      <slot>
        <!-- Default Text Editor Implementation -->
        <div class="flex w-full h-full font-mono text-sm">
          <!-- Line Numbers Gutter -->
          <div
            v-if="showLineNumbers"
            ref="linesRef"
            class="w-10 flex-shrink-0 bg-muted/10 border-r border-border text-right py-4 pr-2 text-muted-foreground/50 select-none overflow-hidden leading-6"
            aria-hidden="true">
            <div
              v-for="n in lineCount"
              :key="n"
              class="transition-colors duration-200"
              :class="{ 'text-destructive font-bold bg-destructive/10 -mr-2 pr-2': normalizedError && normalizedError.line === n }">
              {{ n }}
            </div>
          </div>

          <!-- Editor Area -->
          <textarea
            ref="textareaRef"
            :value="modelValue"
            :readonly="readonly"
            :placeholder="placeholder"
            class="flex-1 h-full w-full p-4 resize-none bg-transparent outline-none leading-6 whitespace-pre placeholder:text-muted-foreground/30 focus:ring-0 border-0 font-mono"
            :class="[
              readonly ? 'cursor-default' : 'cursor-text',
              textareaClass
            ]"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @input="handleInput"
            @scroll="syncScroll"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"></textarea>
        </div>
      </slot>

      <!-- Overlay Slot (Loaders, Messages) -->
      <slot name="overlay"></slot>
    </div>

    <!-- Unified Footer / Status Bar -->
    <div
      class="flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider font-medium border-t border-border h-7 select-none flex-shrink-0 transition-colors duration-200"
      :class="footerClasses">

      <!-- Left: Status / Error Message -->
      <div class="flex items-center gap-2 overflow-hidden mr-4">
        <template v-if="error">
          <AlertCircle class="size-3 shrink-0" />
          <span class="truncate">{{ errorMessage }}</span>
        </template>
        <template v-else>
          <span class="opacity-70 truncate">{{ statusText }}</span>
        </template>
      </div>

      <!-- Right: Statistics -->
      <div class="flex items-center gap-3 shrink-0 opacity-80">
        <span v-if="showLineNumbers && modelValue && !readonly">Ln {{ lineCount }}</span>
        <span v-if="stats">{{ stats }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

export interface EditorError {
  line?: number
  message?: string
}

interface Props {
  modelValue?: string
  readonly?: boolean
  showLineNumbers?: boolean
  placeholder?: string
  error?: EditorError | string | null
  textareaClass?: string | string[] | Record<string, boolean>
  stats?: string
  defaultStatus?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  readonly: false,
  showLineNumbers: true,
  placeholder: '',
  error: null,
  textareaClass: 'text-foreground',
  stats: '',
  defaultStatus: 'Ready'
})

const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const linesRef = ref<HTMLElement | null>(null)

const lineCount = computed(() => {
  if (!props.modelValue) return 1
  return props.modelValue.split('\n').length
})

// Normalize error prop to object or null
const normalizedError = computed((): EditorError | null => {
  if (!props.error) return null
  if (typeof props.error === 'string') return { message: props.error }
  return props.error
})

const errorMessage = computed(() => {
  if (!normalizedError.value) return ''
  const e = normalizedError.value
  return e.line ? `Error on line ${e.line}: ${e.message}` : e.message
})

const statusText = computed(() => {
  if (props.readonly && !props.modelValue) return 'Waiting for input...'
  return props.defaultStatus
})

const footerClasses = computed(() => {
  if (props.error) return 'bg-destructive/10 text-destructive border-destructive/20'
  return 'bg-muted/30 text-muted-foreground'
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

const syncScroll = () => {
  if (props.showLineNumbers && textareaRef.value && linesRef.value) {
    linesRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

watch(() => props.modelValue, () => {
  nextTick(syncScroll)
})

defineExpose({
  textarea: textareaRef
})
</script>
