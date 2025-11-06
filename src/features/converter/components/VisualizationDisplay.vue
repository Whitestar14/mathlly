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
      <div v-if="showLastUpdate && lastUpdateTime" class="mt-1 text-xs text-muted-foreground/70">
        <Clock class="h-3 w-3 inline mr-1" />
        Rates updated: {{ lastUpdateTime }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Info, Thermometer, Ruler, Weight, Code, Clock } from 'lucide-vue-next'
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

const lastUpdateTimestamp = ref<number | null>(null)

const showLastUpdate = computed(() => {
  return props.converterType === 'currency' && props.visualizations && props.visualizations.length > 0
})

const lastUpdateTime = computed(() => {
  if (!lastUpdateTimestamp.value) return null
  return new Date(lastUpdateTimestamp.value).toLocaleString()
})

watch(() => props.converterType, async newType => {
  if (newType === 'currency') {
    const { currencyService } = await import('@converter/services/converters/currency')
    lastUpdateTimestamp.value = currencyService.getLastUpdate()
  } else {
    lastUpdateTimestamp.value = null
  }
}, { immediate: true })
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
