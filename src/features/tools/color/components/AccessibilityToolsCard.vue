<template>
  <BaseCard title="Accessibility Tools">
    <SegmentedControl
      v-model="activeTab"
      :options="[
        { value: 'contrast', label: 'Contrast' },
        { value: 'vision', label: 'Vision' }
      ]" />

    <div class="mt-4">

      <div
        v-if="activeTab === 'contrast'"
        class="space-y-4">
        <BaseLabel class="text-sm font-medium">
          Contrast checker
        </BaseLabel>
        <div class="flex items-center gap-2">
          <div class="flex flex-row gap-1">
            <div
              class="size-6 rounded border"
              :style="{ backgroundColor: convertColor(currentSafe).hex }"></div>
            <span class="text-sm">vs</span>
            <div
              class="size-6 rounded border"
              :style="{ backgroundColor: convertColor(contrastBg).hex }"></div>
          </div>
          <InputGroup
            v-model="colorInput"
            v-model:dropdown-value="selectedFormat"
            :options="formatOptions"
            :error="inputError"
            :placeholder="placeholderForFormat"
            dropdown-label="Input format"
            dropdown-placeholder="Auto"
            class="flex-1"
            @focus="onFocus"
            @blur="onBlur"
            @input="onTyping"
            @keydown.enter="onEnter" />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Contrast Ratio:</span>
          <span class="font-mono text-sm">{{ contrastRatio.toFixed(2) }}:1</span>
        </div>
        <div class="flex items-center gap-2">
          <BaseBadge
            :variant="contrastLevel.variant"
            :text="contrastLevel.text" />
          <span class="text-xs text-muted-foreground">
            WCAG {{ contrastLevel.text === 'Fail' ? 'Non-compliant' : 'Compliant' }}
          </span>
        </div>
        <div
          class="p-4 rounded border border-border flex justify-center items-center"
          :style="{ backgroundColor: convertColor(contrastBg).hex }">
          <textarea
            v-model="sampleText"
            dir="ltr"
            :style="{ color: convertColor(currentSafe).hex }"
            class="text-center w-full h-5 resize-none focus:ring-0 bg-transparent outline-none"
            @blur="onPreviewBlur"></textarea>
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-2 gap-3">
        <div
          v-for="sim in simulations"
          :key="sim.label"
          class="space-y-2">
          <div class="flex items-center gap-2">
            <component
              :is="sim.icon"
              class="size-4" />
            <span class="text-sm">{{ sim.label }}</span>
          </div>
          <div
            class="w-full h-12 rounded border cursor-pointer"
            :style="{ backgroundColor: convertColor(sim.color).hex }"
            @click="onColorSelect(sim.color)"></div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SegmentedControl from '@components/ui/SegmentedControl.vue'
import { BaseCard, BaseLabel, BaseBadge, InputGroup } from '@components/ui'
import { Eye, EyeOff } from 'lucide-vue-next'
import { convertColor, simulateColorBlindness, getContrastRatio } from '@color/lib/color'
import type { RGB, RGBA } from '@color/lib/color'
import type { BadgeVariant } from '@composables/ui/useBadge'
import { useColorInput } from '@color/composables/useColorInput'

const props = defineProps<{ currentColor: RGB, onColorSelect: (c: RGB) => void }>()
const activeTab = ref<'contrast' | 'vision'>('contrast')
const sampleText = ref('Sample Text Preview')

const defaultText = 'Sample Text Preview'

function onPreviewBlur() {
  if (!sampleText.value.trim()) {
    sampleText.value = defaultText
  }
}

const currentSafe = computed<RGB>(() => props.currentColor ?? { r: 0, g: 0, b: 0 })

const contrastBg = ref<RGB>({ r: 255, g: 255, b: 255 })
const contrastRatio = computed(() => getContrastRatio(currentSafe.value, contrastBg.value))
const contrastLevel = computed((): { variant: BadgeVariant; text: string } => {
  const ratio = contrastRatio.value
  if (ratio >= 7) return { variant: 'success', text: 'AAA' }
  if (ratio >= 4.5) return { variant: 'info', text: 'AA' }
  if (ratio >= 3) return { variant: 'warning', text: 'AA Large' }
  return { variant: 'destructive', text: 'Fail' }
})

const contrastBgRgba = computed(() => ({ ...contrastBg.value, a: 1 }))
const { selectedFormat, colorInput, inputError, placeholderForFormat, formatOptions, onFocus, onBlur, onEnter, onTyping } = useColorInput(contrastBgRgba, (c: RGBA) => { contrastBg.value = { r: c.r, g: c.g, b: c.b } })

const simulations = computed(() => [
  { label: 'Normal', icon: Eye, color: currentSafe.value },
  { label: 'Protanopia', icon: EyeOff, color: simulateColorBlindness(currentSafe.value, 'protanopia') },
  { label: 'Deuteranopia', icon: EyeOff, color: simulateColorBlindness(currentSafe.value, 'deuteranopia') },
  { label: 'Tritanopia', icon: EyeOff, color: simulateColorBlindness(currentSafe.value, 'tritanopia') }
])
const onColorSelect = (c: RGB) => props.onColorSelect(c)
</script>