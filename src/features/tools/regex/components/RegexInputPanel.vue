<template>
  <!-- Test String Editor -->
  <div class="flex-1 flex flex-col min-h-[200px]">
    <BaseEditor
      v-model="localTestString"
      placeholder="Enter your test string here..."
      default-status="Test String Preview"
      class="regex-test-string-editor flex-1 border border-border rounded-md overflow-hidden relative font-mono">
      <template #toolbar>
        <div class="flex items-center w-full justify-between gap-2 shrink-0">
          <div class="flex items-center w-full gap-2">
            <BasePopover position="bottom-end">
              <template #trigger>
                <BaseButton
                  variant="secondary"
                  size="icon"
                  class="font-mono"
                  title="Regex Flags">
                  {{ localFlags.length > 0 ? localFlags.join('') : '-' }}
                </BaseButton>
              </template>
              <div class="p-2 flex flex-col gap-1 min-w-[200px]">
                <span
                  class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">Flags</span>
                <div class="flex flex-col gap-1 px-2 py-1">
                  <BaseCheckbox
                    v-for="f in availableFlags"
                    :key="f.value"
                    :label="f.label"
                    :value="f.value"
                    :model-value="localFlags.includes(f.value)"
                    class="py-1.5"
                    @update:model-value="(checked: boolean) => handleFlagChange(f.value, checked)" />
                </div>
              </div>
            </BasePopover>
            <div class="flex-1 relative font-mono text-sm">
              <BaseInput
                v-model="localPattern"
                type="text"
                placeholder="Enter regex pattern here..."
                autocomplete="off"
                spellcheck="false">
                <template #icon> / </template>
                <template #suffix> / </template>
              </BaseInput>
            </div>
            <div class="flex shrink-0 gap-2">
              <BaseButton
                v-tippy="{ content: 'Sample' }"
                variant="secondary"
                size="icon"
                @click="$emit('sample')">
                <Wand2Icon class="size-4" />
              </BaseButton>
              <BaseButton
                v-tippy="{ content: 'Clear All' }"
                variant="ghost"
                size="icon"
                :disabled="!localPattern"
                class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                @click="$emit('clear')">
                <Trash2Icon class="size-4" />
              </BaseButton>
            </div>
          </div>

          <div
            v-if="error"
            class="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircleIcon class="w-3 h-3" />
            {{ error }}
          </div>
        </div>
      </template>
    </BaseEditor>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Wand2Icon, Trash2Icon, AlertCircleIcon } from 'lucide-vue-next'
import {
  BaseButton,
  BaseEditor,
  BasePopover,
  BaseCheckbox,
  BaseInput
} from '@components/ui'
import type { RegexMatch } from '../composables/useRegexTool'

interface Props {
  pattern: string;
  flags: string[];
  testString: string;
  availableFlags: Array<{ value: string; label: string }>;
  error: string | null;
  matches: RegexMatch[];
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:pattern', value: string): void;
  (e: 'update:flags', value: string[]): void;
  (e: 'update:testString', value: string): void;
  (e: 'sample'): void;
  (e: 'clear'): void;
}>()

const localPattern = computed({
  get: () => props.pattern,
  set: val => emit('update:pattern', val)
})

const localFlags = computed({
  get: () => props.flags,
  set: val => emit('update:flags', val)
})

const localTestString = computed({
  get: () => props.testString,
  set: val => emit('update:testString', val)
})

const handleFlagChange = (flagValue: string, isChecked: boolean) => {
  const current = new Set(localFlags.value)
  if (isChecked) {
    current.add(flagValue)
  } else {
    current.delete(flagValue)
  }
  localFlags.value = Array.from(current)
}
</script>
