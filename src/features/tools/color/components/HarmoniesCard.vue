<template>
  <BaseCard>
    <!-- Head: segmented control for harmony type -->
    <template #head>
      <SegmentedControl
        v-model="tab"
        :options="tabs"
        :max-visible="2"
      />
    </template>

    <!-- Body: active harmony swatches -->
    <ColorHarmonies
      :current="current"
      :active="tab"
      @update:active="(val: Harmonies) => (tab = val)"
      :onSelect="onSelect"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard } from '@components/ui'
import SegmentedControl from '@components/ui/SegmentedControl.vue'
import ColorHarmonies from './ColorHarmonies.vue'

type Harmonies = 'complementary' | 'triadic' | 'analogous' | 'monochromatic'

// v-model for active harmony
const tab = defineModel<Harmonies>('tab', { default: 'complementary' })

defineProps<{
  current: any
  tabs: { value: string; label: string }[]
  onSelect: (c: any) => void
}>()
</script>
