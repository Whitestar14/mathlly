<script setup lang="ts">
import {BaseButton} from '@components/ui';

interface Props {
  hasChanges: boolean;
  isLoading?: boolean;
}

interface Emits {
  (e: 'cancel'): void;
  (e: 'save'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div
    class="flex justify-end space-x-4 py-4 border-t border-border"
  >
    <BaseButton
      variant="ghost"
      @click="$emit('cancel')"
    >
      Cancel
    </BaseButton>
    <BaseButton
      variant="primary"
      :disabled="!hasChanges"
      :loading="isLoading"
      @click="$emit('save')"
    >
      Save Changes
    </BaseButton>
  </div>
</template>
