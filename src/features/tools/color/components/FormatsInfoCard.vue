<!-- src/features/tools/color/components/FormatsInfoCard.vue -->
<template>
    <BaseCard title="Formats & Info">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- HEX -->
        <div class="space-y-2">
          <BaseLabel>HEX</BaseLabel>
          <div class="flex items-center gap-2">
            <BaseInput :value="formats.hex" readonly />
            <BaseButton size="sm" variant="outline" @click="copy(formats.hex, 'HEX')">
              <Copy class="h-4 w-4" />
            </BaseButton>
          </div>
        </div>
  
        <!-- RGB -->
        <div class="space-y-2">
          <BaseLabel>RGB</BaseLabel>
          <div class="flex items-center gap-2">
            <BaseInput :value="`rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`" readonly />
            <BaseButton size="sm" variant="outline" @click="copy(`rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`, 'RGB')">
              <Copy class="h-4 w-4" />
            </BaseButton>
          </div>
        </div>
  
        <!-- HSL -->
        <div class="space-y-2">
          <BaseLabel>HSL</BaseLabel>
          <div class="flex items-center gap-2">
            <BaseInput :value="`hsl(${Math.round(formats.hsl.h)}, ${Math.round(formats.hsl.s)}%, ${Math.round(formats.hsl.l)}%)`" readonly />
            <BaseButton size="sm" variant="outline" @click="copy(`hsl(${Math.round(formats.hsl.h)}, ${Math.round(formats.hsl.s)}%, ${Math.round(formats.hsl.l)}%)`, 'HSL')">
              <Copy class="h-4 w-4" />
            </BaseButton>
          </div>
        </div>
  
        <!-- OKLCH -->
        <div class="space-y-2">
          <BaseLabel>OKLCH</BaseLabel>
          <div class="flex items-center gap-2">
            <BaseInput :value="`oklch(${(formats.oklch.l / 100).toFixed(3)} ${(formats.oklch.c / 100).toFixed(3)} ${Math.round(formats.oklch.h)})`" readonly />
            <BaseButton size="sm" variant="outline" @click="copy(`oklch(${(formats.oklch.l / 100).toFixed(3)} ${(formats.oklch.c / 100).toFixed(3)} ${Math.round(formats.oklch.h)})`, 'OKLCH')">
              <Copy class="h-4 w-4" />
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
          <BaseLabel>Luminance</BaseLabel>
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
    </BaseCard>
  </template>
  
  <script setup lang="ts">
  import { Copy } from 'lucide-vue-next'
  import { BaseCard, BaseInput, BaseButton, BaseLabel } from '@components/ui'
  import type { ColorFormats, RGB } from '../types/color'
  import { useToast } from '@composables/ui/useToast'
  import { getColorName, getLuminance, getReadableTextColor, rgbToHex } from '../composables/useColor'
  import { computed } from 'vue'
  
  const props = defineProps<{ formats: ColorFormats }>()
  
  const { toast } = useToast()
  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: `${label} value copied to clipboard` })
  }
  
  // Derived info
  const colorName = computed(() => getColorName(props.formats.rgb))
  const luminance = computed(() => getLuminance(props.formats.rgb))
  const readableTextColor = computed(() => getReadableTextColor(props.formats.rgb))
  </script>
  