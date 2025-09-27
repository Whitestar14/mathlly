<!-- src/features/tools/color/components/ColorHarmonies.vue -->
<template>
  <div class="space-y-3">
    <!-- Complementary -->
    <div v-if="active === 'complementary'" class="flex gap-2">
      <Swatch :color="current" @click="onSelect(current)" />
      <Swatch :color="harmonies.complementaryColor.value" @click="onSelect(harmonies.complementaryColor.value)" />
    </div>

    <!-- Triadic -->
    <div v-else-if="active === 'triadic'" class="flex gap-2">
      <Swatch v-for="(c,i) in harmonies.triadicColors.value" :key="i" :color="c" @click="onSelect(c)" />
    </div>

    <!-- Analogous -->
    <div v-else-if="active === 'analogous'" class="flex gap-2">
      <Swatch v-for="(c,i) in harmonies.analogousColors.value" :key="i" :color="c" @click="onSelect(c)" />
    </div>

    <!-- Monochromatic -->
    <div v-else class="grid grid-cols-5 gap-2">
      <Swatch v-for="(c,i) in harmonies.monochromaticColors.value" :key="i" :color="c" @click="onSelect(c)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColorHarmonies } from '../composables/useColorHarmonies'
import type { RGB } from '../types/color'
import Swatch from './Swatch.vue'

const props = defineProps<{
  current: RGB
  active: 'complementary' | 'triadic' | 'analogous' | 'monochromatic'
  onSelect: (c: RGB) => void
}>()

const harmonies = useColorHarmonies(() => props.current)
const onSelect = (c: RGB) => props.onSelect(c)
</script>
