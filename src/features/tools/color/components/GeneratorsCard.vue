<template>
  <BaseCard>

    <template #head>
      <div class="flex items-center justify-between w-full gap-3">
        <BaseLabel class="text-sm font-medium">
          Gradient generator
        </BaseLabel>
        <SegmentedControl
          v-model="gradientType"
          :options="[
            { value: 'linear', label: 'Linear' },
            { value: 'radial', label: 'Radial' }
          ]"
          class="flex-shrink-0" />
      </div>
    </template>

    <template #header>
      <div class="flex items-center gap-2">
        <BaseButton
          v-tippy="{ content: 'Copy linear-gradient CSS to clipboard' }"
          size="icon"
          variant="outline"
          aria-label="Copy CSS"
          @click="copyGradientCSS">
          <Copy class="size-4" />
        </BaseButton>
        <BaseButton
          v-tippy="{ content: 'Export gradient swatches (JSON)' }"
          size="icon"
          variant="outline"
          aria-label="Export swatches"
          @click="exportSwatches">
          <Download class="size-4" />
        </BaseButton>
      </div>
    </template>

    <div class="space-y-6">

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <BaseLabel class="text-sm font-medium">
            Live preview
          </BaseLabel>
          <span class="text-xs text-muted-foreground">
            {{ gradientType === 'linear' ? `${angle}° • ${gradientSteps} steps` : `${gradientSteps} steps` }}
          </span>
        </div>

        <div class="bg-checkerboard w-full h-20 rounded-lg border border-border overflow-hidden relative">
          <div
            v-tippy="{ content: gradientCss, placement: 'top' }"
            class="w-full h-full"
            :style="{ background: gradientCss }"
            aria-label="Gradient preview">

            <div class="absolute bottom-2 left-2 right-2 flex gap-1 justify-center">
              <button
                v-for="(color, index) in gradientColors"
                :key="index"
                v-tippy="{ content: `${rgbaToCss(color, color.a)} (Stop ${index + 1})`, placement: 'top' }"
                :class="['w-6 h-6 rounded border border-white/50 shadow-sm cursor-pointer transition-all hover:scale-110 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50', color.a < 1 ? 'bg-checkerboard' : '']"
                :style="{ backgroundColor: rgbaToCss(color, color.a) }"
                :aria-label="`Stop ${index + 1}: ${rgbaToCss(color, color.a)}`"
                @click="onStopClick(color)"></button>
            </div>
          </div>
        </div>
      </div>

      <BaseAccordion
        default-value=""
        :multiple="false"
        class="space-y-0">

        <AccordionItem
          id="colors"
          title="Color controls">
          <div class="space-y-4">

            <div class="flex justify-around px-2 py-1 gap-3 md:gap-2 align-center">

              <div class="space-y-2">
                <BaseLabel class="text-xs">
                  Start color
                </BaseLabel>
                <div class="flex items-center w-full gap-2">
                  <Swatch
                    :color="startRgb"
                    class="flex-none w-6 h-6"
                    @click="onStartColorSelect(startRgb)" />
                  <BaseInput
                    v-model="startColorInputRef"
                    v-tippy="{ content: 'Type hex (e.g. #22c55e) or use the picker' }"
                    :options="[]"
                    :error="startInputError"
                    class="w-full h-8 md:w-36"
                    placeholder="#22c55e"
                    aria-label="Start color hex"
                    @focus="onStartFocus"
                    @blur="onStartBlur"
                    @keydown.enter="onStartEnter"
                    @input="onStartTyping" />
                  <BaseColorPicker v-model="startRgba" />
                </div>
              </div>

              <div class="space-y-2">
                <BaseLabel class="text-xs">
                  End color
                </BaseLabel>
                <div class="flex items-center w-full gap-2">
                  <Swatch
                    :color="endRgb"
                    class="flex-none w-6 h-6"
                    @click="onEndColorSelect(endRgb)" />
                  <BaseInput
                    v-model="endColorInputRef"
                    v-tippy="{ content: 'Type hex (e.g. #ef4444) or use the picker' }"
                    :options="[]"
                    :error="endInputError"
                    class="w-full h-8 md:w-36"
                    placeholder="#ef4444"
                    aria-label="End color hex"
                    @focus="onEndFocus"
                    @blur="onEndBlur"
                    @keydown.enter="onEndEnter"
                    @input="onEndTyping" />
                  <BaseColorPicker v-model="endRgba" />
                </div>
              </div>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          id="settings"
          title="Advanced settings">
          <div class="space-y-6 p-2">

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
                  aria-label="Gradient steps (3-12)" />
              </div>
              <BaseSlider
                :model-value="[gradientSteps]"
                :min="MIN_STEPS"
                :max="MAX_STEPS"
                :step="1"
                class="w-full"
                @update:model-value="(v: number[]) => setGradientSteps(v[0])" />
              <p class="text-xs text-muted-foreground">
                Controls how many color stops are generated
              </p>
            </div>

            <div
              v-if="gradientType === 'linear'"
              class="space-y-3">
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
                  aria-label="Gradient angle (0-360°)" />
              </div>
              <BaseSlider
                :model-value="[angle]"
                :min="0"
                :max="360"
                :step="1"
                class="w-full"
                @update:model-value="(v: number[]) => setAngle(v[0])" />
              <p class="text-xs text-muted-foreground">
                Direction of the gradient in degrees
              </p>
            </div>
          </div>
        </AccordionItem>
      </BaseAccordion>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Copy, Download } from 'lucide-vue-next'
