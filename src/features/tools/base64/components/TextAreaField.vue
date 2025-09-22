<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { ClipboardPaste, AlertCircle } from 'lucide-vue-next';
import { BaseButton } from '@components/ui';
import { TextStats } from '../types/base64';

defineProps<{
  modelValue: string;
  label: string;
  placeholder: string;
  stats?: TextStats;
  showStats?: boolean;
  validationError?: string;
  validateInput?: boolean;
  readOnly?: boolean;
  showPasteButton?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'input'): void;
  (e: 'drop', event: DragEvent): void;
  (e: 'paste'): void;
}>();

const textareaRef: Ref<HTMLTextAreaElement | null> = ref(null);

const handleInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  emit('input');
};

const handlePaste = (): void => {
  emit('paste');
};
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-foreground dark:text-muted-foreground">
        {{ label }}
      </label>

      <div class="w-10 flex items-center justify-end">
        <slot name="actions" />
      </div>
    </div>
    
    <div class="relative">
      <textarea 
        ref="textareaRef"
        :value="modelValue"
        :rows="8"
        :placeholder="placeholder"
        :readonly="readOnly"
        class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none font-mono pr-20"
        :class="{
          'border-destructive/50 bg-destructive/10': validationError && validateInput
        }"
        @input="handleInput"
        @drop="$emit('drop', $event)"
        @dragover.prevent
        @dragenter.prevent
      />
      
      <div 
        v-if="showPasteButton" 
        class="absolute bottom-3 right-2 flex items-center gap-1"
      >
        <BaseButton
          v-tippy="{ content: 'Paste' }"
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          @click="handlePaste"
        >
          <ClipboardPaste class="h-3 w-3" />
        </BaseButton>
      </div>

    </div>
    
    <div
      v-if="validationError && validateInput"
      class="text-xs text-destructive flex items-center gap-1"
    >
      <AlertCircle class="h-3 w-3" />
      {{ validationError }}
    </div>

    <div
      v-if="showStats && stats"
      class="flex items-center justify-between text-xs text-muted-foreground"
    >
      <span>{{ stats.characters }} characters, {{ stats.bytes }} bytes</span>
      <span v-if="stats.lines > 1">{{ stats.lines }} lines</span>
    </div>
  </div>
</template>