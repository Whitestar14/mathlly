<!-- src/features/tools/color/components/AdjustmentsCard.vue -->
<template>
    <BaseCard title="Adjustments">
      <template #header>
        <BaseTabs
          v-model="activeTab"
          :tabs="[
            { value: 'adjust', label: 'Adjust' },
            { value: 'temperature', label: 'Temp' },
            { value: 'mix', label: 'Mix' }
          ]"
        />
      </template>
  
      <div class="mt-4">
        <ColorAdjustments
          v-if="activeTab === 'adjust'"
          :current-color="currentColor"
          :update-color="updateColor"
        />
        <ColorTemperature
          v-else-if="activeTab === 'temperature'"
          :current-color="currentColor"
          :update-color="updateColor"
        />
        <ColorMixing
          v-else
          :current-color="currentColor"
          :update-color="updateColor"
        />
      </div>
    </BaseCard>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { BaseCard } from '@components/ui'
  import BaseTabs from '@components/ui/BaseTabs.vue'
  import ColorAdjustments from './ColorAdjustments.vue'
  import ColorTemperature from './ColorTemperature.vue'
  import ColorMixing from './ColorMixing.vue'
  import type { RGB } from '../types/color'
  
  const props = defineProps<{ currentColor: RGB, updateColor: (c: RGB) => void }>()
  const activeTab = ref<'adjust' | 'temperature' | 'mix'>('adjust')
  </script>
  