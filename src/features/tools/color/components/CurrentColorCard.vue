<template>
  <BaseCard title="Current color">
    <template #header>
      <div class="flex items-center gap-2">
        <BaseButton
          v-tippy="{ content: 'Undo (Ctrl+Z)' }"
          variant="outline"
          size="icon"
          :disabled="!canUndo"
          aria-label="Undo last color change"
          @click="props.onUndo">
          <Undo class="h-4 w-4" />
        </BaseButton>

        <BaseButton
          v-tippy="tooltipText"
          variant="outline"
          size="icon"
          :disabled="!canAddToPalette || colorExistsInPalette"
          aria-label="Add to palette"
          @click="props.onAddToPalette">
          <Plus class="h-4 w-4" />
        </BaseButton>

        <BaseButton
          v-tippy="{ content: 'Open Adjustment Panel' }"
          variant="outline"
          size="icon"
          aria-label="Open adjustments"
          @click="openAdjustments">
          <Settings2 class="h-4 w-4" />
        </BaseButton>

        <BaseButton
          variant="ghost"
          size="sm"
          @click="genRandomColor">
          <Shuffle class="h-4 w-4" /> <span class="hidden md:inline">Random</span>
        </BaseButton>
      </div>
    </template>

    <div class="flex flex-col lg:flex-row gap-6 mb-3">

      <div
        ref="previewEl"
        class="relative group w-full min-h-32 lg:h-auto flex-1 rounded-lg border border-border cursor-pointer overflow-hidden"
        @click="handlePreviewClick">

        <div
          class="absolute inset-0"
          :style="{
            backgroundImage: ` linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%) `,
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
          }"></div>

        <div
          class="absolute inset-0"
          :style="{ backgroundColor: rgbaText }"></div>

        <div class="absolute inset-0 flex flex-col items-center justify-center text-secondary bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy class="h-6 w-6 mb-1" />
          <span class="text-xs font-medium">{{ rgbaText }}</span>
        </div>
        <span
          v-for="r in ripples"
          :key="r.id"
          class="absolute rounded-full bg-white/40 animate-ripple pointer-events-none"
          :style="{
            top: r.y + 'px',
            left: r.x + 'px',
            width: r.size + 'px',
            height: r.size + 'px',
            marginTop: -(r.size / 2) + 'px',
            marginLeft: -(r.size / 2) + 'px',
          }"></span>
      </div>

      <div class="flex-1 space-y-4">

        <div class="space-y-4">
          <div class="flex items-center justify-between mb-2">
            <BaseLabel class="text-sm font-medium">
              RGB Sliders
            </BaseLabel>
            <BaseButton
              v-tippy="isAllBlack ? 'Cannot lock when color is black' : 'Lock RGB sliders to adjust proportionally'"
              variant="ghost"
              size="icon"
              :aria-label="isRgbLocked ? 'Unlock RGB sliders' : 'Lock RGB sliders'"
              :disabled="isAllBlack"
              :class="{ 'text-foreground/90': isRgbLocked }"
              @click="isRgbLocked = !isRgbLocked">
              <Lock
                v-if="isRgbLocked"
                class="h-4 w-4" />
              <Unlock
                v-else
                class="h-4 w-4" />
            </BaseButton>
          </div>

          <div
            v-for="k in rgbaKeys"
            :key="k"
            class="space-y-2">
            <BaseLabel>{{ labelMap[k] }}: {{ displayValue(k) }}</BaseLabel>
            <BaseSlider
              :model-value="[getValue(k)]"
              :min="0"
              :max="k === 'a' ? 100 : 255"
              :step="1"
              class="w-full"
              @update:model-value="onSliderUpdate(k, $event)" />
          </div>
        </div>

        <div class="flex gap-2 items-center">
          <InputGroup
            id="color-input"
            v-model="colorInput"
            v-model:dropdown-value="selectedFormat"
            :options="formatOptions"
            dropdown-label="Input format"
            dropdown-placeholder="Auto"
            :error="inputError"
            :placeholder="placeholderForFormat"
            class="flex-1"
            @focus="onFocus"
            @blur="onBlur"
            @input="onTyping"
            @keydown.enter="onEnter" />
          <BaseColorPicker v-model="rgbaProxy" />
        </div>
      </div>
    </div>

    <BaseAccordion
      default-value="format"
      :multiple="false"
      :collapsible="true">
      <AccordionItem
        id="formats"
        title="Formats & Info">
        <FormatsInfoCard :formats="localFormats" />
      </AccordionItem>
    </BaseAccordion>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Copy, Shuffle, Settings2, Plus, Lock, Unlock, Undo } from 'lucide-vue-next'
import { usePanel } from '@composables/ui/usePanel'
import { BaseCard, BaseButton, BaseLabel, BaseSlider, BaseAccordion, AccordionItem, InputGroup } from '@components/ui'
import BaseColorPicker from '@components/ui/BaseColorPicker.vue'
import FormatsInfoCard from './FormatsInfoCard.vue'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useRipple } from '@composables/ui/useRipple'
import { useKeyboardStore } from '@stores/keyboard'
import { clamp255 } from '@color/lib/color'
import type { RGBA, RGB } from '@color/lib/color'
import { formatRgbaPretty } from '@color/lib/utils'
import type { PaletteEntity } from '@color/services/palette'
import { useColorInput } from '@color/composables/useColorInput'

