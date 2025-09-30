<template>
  <BaseCard title="Current color">
    <template #header>
      <BaseButton variant="ghost" size="sm" @click="genRandomColor">
        <Shuffle class="h-4 w-4" /> Random
      </BaseButton>
    </template>

    <div class="flex flex-col lg:flex-row gap-6 mb-3">
      <!-- Preview -->
      <div
        ref="previewEl"
        class="relative group w-full min-h-32 lg:h-auto flex-1 rounded-lg border border-border cursor-pointer overflow-hidden"
        :style="{ backgroundColor: rgbaText }"
        @click="handlePreviewClick"
      >
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy class="h-6 w-6 text-foreground mb-1" />
          <span class="text-xs text-foreground font-medium">{{ rgbaText }}</span>
        </div>
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/40 text-[10px] text-foreground font-medium lg:hidden transition-opacity group-hover:opacity-0">
          Tap to copy
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
          <div v-for="k in rgbaKeys" :key="k" class="space-y-2">
            <BaseLabel>{{ labelMap[k] }}: {{ displayValue(k) }}</BaseLabel>
            <BaseSlider
              :model-value="[getValue(k)]"
              @update:modelValue="onSliderUpdate(k, $event)"
              :min="0"
              :max="k === 'a' ? 100 : 255"
              :step="1"
              class="w-full"
            />
          </div>
        </div>

        <!-- Hex input + Picker -->
        <div class="flex gap-2 items-center">
          <BaseInput
            id="hex-input"
            v-model="hexInput"
            :error="hexError"
            placeholder="#000000"
            @input="onHexInput"
            class="flex-1"
          />
          <BaseColorPicker v-model="rgbaProxy" />
        </div>
      </div>
    </div>

    <BaseAccordion :multiple="false" :collapsible="true">
      <AccordionItem id="formats" title="Formats & Info">
        <FormatsInfoCard :formats="formats" />
      </AccordionItem>
    </BaseAccordion>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Copy, Shuffle } from 'lucide-vue-next'
import {
  BaseCard, BaseButton, BaseInput, BaseLabel, BaseSlider,
  BaseAccordion, AccordionItem
} from '@components/ui'
import BaseColorPicker from '@components/ui/BaseColorPicker.vue'
import FormatsInfoCard from './FormatsInfoCard.vue'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useRipple } from '@composables/ui/useRipple'
import {
  convertColor,
  hexToHsva,
  hsvaToRgba,
  generateRandomColor,
  type RGB,
  type RGBA,
  type ColorFormats as Formats,
} from '../composables/useColor.deprecated'

const props = defineProps<{
  current: RGBA
  formats: Formats
  updateColor: (c: RGBA) => void
}>()

const previewEl = ref<HTMLElement | null>(null)
const { ripples, triggerRipple } = useRipple()
const { copy } = useClipboard()
const { toast } = useToast()

// RGBA sliders
const rgbaKeys = ['r', 'g', 'b', 'a'] as const
type RgbaKey = typeof rgbaKeys[number]
const labelMap: Record<RgbaKey, string> = { r: 'Red', g: 'Green', b: 'Blue', a: 'Alpha' }

const getValue = (k: RgbaKey) => (k === 'a' ? Math.round((props.current.a ?? 1) * 100) : props.current[k] as number)
const displayValue = (k: RgbaKey) => (k === 'a' ? `${Math.round((props.current.a ?? 1) * 100)}%` : props.current[k])

const setRgba = (component: RgbaKey, value: number) => {
  const next: RGBA =
    component === 'a'
      ? { ...props.current, a: Math.max(0, Math.min(1, value / 100)) }
      : { ...props.current, [component]: Math.max(0, Math.min(255, Math.round(value))) } as RGBA

  // Guard to prevent redundant updates
  if (
    next.r === props.current.r &&
    next.g === props.current.g &&
    next.b === props.current.b &&
    next.a === (props.current.a ?? 1)
  ) return

  props.updateColor(next)
}

const onSliderUpdate = (component: RgbaKey, valueArray: number[]) => {
  setRgba(component, valueArray[0])
}

// Hex input handling (updates RGBA)
const hexInput = ref(props.formats.hex)
const hexError = ref('')

const normalizeHex = (val: string): string | null => {
  let h = val.trim().replace(/^#/, '')
  if (/^[0-9A-Fa-f]{3,4}$/.test(h)) h = h.split('').map(c => c + c).join('')
  if (/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(h)) return `#${h.toUpperCase()}`
  return null
}

const debouncedValidate = useDebounceFn((val: string) => {
  const normalized = normalizeHex(val)
  if (normalized) {
    hexError.value = ''
    const hsva = hexToHsva(normalized)
    if (hsva) {
      const rgba = hsvaToRgba(hsva)
      props.updateColor(rgba)
    } else {
      const converted = convertColor(normalized)
      props.updateColor(converted.rgba)
    }
  } else {
    const h = val.replace(/^#/, '')
    if ([3, 4, 6, 8].includes(h.length)) {
      hexError.value = 'Please enter a valid 3, 4, 6, or 8 digit hex code'
    } else {
      hexError.value = ''
    }
  }
}, 300)

const onHexInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.value.startsWith('#')) input.value = `#${input.value}`
  hexInput.value = input.value
  debouncedValidate(input.value)
}

// Keep hex input in sync (one-way from formats)
const rgbaText = computed(() => `rgba(${props.current.r}, ${props.current.g}, ${props.current.b}, ${props.current.a ?? 1})`)

// Picker v-model proxy via computed to avoid watcher loops
const rgbaProxy = computed<RGBA>({
  get: () => ({ r: props.current.r, g: props.current.g, b: props.current.b, a: props.current.a ?? 1 }),
  set: (val) => {
    // Guard redundant updates
    if (
      val.r === props.current.r &&
      val.g === props.current.g &&
      val.b === props.current.b &&
      (val.a ?? 1) === (props.current.a ?? 1)
    ) return
    props.updateColor({ r: val.r, g: val.g, b: val.b, a: val.a ?? 1 })
  },
})

// Preview copy
const handlePreviewClick = async (e: MouseEvent) => {
  if (!previewEl.value) return
  await copy(rgbaText.value)
  toast({ title: 'Copied!', description: `${rgbaText.value} copied to clipboard` })
  triggerRipple(e, previewEl.value)
  if (navigator.vibrate) navigator.vibrate(30)
}

// Random color (preserve alpha)
const genRandomColor = () => {
  const rnd: RGB = generateRandomColor()
  props.updateColor({ r: rnd.r, g: rnd.g, b: rnd.b, a: props.current.a ?? 1 })
}
</script>

<style scoped>
@keyframes ripple {
  from { transform: scale(0); opacity: 0.6; }
  to { transform: scale(1); opacity: 0; }
}
.animate-ripple {
  animation: ripple 0.6s ease-out forwards;
}
</style>
