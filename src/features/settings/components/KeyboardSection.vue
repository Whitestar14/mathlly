<script setup lang="ts">
import { computed } from 'vue';
import { BaseCollapsible, ToggleBar } from '@components/ui';
import type { Settings } from '@services/storage/db';

interface Props {
  settings: Settings;
  isVisible: boolean;
}

interface Emits {
  (e: 'update:settings', settings: Settings): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localSettings = computed({
  get: () => props.settings,
  set: (value) => emit('update:settings', value),
});

// Computed property to handle inverted semantics: toggle represents "Disable"
const disableShortcuts = computed({
  get: () => !localSettings.value.keyboard.shortcutsEnabled,
  set: (value: boolean) => {
    localSettings.value.keyboard.shortcutsEnabled = !value;
  },
});
</script>

<template>
  <BaseCollapsible
    v-if="isVisible"
    id="keyboard"
    title="Keyboard Shortcuts"
    icon="Keyboard"
    :default-open="true"
  >
    <div class="flex items-center justify-between py-2">
      <div class="max-w-[80%]">
        <label
          for="disableShortcuts"
          class="text-sm font-medium text-foreground"
        >
          Disable Keyboard Shortcuts
        </label>
        <p class="text-xs text-muted-foreground">
          When disabled, keyboard shortcuts will not function throughout the app. Turn this off if the shortcuts are intercepting your commands in unpredictable ways
        </p>
      </div>
      <ToggleBar v-model="disableShortcuts" />
    </div>
  </BaseCollapsible>
</template>