const props = defineProps<{
  current: RGBA
  updateColor: (c: RGBA) => void
  selectedPaletteId: string
  palettes: PaletteEntity[]
  onAddToPalette: () => void
  onUndo: () => void
  canUndo: boolean
}>()

const previewEl = ref<HTMLElement | null>(null)
const { ripples, triggerRipple } = useRipple()
const { copy } = useClipboard()
const { info } = useToast()
const panel = usePanel('adjustments')

const keyboard = useKeyboardStore()
onMounted(() => {
  try {
    keyboard.attachAllForContext('tools.color', {
      'Ctrl+R': () => genRandomColor(),
      'Ctrl+Shift+C': async() => {
        await copy(rgbaText.value)
        info(`${rgbaText.value} copied to clipboard`, { title: 'Copied!' })
      },
      'Ctrl+P': () => props.onAddToPalette(),
      'Ctrl+Z': () => props.onUndo()
    })
  } catch(e) {
    console.error('Failed to attach keyboard context', e)
  }
})

const rgbaKeys = ['r', 'g', 'b', 'a'] as const
type RgbaKey = typeof rgbaKeys[number]
const labelMap: Record<RgbaKey, string> = { r: 'Red', g: 'Green', b: 'Blue', a: 'Alpha' }
const getValue = (k: RgbaKey) => k === 'a' ? Math.round((props.current.a ?? 1) * 100) : props.current[k]
const displayValue = (k: RgbaKey) => k === 'a' ? `${Math.round((props.current.a ?? 1) * 100)}%` : props.current[k]

const setRgba = (k: RgbaKey, v: number) => {
  const next: RGBA =
    k === 'a' ?
      { ...props.current, a: Math.max(0, Math.min(1, v / 100)) } :
      { ...props.current, [k]: Math.max(0, Math.min(255, Math.round(v))) } as RGBA

  if (
    next.r !== props.current.r ||
    next.g !== props.current.g ||
    next.b !== props.current.b ||
    next.a !== props.current.a
  ) {
    props.updateColor(next)
  }
}

const isRgbLocked = ref(false)
const isAllBlack = computed(() => props.current.r === 0 && props.current.g === 0 && props.current.b === 0)

const adjustRgbProportional = (key: RgbaKey, newValue: number) => {
  if (key === 'a') {
    setRgba('a', newValue)
    return
  }

  const currentValue = props.current[key]

  if (currentValue === 0) {
    const next: RGBA = { ...props.current, [key]: Math.max(0, Math.min(255, Math.round(newValue))) } as RGBA
    props.updateColor(next)
    return
  }

  const factor = newValue / currentValue

  const next: RGBA = {
    r: clamp255(props.current.r * factor),
    g: clamp255(props.current.g * factor),
    b: clamp255(props.current.b * factor),
    a: props.current.a ?? 1
  }

  props.updateColor(next)
}

const onSliderUpdate = (k: RgbaKey, arr: number[]) => {
  const v = arr[0]
  if (isRgbLocked.value && (k === 'r' || k === 'g' || k === 'b')) {
    adjustRgbProportional(k, v)
  } else {
    setRgba(k, v)
  }
}

const { selectedFormat, colorInput, inputError, localFormats, placeholderForFormat, formatOptions, onFocus, onBlur, onEnter, onTyping } = useColorInput(computed(() => props.current), props.updateColor)

const rgbaProxy = computed<RGBA>({
  get: () => ({ r: props.current.r, g: props.current.g, b: props.current.b, a: props.current.a ?? 1 }),
  set: val => {
    if (val.r !== props.current.r || val.g !== props.current.g || val.b !== props.current.b || (val.a ?? 1) !== (props.current.a ?? 1)) {
      props.updateColor({ r: val.r, g: val.g, b: val.b, a: val.a ?? 1 })
    }
  }
})

const rgbaText = computed(() => formatRgbaPretty(props.current))

const handlePreviewClick = async(e: MouseEvent) => {
  if (!previewEl.value) return
  triggerRipple(e, previewEl.value)
  await copy(rgbaText.value)
  info(`${rgbaText.value} copied to clipboard`, { title: 'Copied!' })
}

const genRandomColor = () => {
  const rnd: RGB = { r: Math.round(Math.random() * 255), g: Math.round(Math.random() * 255), b: Math.round(Math.random() * 255) }
  props.updateColor({ r: rnd.r, g: rnd.g, b: rnd.b, a: props.current.a ?? 1 })
}

function openAdjustments() {
  panel.toggle()
}

const activePalette = computed(() => props.palettes.find(p => p.id === props.selectedPaletteId) ?? null)
const canAddToPalette = computed(() => !!activePalette.value)
const colorExistsInPalette = computed(() => {
  if (!activePalette.value) return false
  return activePalette.value.colors.some(c =>
    c.r === props.current.r && c.g === props.current.g && c.b === props.current.b
  )
})
const tooltipText = computed(() => {
  if (!canAddToPalette.value) return 'No palette selected'
  if (colorExistsInPalette.value) return 'Color already in palette'
  return 'Add current color to palette (Ctrl+P)'
})
</script>

<style scoped>
@keyframes ripple {
  from { transform: scale(0); opacity: 0.6; }
  to { transform: scale(1); opacity: 0; }
}
.animate-ripple { animation: ripple 0.6s ease-out forwards; }
</style>
