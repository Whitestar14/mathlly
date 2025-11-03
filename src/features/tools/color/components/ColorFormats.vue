
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="space-y-2">
      <BaseLabel>HEX</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput
          :value="formats.hex"
          readonly />
        <BaseButton
          size="sm"
          variant="outline"
          @click="copy(formats.hex, 'HEX')">
          <Copy class="h-4 w-4" />
        </BaseButton>
      </div>
    </div>

    <div class="space-y-2">
      <BaseLabel>RGB</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput
          :value="`rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`"
          readonly />
        <BaseButton
          size="sm"
          variant="outline"
          @click="copy(`rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`, 'RGB')">
          <Copy class="h-4 w-4" />
        </BaseButton>
      </div>
    </div>

    <div class="space-y-2">
      <BaseLabel>HSL</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput
          :value="`hsl(${Math.round(formats.hsl.h)}, ${Math.round(formats.hsl.s)}%, ${Math.round(formats.hsl.l)}%)`"
          readonly />
        <BaseButton
          size="sm"
          variant="outline"
          @click="copy(`hsl(${Math.round(formats.hsl.h)}, ${Math.round(formats.hsl.s)}%, ${Math.round(formats.hsl.l)}%)`, 'HSL')">
          <Copy class="h-4 w-4" />
        </BaseButton>
      </div>
    </div>

    <div class="space-y-2">
      <BaseLabel>OKLCH</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseInput
          :value="`oklch(${(formats.oklch.l / 100).toFixed(3)} ${(formats.oklch.c / 100).toFixed(3)} ${Math.round(formats.oklch.h)})`"
          readonly />
        <BaseButton
          size="sm"
          variant="outline"
          @click="copy(`oklch(${(formats.oklch.l / 100).toFixed(3)} ${(formats.oklch.c / 100).toFixed(3)} ${Math.round(formats.oklch.h)})`, 'OKLCH')">
          <Copy class="h-4 w-4" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { BaseInput, BaseButton, BaseLabel } from '@components/ui'
import type { ColorFormats } from '@color/lib/color'
import { useToast } from '@composables/ui/useToast'

defineProps<{ formats: ColorFormats }>()
const { toast } = useToast()

const copy = async(text: string, label: string) => {
  await navigator.clipboard.writeText(text)
  toast({ title: 'Copied!', description: `${label} value copied to clipboard` })
}
</script>