import { BaseCard, BaseButton, BaseInput, BaseLabel, BaseSlider, BaseAccordion, AccordionItem, SegmentedControl } from '@components/ui'
import BaseColorPicker from '@shared/components/ui/BaseColorPicker.vue'
import Swatch from './Swatch.vue'
import { useToast } from '@composables/ui/useToast'
import { useColorExport } from '@color/composables/useColorExport'
import { useColorInput } from '@color/composables/useColorInput'
import type { RGB, RGBA } from '@color/lib/color'

const props = defineProps<{
  currentColor: RGBA
  onColorSelect: (c: RGB & { a: number }) => void
}>()

const { info, error } = useToast()
const { exportGradientColors } = useColorExport()

const MIN_STEPS = 3
const MAX_STEPS = 12

const startRgba = ref<RGBA>({ r: props.currentColor.r, g: props.currentColor.g, b: props.currentColor.b, a: props.currentColor.a ?? 1 })
const endRgba = ref<RGBA>({ r: 255, g: 0, b: 0, a: 1 })

const startRgb = computed<RGB>(() => ({ r: startRgba.value.r, g: startRgba.value.g, b: startRgba.value.b }))
const endRgb = computed<RGB>(() => ({ r: endRgba.value.r, g: endRgba.value.g, b: endRgba.value.b }))

const startColorInput = useColorInput(computed(() => startRgba.value), c => { startRgba.value = c })
const { colorInput: startColorInputRef, inputError: startInputError, onFocus: onStartFocus, onBlur: onStartBlur, onEnter: onStartEnter, onTyping: onStartTyping } = startColorInput

const endColorInput = useColorInput(computed(() => endRgba.value), c => { endRgba.value = c })
const { colorInput: endColorInputRef, inputError: endInputError, onFocus: onEndFocus, onBlur: onEndBlur, onEnter: onEndEnter, onTyping: onEndTyping } = endColorInput

const gradientSteps = ref<number>(5)
const angle = ref<number>(90)
const setGradientSteps = (n: number) => { gradientSteps.value = Math.min(MAX_STEPS, Math.max(MIN_STEPS, Math.round(n))) }
const setAngle = (n: number) => { angle.value = Math.min(360, Math.max(0, Math.round(n))) }

watch(
  () => props.currentColor,
  newColor => {
    startRgba.value = { r: newColor.r, g: newColor.g, b: newColor.b, a: newColor.a ?? 1 }
  },
  { deep: true }
)

const gradientType = ref<'linear' | 'radial'>('linear')

const gradientColors = computed<(RGB & { a: number })[]>(() => {
  const start = startRgba.value
  const end = endRgba.value
  const steps = Math.min(MAX_STEPS, Math.max(MIN_STEPS, gradientSteps.value))
  const out: (RGB & { a: number })[] = []
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1)
    out.push({
      r: Math.round(start.r + (end.r - start.r) * t),
      g: Math.round(start.g + (end.g - start.g) * t),
      b: Math.round(start.b + (end.b - start.b) * t),
      a: Math.round((start.a + (end.a - start.a) * t) * 100) / 100
    })
  }
  return out.map(c => ({
    r: Math.max(0, Math.min(255, Math.round(c.r))),
    g: Math.max(0, Math.min(255, Math.round(c.g))),
    b: Math.max(0, Math.min(255, Math.round(c.b))),
    a: Math.max(0, Math.min(1, c.a))
  }))
})

const gradientCss = computed(() => {
  const stops = gradientColors.value
    .map((color, index) => `${rgbaToCss(color, color.a)} ${(index / (gradientColors.value.length - 1)) * 100}%`)
    .join(', ')

  if (gradientType.value === 'radial') {
    return `radial-gradient(circle, ${stops})`
  }
  return `linear-gradient(${angle.value}deg, ${stops})`
})

const exportSwatches = () => {
  exportGradientColors(startRgba.value, endRgba.value, gradientSteps.value, angle.value, gradientColors.value, gradientType.value)
}

const { copy } = useClipboard()

const copyGradientCSS = async() => {
  try {
    await copy(gradientCss.value)
    info('Gradient CSS copied to clipboard', { title: 'Copied!' })
  } catch {
    error('Failed to copy CSS to clipboard', { title: 'Error' })
  }
}

const onStopClick = (c: RGB & { a: number }) => {
  startRgba.value = { r: c.r, g: c.g, b: c.b, a: c.a }
  props.onColorSelect({ r: c.r, g: c.g, b: c.b, a: c.a })
}
const onStartColorSelect = (c: RGB) => {
  startRgba.value = { r: c.r, g: c.g, b: c.b, a: startRgba.value.a }
  props.onColorSelect({ r: c.r, g: c.g, b: c.b, a: startRgba.value.a })
}
const onEndColorSelect = (c: RGB) => {
  endRgba.value = { r: c.r, g: c.g, b: c.b, a: endRgba.value.a }
  props.onColorSelect({ r: c.r, g: c.g, b: c.b, a: endRgba.value.a })
}

function rgbaToCss(c: RGB, alpha?: number) {
  const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0')
  if (alpha !== undefined && alpha !== 1) return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`
}
</script>

<style scoped>
.bg-checkerboard {
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}
</style>
