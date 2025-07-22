<script setup lang="ts">
import Button from '@/components/base/BaseButton.vue';

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
    <Button
      variant="ghost"
      @click="$emit('cancel')"
    >
      Cancel
    </Button>
    <Button
      variant="primary"
      :disabled="!hasChanges"
      :loading="isLoading"
      @click="$emit('save')"
    >
      Save Changes
    </Button>
  </div>
</template>
