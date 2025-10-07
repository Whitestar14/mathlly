<template>
  <BaseCard>
    <!-- Head: left = controls label, right = actions -->
    <template #head>
      <div class="flex items-center gap-2">
        <BaseLabel class="text-sm font-medium">
          Gradient generator
        </BaseLabel>
        <span
          class="mx-1 h-[10px] w-px bg-border/60"
          aria-hidden="true"
        />
        <span class="text-xs text-muted-foreground">Linear</span>
      </div>
    </template>

    <template #header>
      <div class="flex items-center gap-2">
        <BaseButton
          v-tippy="{ content: 'Copy linear-gradient CSS to clipboard' }"
          size="sm"
          variant="outline"
          aria-label="Copy CSS"
          @click="copyGradientCSS"
        >
          Copy CSS
        </BaseButton>
        <BaseButton
          v-tippy="{ content: 'Export gradient swatches (JSON)' }"
          size="sm"
          variant="outline"
          aria-label="Export swatches"
          @click="exportSwatches"
        >
          Export JSON
        </BaseButton>
      </div>
    </template>

    <!-- Body with preview always visible -->
    <div class="space-y-6">
      <!-- Always visible preview section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <BaseLabel class="text-sm font-medium">
            Live preview
          </BaseLabel>
          <span class="text-xs text-muted-foreground">{{ angle }}° • {{ gradientSteps }} steps</span>
        </div>

        <div
          v-tippy="{ content: gradientCss, placement: 'top' }"
          class="w-full h-20 rounded-lg border border-border overflow-hidden relative"
          :style="{ background: gradientCss }"
          aria-label="Gradient preview"
        >
          <!-- Compact swatch strip overlay -->
          <div class="absolute bottom-2 left-2 right-2 flex gap-1 justify-center">
            <button
              v-for="(color, index) in gradientColors"
              :key="index"
              v-tippy="{ content: `${rgbToHex(color)} (Stop ${index + 1})`, placement: 'top' }"
              class="w-6 h-6 rounded border border-white/50 shadow-sm cursor-pointer transition-all hover:scale-110 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              :style="{ backgroundColor: rgbToHex(color) }"
              :aria-label="`Stop ${index + 1}: ${rgbToHex(color)}`"
              @click="onStopClick(color)"
            />
          </div>
        </div>
      </div>

      <!-- Organized sections with accordions -->
      <BaseAccordion
        :multiple="true"
        :default-value="['colors','settings']"
        class="space-y-0"
      >
        <!-- Color Controls - Primary interaction -->
        <AccordionItem
          id="colors"
          title="Color controls"
        >
          <div class="space-y-4">
      <!-- Start/End color pickers -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Start color -->
        <div class="space-y-2">
                <BaseLabel class="text-xs">
                  Start color
                </BaseLabel>
                <div class="flex items-center w-full gap-2">
                  <Swatch
                    :color="startRgb"
                    class="flex-none w-8 h-8"
                    @click="onStartColorSelect(startRgb)"
                  />
            <BaseInput
                    v-model="hexStart"
                    v-tippy="{ content: 'Type hex (e.g. #22c55e) or use the picker' }"
                    class="w-full md:w-40"
                    placeholder="#22c55e"
              aria-label="Start color hex"
            />
            <BaseColorPicker v-model="startRgba" />
          </div>
        </div>

        <!-- End color -->
        <div class="space-y-2">
                <BaseLabel class="text-xs">
                  End color
                </BaseLabel>
                <div class="flex items-center w-full gap-2">
                  <Swatch
                    :color="endRgb"
                    class="flex-none w-8 h-8"
                    @click="onEndColorSelect(endRgb)"
                  />
            <BaseInput
                    v-model="hexEnd"
                    v-tippy="{ content: 'Type hex (e.g. #ef4444) or use the picker' }"
                    class="w-full md:w-40"
                    placeholder="#ef4444"
              aria-label="End color hex"
            />
            <BaseColorPicker v-model="endRgba" />
          </div>
        </div>
      </div>
          </div>
        </AccordionItem>

        <!-- Gradient Settings - Secondary controls -->
        <AccordionItem
          id="settings"
          title="Advanced settings"
        >
          <div class="space-y-6">
      <!-- Steps + Angle controls -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Steps -->
        <div class="space-y-3">
                <div class="flex items-center gap-2 justify-between">
                  <BaseLabel class="text-sm font-medium">
                    Steps
                  </BaseLabel>
              <BaseInput
                    v-model="gradientSteps"
                    v-tippy="{ content: 'Number of color stops (3-12)' }"
                type="number"
                    class="w-24"
                    min="3"
                    max="12"
                    placeholder="3-12"
                    aria-label="Gradient steps (3-12)"
                  />
          </div>
          <BaseSlider
            :model-value="[gradientSteps]"
            :min="MIN_STEPS"
            :max="MAX_STEPS"
            :step="1"
            class="w-full"
                  @update:model-value="(v: number[]) => setGradientSteps(v[0])"
          />
                <p class="text-xs text-muted-foreground">
                  Controls how many color stops are generated
                </p>
        </div>

        <!-- Angle -->
        <div class="space-y-3">
                <div class="flex items-center gap-2 justify-between">
                  <BaseLabel class="text-sm font-medium">
                    Angle
                  </BaseLabel>
            <BaseInput
                    v-model="angle"
                    v-tippy="{ content: 'Linear gradient angle in degrees (0-360)' }"
              type="number"
                    class="w-24"
                    min="0"
                    max="360"
                    placeholder="0-360°"
                    aria-label="Gradient angle (0-360°)"
            />
          </div>
          <BaseSlider
            :model-value="[angle]"
            :min="0"
            :max="360"
            :step="1"
            class="w-full"
                  @update:model-value="(v: number[]) => setAngle(v[0])"
          />
                <p class="text-xs text-muted-foreground">
                  Direction of the gradient in degrees
                </p>
        </div>
      </div>
        </div>
        </AccordionItem>
      </BaseAccordion>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseCard, BaseButton, BaseInput, BaseLabel, BaseSlider, BaseAccordion, AccordionItem } from '@components/ui'
