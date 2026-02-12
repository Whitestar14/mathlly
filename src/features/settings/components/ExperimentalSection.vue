
<template>
  <BaseCollapsible
    v-if="isVisible"
    id="experimental"
    title="Experimental"
    icon="FlaskConical"
    :default-open="false">
    <div class="space-y-6">

      <div class="px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20">
        <div class="flex items-center gap-2 mb-1">
          <AlertTriangleIcon class="size-4 text-amber-600" />
          <h3 class="text-xs font-medium text-amber-800 dark:text-amber-200">
            Warning
          </h3>
        </div>
        <p class="text-xs text-amber-700 dark:text-amber-300">
          These features are in early development and may be unstable or removed in future updates.
        </p>
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="max-w-[80%]">
          <div class="flex items-center gap-2">
            <label
              class="text-sm font-medium text-foreground">
              Dashboard Layout
            </label>
            <BaseBadge variant="beta" text="Beta" size="sm" />
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Try the new bento-grid style dashboard. This layout is experimental and subject to change. Please provide feedback via the feedback tool!
          </p>
        </div>
        <ToggleBar
          :model-value="localSettings.experimental.homeLayout === 'dashboard'"
          @update:model-value="val => localSettings.experimental.homeLayout = val ? 'dashboard' : 'classic'" />
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="max-w-[80%]">
          <div class="flex items-center gap-2">
            <label
              for="commandPaletteEnabled"
              class="text-sm font-medium text-foreground">
              Command Palette
            </label>
            <CircleHelp
              v-tippy="{
                content: 'A quick navigation interface inspired by modern code editors. Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open. This feature is experimental as it may conflict with existing keyboard shortcuts and is still being refined.',
                placement: 'top',
                maxWidth: 300,
                onShow() {
                  return true;
                },
              }"
              class="size-4 cursor-help text-muted-foreground" />
          </div>
          <p class="text-xs text-muted-foreground">
            Quick navigation with keyboard shortcuts
          </p>
        </div>
        <ToggleBar v-model="localSettings.experimental.commandPaletteEnabled" />
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="max-w-[80%]">
          <div class="flex items-center gap-2">
            <label
              for="devDockEnabled"
              class="text-sm font-medium text-foreground">
              Developer Tools (DevDock)
            </label>
            <CircleHelp
              v-tippy="{
                content: 'Advanced development and debugging tools including performance monitoring, console logging, and state inspection. This feature is experimental and may impact application performance.',
                placement: 'top',
                maxWidth: 300,
                onShow() {
                  return true;
                },
              }"
              class="size-4 cursor-help text-muted-foreground" />
          </div>
          <p class="text-xs text-muted-foreground">
            Advanced debugging and development tools
          </p>
        </div>
        <ToggleBar v-model="localSettings.experimental.devDockEnabled" />
      </div>

      <div class="px-3 py-2 rounded-md bg-muted/40 border border-border/40">
        <p class="text-xs text-muted-foreground">
          Experimental features help us test new functionality before making them available to all users.
          Your feedback on these features is valuable for improving the application.
        </p>
      </div>
    </div>
  </BaseCollapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangleIcon, CircleHelp } from 'lucide-vue-next'
import { BaseCollapsible, ToggleBar, BaseBadge } from '@components/ui'
import type { Settings } from '@services/storage/db'

interface Props {
  settings: Settings
  isVisible: boolean
}

interface Emits {
  (e: 'update:settings', settings: Settings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localSettings = computed({
  get: () => props.settings,
  set: value => emit('update:settings', value)
})
</script>
