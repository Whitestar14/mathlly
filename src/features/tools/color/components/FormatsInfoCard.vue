<!-- src/features/tools/color/components/FormatsInfoCard.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- HEX -->
    <div class="space-y-2">
      <BaseLabel>HEX</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput :value="formats.hex" readonly />
        <BaseButton size="icon" variant="outline" @click="copy(formats.hex, 'HEX')">
          <Copy class="h-5 w-5" />
        </BaseButton>
      </div>
    </div>

    <!-- RGBA (standard) -->
    <div class="space-y-2">
      <BaseLabel>RGBA</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput :value="rgbaText" readonly />
        <BaseButton size="icon" variant="outline" @click="copy(rgbaText, 'RGBA')">
          <Copy class="h-5 w-5" />
        </BaseButton>
      </div>
    </div>

    <!-- HSL -->
    <div class="space-y-2">
      <BaseLabel>HSL</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput
          :value="`hsl(${Math.round(formats.hsl.h)}, ${Math.round(formats.hsl.s)}%, ${Math.round(formats.hsl.l)}%)`"
          readonly
        />
        <BaseButton
          size="icon"
          variant="outline"
          @click="copy(`hsl(${Math.round(formats.hsl.h)}, ${Math.round(formats.hsl.s)}%, ${Math.round(formats.hsl.l)}%)`, 'HSL')"
        >
          <Copy class="h-5 w-5" />
        </BaseButton>
      </div>
    </div>

    <!-- OKLCH -->
    <div class="space-y-2">
      <BaseLabel>OKLCH</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput
          :value="`oklch(${(formats.oklch.l / 100).toFixed(3)} ${(formats.oklch.c / 100).toFixed(3)} ${Math.round(formats.oklch.h)})`"
          readonly
        />
        <BaseButton
          size="icon"
          variant="outline"
          @click="copy(`oklch(${(formats.oklch.l / 100).toFixed(3)} ${(formats.oklch.c / 100).toFixed(3)} ${Math.round(formats.oklch.h)})`, 'OKLCH')"
        >
          <Copy class="h-5 w-5" />
        </BaseButton>
      </div>
    </div>

    <!-- Color Name -->
    <div class="space-y-2">
      <BaseLabel>Name</BaseLabel>
      <BaseInput :value="colorName" readonly />
    </div>

        <!-- Luminance -->
        <div class="space-y-2">
      <div class="flex items-center gap-2">
        <BaseLabel>Luminance</BaseLabel>
        <HelpCircle 
          class="h-4 w-4 text-muted-foreground cursor-help"
          v-tippy="{ 
            content: 'Luminance measures the perceived brightness of a color. It ranges from 0 (black) to 1 (white) and accounts for how humans perceive light intensity.',
            placement: 'top',
            onShow() { return true }
          }" 
        />
      </div>
      <BaseInput :value="luminance.toFixed(3)" readonly />
    </div>

    <!-- Readable Text Color -->
    <div class="space-y-2">
      <BaseLabel>Readable Text Color</BaseLabel>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded border" :style="{ backgroundColor: rgbToHex(readableTextColor) }" />
        <BaseInput :value="rgbToHex(readableTextColor)" readonly />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Copy, HelpCircle } from 'lucide-vue-next'
import { BaseInput, BaseButton, BaseLabel } from '@components/ui'
import type { ColorFormats } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'
import { getColorName, getLuminance, getReadableTextColor, rgbToHex } from '@color/lib/color'
import { computed } from 'vue'

const props = defineProps<{ formats: ColorFormats }>()
const { toast } = useToast()

const copy = async (text: string, label: string) => {
  await navigator.clipboard.writeText(text)
  toast({ title: 'Copied!', description: `${label} value copied to clipboard` })
}

// Use RGBA as standard (clamp alpha to 3 decimals to avoid ballooning)
const rgbaText = computed(() => {
  const a = Number((props.formats.rgba.a ?? 1).toFixed(3))
  return `rgba(${props.formats.rgba.r}, ${props.formats.rgba.g}, ${props.formats.rgba.b}, ${a})`
})

// Update dependent utilities to use RGBA
const colorName = computed(() => getColorName(props.formats.rgba))
const luminance = computed(() => getLuminance(props.formats.rgba))
const readableTextColor = computed(() => getReadableTextColor(props.formats.rgba))
</script>
