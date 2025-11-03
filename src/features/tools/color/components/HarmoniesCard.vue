<template>
  <BaseCard>

    <template #head>
      <SegmentedControl
        v-model="tab"
        :options="tabs"
        :max-visible="2" />
    </template>

    <template #header>
      <BaseButton
        v-tippy="{ content: 'Export to JSON' }"
        size="icon"
        variant="outline"
        aria-label="Export harmony colors"
        @click="handleExport">
        <Download class="size-4" />
      </BaseButton>
    </template>

    <ColorHarmonies
      :current="current"
      :active="tab"
      :on-select="onSelect"
      @update:active="(val: Harmonies) => (tab = val)" />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseCard, BaseButton } from '@components/ui'
import SegmentedControl from '@components/ui/SegmentedControl.vue'
import ColorHarmonies from './ColorHarmonies.vue'
import { useColorExport } from '../composables/useColorExport'
import { useColorHarmonies } from '../composables/useColorHarmonies'
import { type RGB } from '@color/lib/color'
import { Download } from 'lucide-vue-next'

type Harmonies = 'complementary' | 'triadic' | 'analogous' | 'monochromatic'

const props = defineProps<{
  current: RGB
  tabs: { value: string; label: string }[]
  onSelect: (c: any) => void
}>()

const tab = defineModel<Harmonies>('tab', { default: 'complementary' })

const { exportHarmonyColors } = useColorExport()

const harmonies = useColorHarmonies(() => props.current)

const activeHarmonyColors = computed(() => {
  switch (tab.value) {
    case 'complementary': return [props.current, harmonies.complementaryColor.value]
    case 'triadic': return harmonies.triadicColors.value
    case 'analogous': return harmonies.analogousColors.value
    case 'monochromatic': return harmonies.monochromaticColors.value
    default: return [props.current]
  }
})

const handleExport = () => {
  const activeColors = activeHarmonyColors.value
  exportHarmonyColors(tab.value, props.current, activeColors)
}
</script>
