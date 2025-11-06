<template>
  <Transition name="fade" mode="out-in">
    <div v-if="enableVisualizations && visualizations && visualizations.length > 0" class="flex flex-initial flex-row gap-2">
      <div
        v-for="(visualization, index) in visualizations"
        :key="index"
        class="flex items-center gap-2 text-xs leading-tight text-muted-foreground bg-muted/20 rounded"
        :aria-label="'Conversion visualization ' + (index + 1)"
        :title="'Conversion visualization: ' + visualization">
        <component :is="iconComponent" class="h-4 w-4 flex-shrink-0" />
        <span class="flex-1">
          <span v-if="getMultiplier(visualization)" class="font-bold font-mono">{{ getMultiplier(visualization) }}</span> {{ getRest(visualization) }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Info, Thermometer, Ruler, Weight, Code } from 'lucide-vue-next'
import type { ConverterType } from '../types/converter'
import { useConverterOptions } from '@converter/composables'

interface Props {
  visualizations: string[] | undefined
  converterType: ConverterType
}

const props = defineProps<Props>()
const { enableVisualizations } = useConverterOptions()

const getMultiplier = (visualization: string): string => {
  const match = visualization.match(/^([\d.]+×)/)
  return match ? match[1] : ''
}

const getRest = (visualization: string): string => {
  return visualization.replace(/^[\d.]+×\s*/, '')
}

const iconComponent = computed(() => {
  switch (props.converterType) {
    case 'temperature':
      return Thermometer
    case 'length':
      return Ruler
    case 'weight':
      return Weight
    case 'css-units':
      return Code
    default:
      return Info
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
