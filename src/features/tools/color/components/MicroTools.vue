<template>
  <BaseCard title="Micro tools">
    <template #header>
      <BaseTabs
        v-model="activeTab"
        :tabs="[
          { value: 'contrast', label: 'Contrast' },
          { value: 'blindness', label: 'Vision' },
          { value: 'gradient', label: 'Gradient' },
          { value: 'info', label: 'Info' }
        ]"
      />
    </template>

    <!-- Contrast -->
    <div v-if="activeTab === 'contrast'" class="space-y-4">
      <div class="space-y-3">
        <BaseLabel class="text-sm font-medium">Contrast checker</BaseLabel>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded border border-border" :style="{ backgroundColor: convertColor(currentSafe).hex }" />
          <span class="text-sm">vs</span>
          <div class="w-8 h-8 rounded border cursor-pointer" :style="{ backgroundColor: convertColor(contrastBg).hex }" />
          <BaseInput
            :value="convertColor(contrastBg).hex"
            @input="(e) => setContrastBg(convertColor((e.target as HTMLInputElement).value).rgb)"
            placeholder="#ffffff"
            class="flex-1"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm">Contrast Ratio:</span>
            <span class="font-mono text-sm">{{ contrastRatio.toFixed(2) }}:1</span>
          </div>

          <div class="flex items-center gap-2">
            <BaseBadge :class="`${contrastLevel.color} text-white`">{{ contrastLevel.level }}</BaseBadge>
            <span class="text-xs text-muted-foreground">WCAG {{ contrastLevel.level === 'Fail' ? 'Non-compliant' : 'Compliant' }}</span>
          </div>
        </div>

        <div
          class="p-4 rounded border text-center"
          :style="{ backgroundColor: convertColor(contrastBg).hex, color: convertColor(currentSafe).hex }"
        >
          Sample Text Preview
        </div>
      </div>
    </div>

    <!-- Vision -->
    <div v-else-if="activeTab === 'blindness'" class="space-y-4">
      <div class="space-y-3">
        <BaseLabel class="text-sm font-medium">Color blindness simulation</BaseLabel>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Eye class="h-4 w-4" />
              <span class="text-sm">Normal</span>
            </div>
            <div
              class="w-full h-12 rounded border cursor-pointer"
              :style="{ backgroundColor: convertColor(currentSafe).hex }"
              @click="onColorSelect(currentSafe)"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <EyeOff class="h-4 w-4" />
              <span class="text-sm">Protanopia</span>
            </div>
            <div
              class="w-full h-12 rounded border cursor-pointer"
              :style="{ backgroundColor: convertColor(protanopia).hex }"
              @click="onColorSelect(protanopia)"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <EyeOff class="h-4 w-4" />
              <span class="text-sm">Deuteranopia</span>
            </div>
            <div
              class="w-full h-12 rounded border cursor-pointer"
              :style="{ backgroundColor: convertColor(deuteranopia).hex }"
              @click="onColorSelect(deuteranopia)"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <EyeOff class="h-4 w-4" />
              <span class="text-sm">Tritanopia</span>
            </div>
            <div
              class="w-full h-12 rounded border cursor-pointer"
              :style="{ backgroundColor: convertColor(tritanopia).hex }"
              @click="onColorSelect(tritanopia)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Gradient -->
    <div v-else-if="activeTab === 'gradient'" class="space-y-4">
      <div class="space-y-3">
        <BaseLabel class="text-sm font-medium">Gradient generator</BaseLabel>

        <div class="space-y-2">
          <BaseLabel class="text-xs">End color</BaseLabel>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded border cursor-pointer" :style="{ backgroundColor: convertColor(gradientEnd).hex }" />
            <BaseInput
              :value="convertColor(gradientEnd).hex"
              @input="(e) => setGradientEnd(convertColor((e.target as HTMLInputElement).value).rgb)"
              placeholder="#ff0000"
              class="flex-1"
            />
          </div>
        </div>

        <div class="space-y-2">
          <BaseLabel class="text-sm font-medium">Steps: {{ gradientSteps }}</BaseLabel>
          <BaseSlider
            :model-value="[gradientSteps]"
            @update:modelValue="v => setGradientSteps(v[0])"
            :min="3" :max="10" :step="1"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <BaseLabel class="text-sm">Preview</BaseLabel>
            <BaseButton size="sm" variant="outline" @click="copyGradientCSS">
              <Copy class="h-4 w-4 mr-1" /> CSS
            </BaseButton>
          </div>

          <div
            class="w-full h-12 rounded border"
            :style="{
              background: `linear-gradient(90deg, ${
                gradientColors.map((color, index) => {
                  const percentage = (index / (gradientColors.length - 1)) * 100;
                  return `${convertColor(color).hex} ${percentage}%`;
                }).join(', ')
              })`
            }"
          />
        </div>

        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="(color, index) in gradientColors"
            :key="index"
            class="w-full h-8 rounded border cursor-pointer"
            :style="{ backgroundColor: convertColor(color).hex }"
            @click="onColorSelect(color)"
          />
        </div>
      </div>
    </div>

    <!-- Info -->
    <div v-else class="space-y-4">
      <div class="space-y-3">
        <BaseLabel class="text-sm font-medium">Color information</BaseLabel>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Color name:</span>
            <span class="text-sm font-medium">{{ colorName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Luminance:</span>
            <span class="text-sm font-medium">{{ luminance.toFixed(3) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Readable text color:</span>
            <span class="text-sm font-medium">{{ convertColor(readableTextColor).hex }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseButton, BaseInput, BaseLabel, BaseBadge, BaseSlider } from '@components/ui'
import BaseTabs from '@components/ui/BaseTabs.vue'
import { Eye, EyeOff, Copy } from 'lucide-vue-next'
import { convertColor, simulateColorBlindness, getContrastRatio, getColorName, getLuminance, getReadableTextColor } from '@color/composables/useColor'
import type { RGB } from '@color/types/color'

const props = defineProps<{ currentColor: RGB, onColorSelect: (color: RGB) => void }>()
const activeTab = ref<'contrast' | 'blindness' | 'gradient' | 'info'>('contrast')

// Safe current color (guards against undefined)
const currentSafe = computed<RGB>(() =>
  props.currentColor && typeof props.currentColor.r === 'number'
    ? props.currentColor
    : { r: 0, g: 0, b: 0 }
)

const colorName = computed(() => getColorName(currentSafe.value))
const luminance = computed(() => getLuminance(currentSafe.value))
const readableTextColor = computed(() => getReadableTextColor(currentSafe.value))

// Contrast
const contrastBg = ref<RGB>({ r: 255, g: 255, b: 255 })
const contrastRatio = computed(() => getContrastRatio(currentSafe.value, contrastBg.value))
const contrastLevel = computed(() => {
  const ratio = contrastRatio.value
  if (ratio >= 7) return { level: 'AAA', color: 'bg-green-600' }
  if (ratio >= 4.5) return { level: 'AA', color: 'bg-emerald-600' }
  if (ratio >= 3) return { level: 'AA Large', color: 'bg-amber-600' }
  return { level: 'Fail', color: 'bg-red-600' }
})
const setContrastBg = (rgb: RGB) => { contrastBg.value = rgb }

// Vision
const protanopia = computed(() => simulateColorBlindness(currentSafe.value, 'protanopia'))
const deuteranopia = computed(() => simulateColorBlindness(currentSafe.value, 'deuteranopia'))
const tritanopia = computed(() => simulateColorBlindness(currentSafe.value, 'tritanopia'))

// Gradient
const gradientEnd = ref<RGB>({ r: 255, g: 0, b: 0 })
const gradientSteps = ref(5)
const setGradientEnd = (rgb: RGB) => { gradientEnd.value = rgb }
const setGradientSteps = (n: number) => { gradientSteps.value = n }
const gradientColors = computed<RGB[]>(() => {
  const start = currentSafe.value
  const end = gradientEnd.value
  const steps = Math.max(3, Math.min(10, Math.round(gradientSteps.value)))
  const colors: RGB[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    colors.push({
      r: Math.round(start.r + (end.r - start.r) * t),
      g: Math.round(start.g + (end.g - start.g) * t),
      b: Math.round(start.b + (end.b - start.b) * t),
    })
  }
  return colors
})
const copyGradientCSS = async () => {
  const css = `linear-gradient(90deg, ${
    gradientColors.value.map((color, index) => {
      const percentage = (index / (gradientColors.value.length - 1)) * 100
      return `${convertColor(color).hex} ${percentage}%`
    }).join(', ')
  })`
  await navigator.clipboard.writeText(css)
}

const onColorSelect = (c: RGB) => props.onColorSelect(c)
</script>
