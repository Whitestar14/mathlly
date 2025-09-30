<template>
  <BaseCard title="Accessibility Tools">
    <BaseTabs
      v-model="activeTab"
      :tabs="[
        { value: 'contrast', label: 'Contrast' },
        { value: 'vision', label: 'Vision' }
      ]"
    />

    <div class="mt-4">
      <!-- Contrast Checker -->
      <div v-if="activeTab === 'contrast'" class="space-y-4">
        <BaseLabel class="text-sm font-medium">Contrast checker</BaseLabel>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded border" :style="{ backgroundColor: convertColor(currentSafe).hex }" />
          <span class="text-sm">vs</span>
          <div class="w-8 h-8 rounded border" :style="{ backgroundColor: convertColor(contrastBg).hex }" />
          <BaseInput
            :value="convertColor(contrastBg).hex"
            @input="(e) => setContrastBg(convertColor((e.target as HTMLInputElement).value).rgb)"
            placeholder="#ffffff"
            class="flex-1"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Contrast Ratio:</span>
          <span class="font-mono text-sm">{{ contrastRatio.toFixed(2) }}:1</span>
        </div>
        <div class="flex items-center gap-2">
          <BaseBadge :variant="contrastLevel.variant" :text="contrastLevel.text" />
          <span class="text-xs text-muted-foreground">
            WCAG {{ contrastLevel.text === 'Fail' ? 'Non-compliant' : 'Compliant' }}
          </span>
        </div>
        <div
          class="p-4 rounded border text-center"
          :style="{ backgroundColor: convertColor(contrastBg).hex, color: convertColor(currentSafe).hex }"
        >
          Sample Text Preview
        </div>
      </div>

      <!-- Vision Simulation -->
      <div v-else class="grid grid-cols-2 gap-3">
        <div v-for="sim in simulations" :key="sim.label" class="space-y-2">
          <div class="flex items-center gap-2">
            <component :is="sim.icon" class="h-4 w-4" />
            <span class="text-sm">{{ sim.label }}</span>
          </div>
          <div
            class="w-full h-12 rounded border cursor-pointer"
            :style="{ backgroundColor: convertColor(sim.color).hex }"
            @click="onColorSelect(sim.color)"
          />
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseInput, BaseLabel, BaseBadge } from '@components/ui'
import BaseTabs from '@components/ui/BaseTabs.vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { convertColor, simulateColorBlindness, getContrastRatio } from '@color/lib/color'
import type { RGB } from '@color/lib/color'
import type { BadgeVariant } from '@composables/ui/useBadge'

const props = defineProps<{ currentColor: RGB, onColorSelect: (c: RGB) => void }>()
const activeTab = ref<'contrast' | 'vision'>('contrast')

const currentSafe = computed<RGB>(() => props.currentColor ?? { r: 0, g: 0, b: 0 })

// Contrast
const contrastBg = ref<RGB>({ r: 255, g: 255, b: 255 })
const contrastRatio = computed(() => getContrastRatio(currentSafe.value, contrastBg.value))
const contrastLevel = computed((): { variant: BadgeVariant; text: string } => {
  const ratio = contrastRatio.value
  if (ratio >= 7) return { variant: 'success', text: 'AAA' }
  if (ratio >= 4.5) return { variant: 'info', text: 'AA' }
  if (ratio >= 3) return { variant: 'warning', text: 'AA Large' }
  return { variant: 'alpha', text: 'Fail' }
})
const setContrastBg = (rgb: RGB) => { contrastBg.value = rgb }

// Vision
const simulations = computed(() => [
  { label: 'Normal', icon: Eye, color: currentSafe.value },
  { label: 'Protanopia', icon: EyeOff, color: simulateColorBlindness(currentSafe.value, 'protanopia') },
  { label: 'Deuteranopia', icon: EyeOff, color: simulateColorBlindness(currentSafe.value, 'deuteranopia') },
  { label: 'Tritanopia', icon: EyeOff, color: simulateColorBlindness(currentSafe.value, 'tritanopia') },
])
const onColorSelect = (c: RGB) => props.onColorSelect(c)
</script>