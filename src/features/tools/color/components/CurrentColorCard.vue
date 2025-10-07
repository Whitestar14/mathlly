<!-- src/features/tools/color/components/CurrentColorCard.vue -->
<template>
  <BaseCard title="Current color">
    <template #header>
      <div class="flex items-center gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="genRandomColor"
        >
          <Shuffle class="h-4 w-4" /> Random
        </BaseButton>
        <BaseButton
          variant="outline"
          size="sm"
          aria-label="Open adjustments"
          @click="openAdjustments"
        >
          <Settings2 class="h-4 w-4" />
        </BaseButton>
      </div>
    </template>

    <div class="flex flex-col lg:flex-row gap-6 mb-3">
      <!-- Preview -->
      <div
        ref="previewEl"
        class="relative group w-full min-h-32 lg:h-auto flex-1 rounded-lg border border-border cursor-pointer overflow-hidden"
        @click="handlePreviewClick"
      >
        <!-- Checkered background pattern (more visible) -->
        <div 
          class="absolute inset-0"
          :style="{
            backgroundImage: `
              linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
            `,
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
          }"
        />
        
        <!-- Semi-transparent color overlay -->
        <div 
          class="absolute inset-0"
          :style="{ backgroundColor: rgbaText }"
        />
        
        <!-- Content overlay -->
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy class="h-6 w-6 text-foreground mb-1" />
          <span class="text-xs text-foreground font-medium">{{ rgbaText }}</span>
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
          }"
        />
      </div>

      <!-- Controls -->
      <div class="flex-1 space-y-4">
        <!-- RGBA sliders -->
        <div class="space-y-4">
          <div
            v-for="k in rgbaKeys"
            :key="k"
            class="space-y-2"
          >
            <BaseLabel>{{ labelMap[k] }}: {{ displayValue(k) }}</BaseLabel>
            <BaseSlider
              :model-value="[getValue(k)]"
              :min="0"
              :max="k === 'a' ? 100 : 255"
              :step="1"
              class="w-full"
              @update:model-value="onSliderUpdate(k, $event)"
            />
          </div>
        </div>

        <!-- Unified dropdown + input + picker -->
        <div class="flex gap-2 items-center">
          <BaseInput
            id="color-input"
            ref="colorInputEl"
            v-model="colorInput"
            v-model:dropdown-value="selectedFormat"
            :dropdown="true"
            :options="formatOptions"
            dropdown-label="Input format"
            dropdown-placeholder="Auto"
            :error="inputError"
            :placeholder="placeholderForFormat"
            class="flex-1"
            @focus="onFocus"
            @blur="onBlur"
            @input="onTyping"
            @keydown.enter="onEnter"
          />
          <BaseColorPicker v-model="rgbaProxy" />
        </div>
      </div>
    </div>

    <BaseAccordion
      :multiple="false"
      :collapsible="true"
    >
      <AccordionItem
        id="formats"
        title="Formats & Info"
      >
        <FormatsInfoCard :formats="localFormats" />
      </AccordionItem>
    </BaseAccordion>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Copy, Shuffle, Settings2 } from 'lucide-vue-next'
import { usePanel } from '@composables/ui/usePanel'
import { BaseCard, BaseButton, BaseInput, BaseLabel, BaseSlider, BaseAccordion, AccordionItem } from '@components/ui'
import BaseColorPicker from '@components/ui/BaseColorPicker.vue'
import FormatsInfoCard from './FormatsInfoCard.vue'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useRipple } from '@composables/ui/useRipple'
import { convertColor } from '@color/lib/color'
import type { RGBA, RGB, ColorFormats } from '@color/lib/color'
import {
  detectFormat,
  parseWithFormatTolerant,
  parseAutoSimple,
  normalizeDisplay,
  formatRgbaPretty,
  type InputFormat,
  type ResolvedFormat,
  expandShorthandHex,
  isShorthandHex,
} from '@color/lib/utils'

const props = defineProps<{ current: RGBA; formats: ColorFormats; updateColor: (c: RGBA) => void }>()

const previewEl = ref<HTMLElement | null>(null)
const { ripples, triggerRipple } = useRipple()
const { copy } = useClipboard()
const { toast } = useToast()
const panel = usePanel('adjustments')

// Sliders
const rgbaKeys = ['r', 'g', 'b', 'a'] as const
type RgbaKey = typeof rgbaKeys[number]
const labelMap: Record<RgbaKey, string> = { r: 'Red', g: 'Green', b: 'Blue', a: 'Alpha' }
const getValue = (k: RgbaKey) => k === 'a' ? Math.round((props.current.a ?? 1) * 100) : props.current[k]
const displayValue = (k: RgbaKey) => k === 'a' ? `${Math.round((props.current.a ?? 1) * 100)}%` : props.current[k]
const setRgba = (k: RgbaKey, v: number) => {
  const next: RGBA = k === 'a'
    ? { ...props.current, a: Math.max(0, Math.min(1, v / 100)) }
    : { ...props.current, [k]: Math.max(0, Math.min(255, Math.round(v))) } as RGBA
  if (next.r !== props.current.r || next.g !== props.current.g || next.b !== props.current.b || next.a !== props.current.a) {
    props.updateColor(next)
  }
}
const onSliderUpdate = (k: RgbaKey, arr: number[]) => setRgba(k, arr[0])

