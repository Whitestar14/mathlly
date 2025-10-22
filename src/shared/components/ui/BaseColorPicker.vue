<template>
  <BasePopover
    v-model:open="open"
    :modal="true"
    :prevent-scroll="true"
    :trap-focus="true"
    :disable-outside-pointer-events="true"
  >
    <template #trigger>
      <BaseButton
        variant="outline"
        size="sm"
        class="flex items-center gap-2"
      >
        <div
          class="w-4 h-4 rounded border border-border"
          :style="{ backgroundColor: rgbaCss }"
        />
        <Palette class="w-4 h-4" />
      </BaseButton>
    </template>

    <template #default>
      <div class="p-4 w-72 space-y-4 bg-card rounded-lg">
        <!-- SV panel -->
        <div
          ref="svEl"
          class="relative w-full h-36 rounded-md cursor-crosshair select-none overflow-hidden"
          :style="{ background: `hsl(${hsva.h}, 100%, 50%)` }"
          @pointerdown="onSvPointerDown"
          @pointermove="onSvPointerMove"
          @pointerup="onSvPointerUp"
          @pointerleave="onSvPointerUp"
        >
          <!-- Make overlays match the rounded corners -->
          <div class="absolute inset-0 rounded-md bg-gradient-to-r from-white to-transparent" />
          <div class="absolute inset-0 rounded-md bg-gradient-to-t from-black to-transparent" />

          <!-- Crosshair knob -->
          <div
            class="absolute w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            :style="{
              left: `${hsva.s * 100}%`,
              top: `${(1 - hsva.v) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }"
          />
        </div>

        <!-- Hue slider -->
        <BaseSlider
          :model-value="[hsva.h]"
          :min="0"
          :max="360"
          :step="1"
          class="w-full"
          :custom-class="'hue-spectrum-slider'"
          @update:model-value="onHueUpdate"
        />

        <!-- Alpha slider -->
        <div class="bg-checkerboard rounded-md p-2">
          <BaseSlider
            :model-value="[Math.round(hsva.a * 100)]"
            :min="0"
            :max="100"
            :step="1"
            class="w-full"
            @update:model-value="onAlphaUpdate"
          />
        </div>

        <!-- Preview + Hex input -->
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded border border-border"
            :style="{ backgroundColor: rgbaCss }"
          />
          <BaseInput
            v-model="hexInput"
            class="flex-1"
            placeholder="#RRGGBB or #RRGGBBAA"
            @input="onHexType"
          />
        </div>
      </div>
    </template>
  </BasePopover>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useVModel, useElementBounding } from '@vueuse/core'
import { BasePopover, BaseSlider, BaseInput, BaseButton } from '@components/ui'
import { Palette } from 'lucide-vue-next'
import { type RGBA, hexToHsva, hsvaToRgba, rgbaToHex } from '@color/lib/color'

// eslint-disable-next-line vue/no-unused-properties
const props = defineProps<{ modelValue: RGBA }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: RGBA): void }>()

const open = ref(false)

// Two-way binding for RGBA with VueUse
const rgbaModel = useVModel(props, 'modelValue', emit)

// Internal HSVA source of truth
const hsva = reactive({ h: 0, s: 1, v: 1, a: 1 })

// Hex typing (preserve hue when hex is grayscale)
const hexInput = ref('#000000')

// Initialize HSVA from incoming model, preserving hue on grayscale
watch(
  () => rgbaModel.value,
  (rgbaVal) => {
    const hex = rgbaToHex(rgbaVal, true)
    const parsed = hexToHsva(hex)
    if (parsed) {
      // If saturation is zero (grayscale) or hue is undefined, preserve existing hue
      const preserveH = hsva.h
      Object.assign(hsva, {
        h: parsed.s === 0 ? preserveH : parsed.h,
        s: parsed.s,
        v: parsed.v,
        a: parsed.a
      })
    }
    hexInput.value = hex
  },
  { immediate: true, deep: true }
)

// Emit RGBA when HSVA changes (no hex→HSVA roundtrip here)
const rgba = computed(() => hsvaToRgba(hsva))
const rgbaCss = computed(() => `rgba(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b}, ${rgba.value.a})`)
watch(
  hsva,
  () => {
    rgbaModel.value = { r: rgba.value.r, g: rgba.value.g, b: rgba.value.b, a: rgba.value.a }
    hexInput.value = rgbaToHex(rgbaModel.value, true)
  },
  { deep: true }
)

// Sliders
function onHueUpdate(v: number[]) {
  hsva.h = clamp(v[0], 0, 360)
}
function onAlphaUpdate(v: number[]) {
  hsva.a = clamp(v[0] / 100, 0, 1)
}
function onHexType() {
  const parsed = hexToHsva(hexInput.value)
  if (parsed) {
    const preserveH = hsva.h
    hsva.h = parsed.s === 0 ? preserveH : parsed.h
    hsva.s = parsed.s
    hsva.v = parsed.v
    hsva.a = parsed.a
  }
}

// SV panel logic with proper clamping and touch-friendly pointer handling
const svEl = ref<HTMLElement | null>(null)
const { width, height } = useElementBounding(svEl)
let svDragging = false

function onSvPointerDown(e: PointerEvent) {
  svDragging = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  updateSvFromEvent(e)
}
function onSvPointerMove(e: PointerEvent) {
  if (!svDragging) return
  updateSvFromEvent(e)
}
function onSvPointerUp(e: PointerEvent) {
  svDragging = false
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch (err) {
    console.error(err)
  }
}

function updateSvFromEvent(e: PointerEvent) {
  if (!svEl.value) return
  const rect = svEl.value.getBoundingClientRect()

  // Local coordinates clamped to element bounds
  const localX = clamp(e.clientX - rect.left, 0, rect.width)
  const localY = clamp(e.clientY - rect.top, 0, rect.height)

  // Fallback to reactive bounding if rect is zero during initial mount
  const w = rect.width || width.value || 1
  const h = rect.height || height.value || 1

  // Normalize to [0,1]
  const s = clamp(localX / w, 0, 1)
  const v = clamp(1 - localY / h, 0, 1)

  // Update without touching hue
  hsva.s = s
  hsva.v = v
}

// Utils
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
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

/* Improves drag feel on touch devices */
[ref="svEl"] {
  touch-action: none;
}

/* TODO */
.hue-spectrum-slider :deep(.relative.h-1\.5) {
  background: linear-gradient(to right, 
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  ) !important;
}
</style>