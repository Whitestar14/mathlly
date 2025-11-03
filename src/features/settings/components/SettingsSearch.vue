<script setup lang="ts">
import { SearchIcon, XIcon } from 'lucide-vue-next';
import { BaseInput } from '@components/ui'

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const clearSearch = () => {
  emit('update:modelValue', '');
};
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6">
    <div class="relative w-full sm:w-64">
      <BaseInput
        :model-value="modelValue"
        placeholder="Search settings..."
        :icon="SearchIcon"
        :autofocus="true"
        aria-label="Search settings"
        @update:model-value="$emit('update:modelValue', $event as string)"
      >
        <template v-if="modelValue.trim()" #suffix>
          <button
            type="button"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-muted/50"
            @click="clearSearch"
            aria-label="Clear search"
          >
            <XIcon class="size-4" />
          </button>
        </template>
      </BaseInput>
    </div>
  </div>
</template>
