<script setup lang="ts">
import { computed } from 'vue'
import { SelectBar, BaseCollapsible } from '@components/ui'
import { Power } from 'lucide-vue-next'
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

const startupOptions = [
  { value: 'home', label: 'Home' },
  { value: 'calculator', label: 'Calculator Page' },
  { value: 'last-visited', label: 'Last Visited Page' }
]

const localSettings = computed({
  get: () => props.settings,
  set: value => emit('update:settings', value)
})
</script>

<template>
  <BaseCollapsible
    v-if="isVisible"
    id="startup"
    title="Startup"
    :icon="Power"
    :default-open="true">
    <div>
      <label
        for="startupNavigation"
        class="text-sm font-medium text-foreground mb-1.5 block">
        When app starts, open:
      </label>
      <SelectBar
        v-model="localSettings.startup.navigation"
        :options="startupOptions" />
      <p class="text-xs text-muted-foreground mt-2">
        Choose which page to show when you first open the app.
        Calculator-specific settings like default mode can be found in the
        calculator's tool options.
      </p>
    </div>
  </BaseCollapsible>
</template>