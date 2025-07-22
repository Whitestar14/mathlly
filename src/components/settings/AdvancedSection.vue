<script setup lang="ts">
import { ref } from 'vue';
import { AlertTriangle, CircleHelp } from 'lucide-vue-next';
import Button from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import Collapsible from '@/components/base/BaseCollapsible.vue';
import { resetDatabase } from '@/data/db';
import { useToast } from '@/composables/useToast';

interface Props {
  isVisible: boolean;
}

defineProps<Props>();

const { toast } = useToast();

const showResetDatabaseModal = ref(false);
const isResettingDatabase = ref(false);

const showResetConfirmation = (): void => {
  showResetDatabaseModal.value = true;
};

const handleResetDatabase = async (): Promise<void> => {
  isResettingDatabase.value = true;

  try {
    const success = await resetDatabase();

    if (!success) throw new Error('Failed to reset database');
  } catch (error) {
    isResettingDatabase.value = false;
    showResetDatabaseModal.value = false;

    toast({
      type: 'error',
      title: 'Reset Failed',
      description:
        'There was a problem resetting your database. Please try again.',
    });

    console.error('Error resetting database:', error);
  }
};

const cancelResetDatabase = (): void => {
  showResetDatabaseModal.value = false;
};
</script>

<template>
  <Collapsible
    v-if="isVisible"
    id="advanced"
    title="Advanced Settings"
    icon="Settings"
    :default-open="false"
  >
    <div class="space-y-6">
      <div
        class="p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
      >
        <h3
          class="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
        >
          <AlertTriangle class="h-4 w-4" />
          Database Management
        </h3>

        <p class="text-sm text-muted-foreground mb-3">
          If you're experiencing issues with the app, you can reset the
          database to default settings. This will delete all your
          calculation history, tool settings, and restore default
          settings.
        </p>

        <div class="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            @click="showResetConfirmation"
          >
            Reset Database
          </Button>
        </div>
      </div>
    </div>
  </Collapsible>

  <!-- Reset Database Confirmation Modal -->
  <BaseModal v-model:open="showResetDatabaseModal">
    <template #title>
      <div class="flex items-center gap-2 text-foreground">
        <AlertTriangle class="h-5 w-5" />
        Reset Database
      </div>
    </template>

    <div class="space-y-5">
      <div
        class="p-4 bg-destructive/5 border border-destructive/20 rounded-lg"
      >
        <p class="text-sm font-medium text-foreground mb-3">
          This action will permanently delete your data and cannot be undone.
        </p>

        <div class="space-y-3">
          <div class="flex items-start gap-2.5">
            <div
              class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-bold">1</span>
            </div>
            <p class="text-sm text-foreground">
              All calculation history will be permanently deleted
            </p>
          </div>

          <div class="flex items-start gap-2.5">
            <div
              class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-bold">2</span>
            </div>
            <p class="text-sm text-foreground">
              All settings and tool preferences will be restored to their
              default values
            </p>
          </div>

          <div class="flex items-start gap-2.5">
            <div
              class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5"
            >
              <span class="text-xs font-bold">3</span>
            </div>
            <p class="text-sm text-foreground">
              The application will reload automatically
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex items-start gap-3 p-3 bg-accent/50 border border-border rounded-lg"
      >
        <div class="text-muted-foreground mt-0.5">
          <CircleHelp class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm text-foreground">
            <span class="font-medium">When to use this:</span> If you're
            experiencing persistent issues with the application such as
            incorrect calculations, settings not saving, or other unexpected
            behavior.
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
      <Button
        variant="outline"
        class="w-full sm:w-auto order-2 sm:order-1"
        :disabled="isResettingDatabase"
        @click="cancelResetDatabase"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        class="w-full sm:w-auto order-1 sm:order-2"
        :loading="isResettingDatabase"
        @click="handleResetDatabase"
      >
        <template v-if="!isResettingDatabase">
          <span class="flex items-center gap-1.5">
            <AlertTriangle class="h-4 w-4" />
            Reset Database
          </span>
        </template>
        <template v-else>
          Resetting...
        </template>
      </Button>
    </div>
  </BaseModal>
</template>
