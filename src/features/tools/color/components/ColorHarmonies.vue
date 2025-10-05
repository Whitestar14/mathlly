<template>
  <div class="space-y-3">
    <div
      :class="active === 'monochromatic'
        ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2'
        : 'flex flex-wrap gap-2'"
    >
      <button
        v-for="(c, i) in activeColors"
        :key="i"
        class="w-12 h-12 rounded border border-border transition hover:scale-105"
        :style="{ backgroundColor: rgbToHex(c) }"
        :aria-label="`${active} color ${i+1}`"
        v-tippy="{ content: rgbToHex(c) }"
        @click="onSelect(c)"
        @dblclick="copyHex(c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'
import { useColorHarmonies } from '../composables/useColorHarmonies'
import { rgbToHex, type RGB } from '@color/lib/color'

const props = defineProps<{
  current: RGB
  active: 'complementary' | 'triadic' | 'analogous' | 'monochromatic'
  onSelect: (c: RGB) => void
}>()

const harmonies = useColorHarmonies(() => props.current)
const { copy } = useClipboard()
const { toast } = useToast()

const activeColors = computed(() => {
  switch (props.active) {
    case 'complementary': return [props.current, harmonies.complementaryColor.value]
    case 'triadic': return harmonies.triadicColors.value
    case 'analogous': return harmonies.analogousColors.value
    case 'monochromatic': return harmonies.monochromaticColors.value
  }
})

const copyHex = async (c: RGB) => {
  const hex = rgbToHex(c)
  await copy(hex)
  toast({ title: 'Copied!', description: `${hex} copied to clipboard` })
}
</script>
