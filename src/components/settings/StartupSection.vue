<script setup lang="ts">
import { computed } from 'vue';
import Select from '@/components/ui/SelectBar.vue';
import Collapsible from '@/components/base/BaseCollapsible.vue';
import type { Settings } from '@/data/db';

interface Props {
  settings: Settings;
  isVisible: boolean;
}

interface Emits {
  (e: 'update:settings', settings: Settings): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const startupOptions = [
  { value: 'home', label: 'Home' },
  { value: 'calculator', label: 'Calculator Page' },
  { value: 'last-visited', label: 'Last Visited Page' },
];

const localSettings = computed({
  get: () => props.settings,
  set: (value) => emit('update:settings', value),
});
</script>

<template>
  <Collapsible
    v-if="isVisible"
    id="startup"
    title="Startup Preferences"
    icon="Power"
    :default-open="true"
  >
    <div>
      <label
        for="startupNavigation"
        class="text-sm font-medium text-foreground mb-1.5 block"
      >
        When app starts, open:
      </label>
      <Select
        v-model="localSettings.startup.navigation"
        :options="startupOptions"
      />
      <p class="text-xs text-muted-foreground mt-2">
        Choose which page to show when you first open the app.
        Calculator-specific settings like default mode can be found in the
        calculator's tool options.
      </p>
    </div>
  </Collapsible>
</template>
