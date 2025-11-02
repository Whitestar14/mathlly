<script setup lang="ts">
import { SearchIcon } from 'lucide-vue-next';
import { BaseInput } from '@components/ui'

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
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
      />
    </div>
  </div>
</template>
