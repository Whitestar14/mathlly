<script setup lang="ts">
import { computed } from 'vue'
import { BaseCollapsible, ToggleBar } from '@components/ui'
import type { Settings } from '@services/storage/db'

interface Props {
  settings: Settings;
  isVisible: boolean;
}

interface Emits {
  (e: 'update:settings', settings: Settings): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localSettings = computed({
  get: () => props.settings,
  set: value => emit('update:settings', value)
})
</script>

<template>
  <BaseCollapsible
    v-if="isVisible"
    id="privacy"
    title="Privacy"
    icon="ShieldCheck"
    :default-open="false">
    <div class="space-y-6">
      <div class="flex items-center justify-between py-2">
        <div class="max-w-[80%]">
          <label
            class="text-sm font-medium text-foreground">
            Allow Error Reporting
          </label>
          <p class="text-xs text-muted-foreground mt-1">
            Automatically send anonymous crash reports to help us improve Prism. We do not collect personal data.
          </p>
        </div>
        <ToggleBar v-model="localSettings.privacy.crashReportingEnabled" />
      </div>
    </div>
  </BaseCollapsible>
</template>
