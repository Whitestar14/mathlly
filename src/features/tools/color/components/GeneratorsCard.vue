<template>
    <BaseCard title="Generators">
      <BaseLabel class="text-sm font-medium">Gradient generator</BaseLabel>
  
      <!-- End color input -->
      <div class="space-y-2 mt-2">
        <BaseLabel class="text-xs">End color</BaseLabel>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded border" :style="{ backgroundColor: convertColor(gradientEnd).hex }" />
          <BaseInput
            :value="convertColor(gradientEnd).hex"
            @input="(e) => setGradientEnd(convertColor((e.target as HTMLInputElement).value).rgb)"
            placeholder="#ff0000"
            class="flex-1"
          />
        </div>
      </div>
  
      <!-- Steps slider -->
      <div class="space-y-2 mt-4">
        <BaseLabel class="text-sm font-medium">Steps: {{ gradientSteps }}</BaseLabel>
        <BaseSlider
          :model-value="[gradientSteps]"
          @update:modelValue="v => setGradientSteps(v[0])"
          :min="3" :max="10" :step="1"
          class="w-full"
        />
      </div>
  
      <!-- Preview -->
      <div class="space-y-2 mt-4">
        <div class="flex items-center justify-between">
          <BaseLabel class="text-sm">Preview</BaseLabel>
          <BaseButton size="sm" variant="outline" @click="copyGradientCSS">Copy CSS</BaseButton>
        </div>
        <div class="w-full h-12 rounded border" :style="{ background: gradientCss }" />
      </div>
  
      <!-- Gradient swatches -->
      <div class="grid grid-cols-5 gap-2 mt-4">
        <div
          v-for="(color, index) in gradientColors"
          :key="index"
          class="w-full h-8 rounded border cursor-pointer"
          :style="{ backgroundColor: convertColor(color).hex }"
          @click="onColorSelect(color)"
        />
      </div>
    </BaseCard>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { BaseCard, BaseButton, BaseInput, BaseLabel, BaseSlider } from '@components/ui'
  import { convertColor } from '@features/tools/color/composables/useColor.deprecated'
  import type { RGB } from '@color/types/color'
  
  const props = defineProps<{ currentColor: RGB, onColorSelect: (c: RGB) => void }>()
  
  const gradientEnd = ref<RGB>({ r: 255, g: 0, b: 0 })
  const gradientSteps = ref(5)
  
  const setGradientEnd = (rgb: RGB) => { gradientEnd.value = rgb }
  const setGradientSteps = (n: number) => { gradientSteps.value = n }
  
  const gradientColors = computed<RGB[]>(() => {
    const start = props.currentColor
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
  
  const gradientCss = computed(() =>
    `linear-gradient(90deg, ${
      gradientColors.value.map((color, index) => {
        const percentage = (index / (gradientColors.value.length - 1)) * 100
        return `${convertColor(color).hex} ${percentage}%`
      }).join(', ')
    })`
  )
  
  const copyGradientCSS = async () => {
    await navigator.clipboard.writeText(gradientCss.value)
  }
  
  const onColorSelect = (c: RGB) => props.onColorSelect(c)
  </script>
  