import BaseColorPicker from '@shared/components/ui/BaseColorPicker.vue'
import Swatch from './Swatch.vue'
import { useToast } from '@composables/ui/useToast'
import type { RGB, RGBA } from '@color/lib/color'

const props = defineProps<{
  currentColor: RGBA
  onColorSelect: (c: RGB & { a?: number }) => void
}>()

const { toast } = useToast()

// Bounds
const MIN_STEPS = 3
const MAX_STEPS = 12

// Single source of truth: RGBA
const startRgba = ref<RGBA>({
  r: props.currentColor.r,
  g: props.currentColor.g,
  b: props.currentColor.b,
  a: props.currentColor.a ?? 1
})
const endRgba = ref<RGBA>({ r: 255, g: 0, b: 0, a: 1 })

// Derive RGB live from RGBA (swatches update instantly)
const startRgb = computed<RGB>(() => ({ r: startRgba.value.r, g: startRgba.value.g, b: startRgba.value.b }))
const endRgb = computed<RGB>(() => ({ r: endRgba.value.r, g: endRgba.value.g, b: endRgba.value.b }))

// Hex bindings with get/set for v-model (keep single source of truth)
const hexStart = computed<string>({
  get: () => rgbToHex(startRgb.value),
  set: (val: string) => {
    const parsed = hexToRgbSafe(val)
    if (parsed) startRgba.value = { ...parsed, a: startRgba.value.a ?? 1 }
  }
})
const hexEnd = computed<string>({
  get: () => rgbToHex(endRgb.value),
  set: (val: string) => {
    const parsed = hexToRgbSafe(val)
    if (parsed) endRgba.value = { ...parsed, a: endRgba.value.a ?? 1 }
  }
})

// Keep start in sync with page-level current color
watch(
  () => props.currentColor,
  (c) => {
    startRgba.value = { r: c.r, g: c.g, b: c.b, a: c.a ?? startRgba.value.a ?? 1 }
  },
  { deep: true }
)

// Steps and angle
const gradientSteps = ref<number>(5)
const angle = ref<number>(90)
const setGradientSteps = (n: number) => { gradientSteps.value = clamp(n, MIN_STEPS, MAX_STEPS) }
const setAngle = (n: number) => { angle.value = clamp(n, 0, 360) }

// Gradient stops
const gradientColors = computed<RGB[]>(() => {
  const start = startRgb.value
  const end = endRgb.value
  const steps = clamp(gradientSteps.value, MIN_STEPS, MAX_STEPS)
  const out: RGB[] = []
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1)
    out.push({
      r: Math.round(start.r + (end.r - start.r) * t),
      g: Math.round(start.g + (end.g - start.g) * t),
      b: Math.round(start.b + (end.b - start.b) * t),
    })
  }
  return out.map(clampRgb)
})

const gradientCss = computed(() => {
  const stops = gradientColors.value
    .map((color, index) => `${rgbToHex(color)} ${(index / (gradientColors.value.length - 1)) * 100}%`)
    .join(', ')
  return `linear-gradient(${angle.value}deg, ${stops})`
})

// Export swatches to JSON
const exportSwatches = () => {
  const swatchData = {
    gradient: {
      startColor: rgbToHex(startRgb.value),
      endColor: rgbToHex(endRgb.value),
      steps: gradientSteps.value,
      angle: angle.value,
      colors: gradientColors.value.map(rgbToHex)
    },
    metadata: { exportedAt: new Date().toISOString(), type: 'linear-gradient' }
  }
  const blob = new Blob([JSON.stringify(swatchData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gradient-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast({ title: 'Exported!', description: 'Gradient swatches exported to JSON' })
}

// Actions
const copyGradientCSS = async () => {
  try {
  await navigator.clipboard.writeText(gradientCss.value)
    toast({ title: 'Copied!', description: 'Gradient CSS copied to clipboard' })
  } catch {
    toast({ title: 'Error', description: 'Failed to copy CSS to clipboard', type: 'error' })
  }
}

const onStopClick = (c: RGB) => {
  // Promote clicked stop into start color and notify page
  startRgba.value = { ...c, a: startRgba.value.a ?? 1 }
  props.onColorSelect({ ...c, a: startRgba.value.a })
}
const onStartColorSelect = (c: RGB) => {
  startRgba.value = { ...c, a: startRgba.value.a ?? 1 }
  props.onColorSelect({ ...c, a: startRgba.value.a })
}
const onEndColorSelect = (c: RGB) => {
  endRgba.value = { ...c, a: endRgba.value.a ?? 1 }
}

// Utils
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)))
}
function clampRgb(c: RGB): RGB {
  return { r: clamp(c.r, 0, 255), g: clamp(c.g, 0, 255), b: clamp(c.b, 0, 255) }
}
function toHexByte(n: number) { return clamp(n, 0, 255).toString(16).padStart(2, '0') }
function rgbToHex(c: RGB) { return `#${toHexByte(c.r)}${toHexByte(c.g)}${toHexByte(c.b)}` }
function hexToRgbSafe(hex: string): RGB | null {
  const clean = hex.trim().replace(/^#/, '')
  const full = clean.length === 3 ? clean.split('').map(x => x + x).join('') : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return { r, g, b }
}
</script>
