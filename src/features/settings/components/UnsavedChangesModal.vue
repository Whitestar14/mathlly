<script setup lang="ts">
import { BaseModal, BaseButton } from '@components/ui'

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <BaseModal
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <template #title>
      Unsaved Changes
    </template>
    <p class="text-sm text-muted-foreground mb-4">
      You have unsaved changes. Are you sure you want to leave this page? Your
      changes will be lost.
    </p>

    <div class="flex justify-end space-x-3">
      <BaseButton
        variant="outline"
        @click="$emit('cancel')"
      >
        Stay on Page
      </BaseButton>
      <BaseButton
        variant="destructive"
        @click="$emit('confirm')"
      >
        Discard Changes
      </BaseButton>
    </div>
  </BaseModal>
</template>
