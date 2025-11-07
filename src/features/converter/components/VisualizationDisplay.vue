<template>
  <Transition name="fade" mode="out-in">
    <div
      v-if="enableVisualizations && displayVisualizations.length > 0"
      class="visualization-container"
    >
      <div class="text-xs text-muted-foreground mb-1">
        roughly equal to:
      </div>

      <div class="flex flex-wrap items-center gap-3 text-xs leading-tight text-muted-foreground">
        <div
          v-for="(viz, index) in displayVisualizations"
          :key="index"
          class="flex items-center gap-1"
        >
          <!-- Reference icon -->
          <template v-if="viz.type === 'reference'">
            <component
              v-if="getIconData(viz.key).type === 'regular'"
              :is="getIconData(viz.key).data"
              class="size-4 flex-shrink-0"
              aria-hidden="true"
            />
            <Icon
              v-else
              name="Elephant"
              :iconNode="getIconData(viz.key).data"
              class="size-4 flex-shrink-0"
              aria-hidden="true"
            />
          </template>

          <!-- Scientific visualization -->
          <template v-if="viz.type === 'scientific'">
            <span class="font-mono font-semibold text-foreground">
              {{ viz.formattedValue }}
            </span>
            <span v-if="viz.prefix" class="font-mono text-muted-foreground/80">
              {{ viz.prefix }}
            </span>
            <span class="font-mono text-muted-foreground/90">
              {{ viz.unit }}
            </span>
          </template>

          <!-- Reference visualization -->
          <template v-else>
            <span
              v-if="viz.formattedValue !== '≈'"
              class="font-mono font-semibold text-foreground"
            >
              {{ viz.formattedValue }}
            </span>
            <span
              v-if="viz.prefix"
              class="font-mono text-muted-foreground/80"
            >
              {{ viz.prefix }}
            </span>
            <span class="text-muted-foreground/90">
              {{ viz.label }}
            </span>
          </template>

          <span
            v-if="index < displayVisualizations.length - 1"
            class="text-muted-foreground/50 mx-1"
          >
            •
          </span>
        </div>
      </div>

      <!-- Currency update timestamp -->
      <div v-if="showLastUpdate && lastUpdateTime" class="mt-1 text-xs text-muted-foreground/70">
        <Clock class="h-3 w-3 inline mr-1" />
        Rates updated: {{ lastUpdateTime }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { 
  Icon,
  Thermometer, Dot, Paperclip, Map, Ruler, Clock, Info,
  Snowflake, PersonStanding, Car, Building,
  Mountain, Target, Waves, Globe2,
  Apple, Backpack, Cat, Dog, Piano, Fish, Plane, Rocket, Bomb,
  CloudLightning, SunDim, House
} from 'lucide-vue-next'
import { elephant } from '@lucide/lab'
import type { ConverterType } from '../types/converter'
import type { BaseConverter } from '../services/converters/BaseConverter'
import { useConverterOptions } from '@converter/composables'
import { useConversionVisualization } from '../composables/useConversionVisualization'
import type { VisualizationItem } from '../composables/useConversionVisualization'

interface Props {
  converterType: ConverterType
  converter: BaseConverter | null
  inputValue: string
  fromUnit: string
  toUnit: string
}

const props = defineProps<Props>()
const { enableVisualizations } = useConverterOptions()

const { getVisualization } = useConversionVisualization()

const displayVisualizations = computed<VisualizationItem[]>(() => {
  const numericValue = parseFloat(props.inputValue)
  if (!Number.isFinite(numericValue) || !props.fromUnit || !props.toUnit) return []
  if (numericValue === 0) return []
  return getVisualization(numericValue, props.fromUnit, props.toUnit, props.converterType) || []
})

// Regular lucide-vue-next icons
const ICON_MAP: Record<string, any> = {
  // Temperature
  'antarctic-winter': Snowflake,
  'freezing-cold': Snowflake,
  'freezing-point-of-water': Snowflake,
  'room-temperature': House,
  'body-temperature': PersonStanding,
  'boiling-point-of-water': Thermometer,
  'oven-temperature': Thermometer,
  'suns-surface': SunDim,
  'lightning-bolt': CloudLightning,
  'nuclear-fusion': Bomb,

  // Length
  'grain-of-sand': Dot,
  'sheet-of-paper': Paperclip,
  'pencil-length': Ruler,
  'ruler-length': Ruler,
  'human-height': PersonStanding,
  'car-length': Car,
  'school-bus': Car,
  'football-field': Target,
  'skyscraper': Building,
  'mountain': Mountain,
  'large-lake': Waves,
  'country': Map,
  'continent': Map,
  'earth-diameter': Globe2,

  // Weight
  'grain-of-rice': Ruler,
  'apple': Apple,
  'watermelon': Apple,
  'bag-of-sugar': Backpack,
  'house-cat': Cat,
  'medium-dog': Dog,
  'adult-human': PersonStanding,
  'grand-piano': Piano,
  'small-car': Car,
  'blue-whale': Fish,
  'boeing-747': Plane,
  'space-shuttle': Rocket
}


const LAB_ICON_MAP: Record<string, any> = {
  'elephant': elephant
}

const isLabIcon = (key: string): boolean => {
  return key in LAB_ICON_MAP
}

const getIconData = (key: string) => {
  if (isLabIcon(key)) {
    return { type: 'lab', data: LAB_ICON_MAP[key] }
  }
  return { type: 'regular', data: ICON_MAP[key] || Info }
}

// Currency update tracking
const lastUpdateTimestamp = ref<number | null>(null)

const showLastUpdate = computed(() => {
  return props.converterType === 'currency' && displayVisualizations.value.length > 0
})

const lastUpdateTime = computed(() => {
  if (!lastUpdateTimestamp.value) return null
  return new Date(lastUpdateTimestamp.value).toLocaleString()
})

watch(() => props.converter, (newConverter) => {
  if (newConverter && 'getLastUpdate' in newConverter) {
    lastUpdateTimestamp.value = (newConverter as any).getLastUpdate()
  } else {
    lastUpdateTimestamp.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.visualization-container {
  @apply flex flex-col gap-1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
