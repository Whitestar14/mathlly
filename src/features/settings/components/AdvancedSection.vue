<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, CircleHelp, Download, Upload, Database, Settings2 } from 'lucide-vue-next'
import { BaseButton, BaseModal, BaseCollapsible, BaseLabel } from '@components/ui'
import db, { resetDatabase } from '@services/storage/db'
import { useToast } from '@composables/ui/useToast'
import { BackupService } from '@shared/services/backup/BackupService'
import { downloadBlob } from '@base64/utils/helpers/fileHelpers'

interface Props {
  isVisible: boolean;
}

defineProps<Props>()

const { toast } = useToast()

const showResetDatabaseModal = ref(false)
const isResettingDatabase = ref(false)
const isExporting = ref(false)
const isImporting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const showResetConfirmation = (): void => {
  showResetDatabaseModal.value = true
}

const handleResetDatabase = async(): Promise<void> => {
  isResettingDatabase.value = true

  try {
    const success = await resetDatabase(db)

    if (!success) throw new Error('Failed to reset database')
  } catch(error) {
    isResettingDatabase.value = false
    showResetDatabaseModal.value = false

    toast({
      type: 'error',
      title: 'Reset Failed',
      description:
        'There was a problem resetting your database. Please try again.'
    })

    console.error('Error resetting database:', error)
  }
}

const cancelResetDatabase = (): void => {
  showResetDatabaseModal.value = false
}

const handleExport = async() => {
  isExporting.value = true
  try {
    const blob = await BackupService.createBackup()
    const filename = BackupService.getFilename()
    downloadBlob(blob, filename)
    toast({ type: 'success', title: 'Backup Created', description: 'Your data has been exported successfully.' })
  } catch(error) {
    console.error(error)
    toast({ type: 'error', title: 'Export Failed', description: 'Could not create backup file.' })
  } finally {
    isExporting.value = false
  }
}

const triggerImport = () => {
  fileInputRef.value?.click()
}

const handleImport = async(event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isImporting.value = true
  try {
    await BackupService.restoreBackup(file)
    // Note: App reloads on success, so no toast needed here usually,
    // but just in case logic changes:
    toast({ type: 'success', title: 'Import Successful', description: 'Restoring data...' })
  } catch(error: any) {
    console.error(error)
    toast({ type: 'error', title: 'Import Failed', description: error.message || 'Invalid backup file.' })
    isImporting.value = false
  }

  // Clear input
  target.value = ''
}
</script>

<template>
  <BaseCollapsible
    v-if="isVisible"
    id="advanced"
    title="Advanced"
    :icon="Settings2"
    :default-open="false">
    <div class="space-y-6">

      <!-- Data Management -->
      <div class="space-y-3">
        <BaseLabel class="text-sm font-medium">Data Management</BaseLabel>
        <div class="p-4 border border-border bg-card rounded-lg space-y-4">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <Database class="h-5 w-5" />
            </div>
            <div>
              <h4 class="text-sm font-medium">Backup & Restore</h4>
              <p class="text-xs text-muted-foreground mt-1">
                Export your settings, history, and palettes to a JSON file, or restore from a previous backup.
              </p>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <BaseButton variant="outline" size="sm" class="flex-1" :loading="isExporting" @click="handleExport">
              <Download class="h-4 w-4 mr-2" />
              Export Data
            </BaseButton>

            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImport" />
            <BaseButton variant="outline" size="sm" class="flex-1" :loading="isImporting" @click="triggerImport">
              <Upload class="h-4 w-4 mr-2" />
              Import Data
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div
        class="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
        <h3
          class="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <AlertTriangle class="h-4 w-4 text-destructive" />
          Danger Zone
        </h3>

        <p class="text-sm text-muted-foreground mb-3">
          If you're experiencing issues with the app, you can reset the
          database to default settings.
        </p>

        <div class="flex justify-end">
          <BaseButton
            variant="destructive"
            size="sm"
            @click="showResetConfirmation">
            Reset Database
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCollapsible>

  <BaseModal id="reset-database-modal" v-model:open="showResetDatabaseModal">
    <template #title>
      <div class="flex items-center gap-2 text-foreground">
        <AlertTriangle class="h-5 w-5" />
        Reset Database
      </div>
    </template>

    <div class="space-y-5">
      <div
        class="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
        <p class="text-sm font-medium text-foreground mb-3">
          This action will permanently delete your data and cannot be undone.
        </p>

        <div class="space-y-3">
          <div class="flex items-start gap-2.5">
            <div
              class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold">1</span>
            </div>
            <p class="text-sm text-foreground">
              All calculation history will be permanently deleted
            </p>
          </div>

          <div class="flex items-start gap-2.5">
            <div
              class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold">2</span>
            </div>
            <p class="text-sm text-foreground">
              All settings and tool preferences will be restored to their
              default values
            </p>
          </div>

          <div class="flex items-start gap-2.5">
            <div
              class="h-5 w-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold">3</span>
            </div>
            <p class="text-sm text-foreground">
              The application will reload automatically
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex items-start gap-3 p-3 bg-accent/15 border border-border rounded-lg">
        <div class="text-muted-foreground mt-0.5">
          <CircleHelp class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm text-foreground">
            <span class="font-medium">Tip:</span> Try exporting your data first using the backup tool above before resetting.
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
      <BaseButton
        variant="outline"
        class="w-full sm:w-auto order-2 sm:order-1"
        :disabled="isResettingDatabase"
        @click="cancelResetDatabase">
        Cancel
      </BaseButton>
      <BaseButton
        variant="destructive"
        class="w-full sm:w-auto order-1 sm:order-2"
        :loading="isResettingDatabase"
        @click="handleResetDatabase">
        <template v-if="!isResettingDatabase">
          <span class="flex items-center gap-1.5">
            <AlertTriangle class="h-4 w-4" />
            Reset Database
          </span>
        </template>
        <template v-else>
          Resetting...
        </template>
      </BaseButton>
    </div>
  </BaseModal>
</template>
