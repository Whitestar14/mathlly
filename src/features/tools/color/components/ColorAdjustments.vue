<!-- src/features/tools/color/components/ColorAdjustments.vue -->
<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <BaseLabel class="text-sm font-medium"
        >Brightness: {{ brightness }}</BaseLabel
      >
      <div class="flex items-center gap-2">
        <BaseSlider
          :model-value="[brightness]"
          @update:modelValue="(v) => setBrightness(v[0])"
          :min="-1"
          :max="1"
          :step="0.01"
        />
        <BaseButton
          size="sm"
          variant="outline"
          @click="applyBrightness(currentColor)"
        >
          Apply
        </BaseButton>
      </div>
    </div>

    <div class="space-y-2">
      <BaseLabel class="text-sm font-medium"
        >Saturation: {{ saturation.toFixed(2) }}</BaseLabel
      >
      <div class="flex items-center gap-2">
        <BaseSlider
          :model-value="[saturation]"
          @update:modelValue="(v) => setSaturation(v[0])"
          :min="0"
          :max="2"
          :step="0.1"
        />
        <BaseButton
          size="sm"
          variant="outline"
          @click="applySaturation(currentColor)"
        >
          Apply
        </BaseButton>
      </div>
    </div>

    <div class="space-y-2">
      <BaseLabel class="text-sm font-medium">Hue shift: {{ hue }}°</BaseLabel>
      <div class="flex items-center gap-2">
        <BaseSlider
          :model-value="[hue]"
          @update:modelValue="(v) => setHue(v[0])"
          :min="-180"
          :max="180"
          :step="1"
        />
        <BaseButton size="sm" variant="outline" @click="applyHue(currentColor)">
          Apply
        </BaseButton>
      </div>
    </div>

        <!-- Contrast Section -->
      <div class="pt-4 border-t border-border">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
        <BaseLabel class="text-sm font-medium">Quick Adjustments</BaseLabel>
        </div>
        <BaseButton
          size="sm"
          variant="outline"
          class="w-full justify-start"
          v-tippy="{ 
            content: 'Automatically adjust contrast for better visual clarity and accessibility compliance',
            placement: 'top'
          }"
          @click="applyContrast(currentColor)"
        >
          <Contrast class="h-4 w-4 mr-2" />
          Auto Contrast
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Contrast } from 'lucide-vue-next';
import type { RGB } from '@color/lib/color';
import { BaseSlider, BaseButton, BaseLabel } from '@components/ui';
import { useColorAdjustments } from '@color/composables/useColorAdjustments';

const props = defineProps<{
  currentColor: RGB;
  updateColor: (c: RGB) => void;
}>();
const {
  brightness,
  saturation,
  hue,
  setBrightness,
  setSaturation,
  setHue,
  applyBrightness,
  applySaturation,
  applyHue,
  applyContrast,
} = useColorAdjustments(props.updateColor);
</script>