// Unified input
const selectedFormat = ref<InputFormat>('auto')
const lastAutoFormat = ref<ResolvedFormat | null>('hex')
const isEditing = ref(false)
const colorInput = ref(props.formats.hex)
const inputError = ref('')

// SelectBar options (array API expected by component)
const formatOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'hex', label: 'HEX' },
  { value: 'rgba', label: 'RGBA' },
  { value: 'hsla', label: 'HSLA' },
  { value: 'oklch', label: 'OKLCH' },
]

// Local computed formats from canonical RGBA
const localFormats = computed<ColorFormats>(() => convertColor(props.current))

// Placeholders
const placeholderForFormat = computed(() => {
  switch (selectedFormat.value) {
    case 'hex': return '#22C55E or #22C55E80'
    case 'rgba': return 'rgba(34 197 94 / 1) or rgba(34, 197, 94, 1)'
    case 'hsla': return 'hsla(150 50% 50% / 1) or hsla(150, 50%, 50%, 1)'
    case 'oklch': return 'oklch(0.650 0.150 150 / 1)'
    default: return '#22C55E or rgba(...) or hsla(...) or oklch(...)'
  }
})

// Preview text (not tied to input formatting)
const rgbaText = computed(() => formatRgbaPretty(props.current))
const colorInputEl = ref<{select: () => void} | null>(null);

// Editing lifecycle
const onFocus = () => { isEditing.value = true; colorInputEl.value?.select() }
const onEnter = () => { isEditing.value = false; normalizeInputPresentation() }
const onBlur = () => {
  isEditing.value = false
  // QoL: expand shorthand hex on blur
  if (selectedFormat.value === 'hex' && isShorthandHex(colorInput.value)) {
    colorInput.value = expandShorthandHex(colorInput.value)
  }
  normalizeInputPresentation()
}

// Typing handler: auto just detects and delegates to explicit parser
const processInput = (raw: string) => {
  const alpha = props.current.a ?? 1

  if (selectedFormat.value === 'auto') {
    const { state, rgba, format } = parseAutoSimple(raw, alpha)
    if (state === 'valid' && rgba) {
      lastAutoFormat.value = format ?? detectFormat(raw) ?? lastAutoFormat.value
      inputError.value = ''
      props.updateColor(rgba)
    } else if (state === 'partial') {
      inputError.value = ''
    } else {
      inputError.value = 'Invalid color format'
    }
    return
  }

  const { state, rgba } = parseWithFormatTolerant(raw, selectedFormat.value as ResolvedFormat, alpha)
  if (state === 'valid' && rgba) {
    inputError.value = ''
    props.updateColor(rgba)
  } else if (state === 'partial') {
    inputError.value = ''
  } else {
    inputError.value = 'Invalid color format'
  }
}

const onTyping = useDebounceFn((e: Event) => {
  const val = (e.target as HTMLInputElement).value
  processInput(val)
}, 90)

// Normalize input display (preserve user’s format; don’t clobber while editing)
const normalizeInputPresentation = () => {
  if (isEditing.value) return
  colorInput.value = normalizeDisplay(
    props.current,
    localFormats.value,
    selectedFormat.value,
    lastAutoFormat.value
  )
}

// Keep input in sync with current color but never clobber while editing
watch(
  () => props.current,
  () => { if (!isEditing.value) normalizeInputPresentation() },
  { deep: true, immediate: true }
)

// When the user switches the selected format (e.g., HEX -> RGBA),
// immediately convert the input to the target presentation.
watch(
  () => selectedFormat.value,
  () => {
    if (isEditing.value) return
    colorInput.value = normalizeDisplay(
      props.current,
      localFormats.value,
      selectedFormat.value,
      lastAutoFormat.value
    )
  }
)

// Picker proxy
const rgbaProxy = computed<RGBA>({
  get: () => ({ r: props.current.r, g: props.current.g, b: props.current.b, a: props.current.a ?? 1 }),
  set: (val) => {
    if (val.r !== props.current.r || val.g !== props.current.g || val.b !== props.current.b || (val.a ?? 1) !== (props.current.a ?? 1)) {
      props.updateColor({ r: val.r, g: val.g, b: val.b, a: val.a ?? 1 })
    }
  },
})

// Preview copy
const handlePreviewClick = async (e: MouseEvent) => {
  if (!previewEl.value) return
  triggerRipple(e, previewEl.value)
  await copy(rgbaText.value)
  toast({ title: 'Copied!', description: `${rgbaText.value} copied to clipboard` })
}

// Random color (preserve alpha)
const genRandomColor = () => {
  const rnd: RGB = { r: Math.round(Math.random() * 255), g: Math.round(Math.random() * 255), b: Math.round(Math.random() * 255) }
  props.updateColor({ r: rnd.r, g: rnd.g, b: rnd.b, a: props.current.a ?? 1 })
}

// Open adjustments drawer panel
function openAdjustments() {
  panel.toggle()
}
</script>

<style scoped>
@keyframes ripple {
  from { transform: scale(0); opacity: 0.6; }
  to { transform: scale(1); opacity: 0; }
}
.animate-ripple { animation: ripple 0.6s ease-out forwards; }
</style>
