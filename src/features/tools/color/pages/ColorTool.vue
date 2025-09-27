<!-- src/features/tools/color/pages/ColorTool.vue -->
<template>
  <BasePage title="Color Manipulation Tool" :is-tool-layout="true" main-class="flex">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Current Color -->
          <BaseCard title="Current color">
            <template #header>
              <BaseButton variant="ghost" size="sm" @click="generateRandomColor">
                <Shuffle class="h-4 w-4 mr-2" /> Random
              </BaseButton>
            </template>

            <div class="space-y-4">
              <div class="w-full h-32 rounded-lg border border-border" :style="{ backgroundColor: formats.hex }" />

              <div class="space-y-4">
                <div v-for="k in ['r','g','b']" :key="k" class="space-y-2">
                  <BaseLabel>{{ labelMap[k] }}: {{ current[k] }}</BaseLabel>
                  <BaseSlider
                    :model-value="[current[k]]"
                    @update:modelValue="v => setRgb(k as any, v[0])"
                    :min="0" :max="255" :step="1"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <BaseLabel for="hex-input">Hex color</BaseLabel>
                <BaseInput id="hex-input" :value="formats.hex" @input="onHexInput" placeholder="#000000" />
              </div>
            </div>
          </BaseCard>

          <!-- Color Tools -->
          <BaseCard title="Color tools">
            <template #header>
              <BaseTabs
                v-model="tab"
                :tabs="[
                  { value: 'adjustments', label: 'Adjust' },
                  { value: 'temperature', label: 'Temp' },
                  { value: 'mixing', label: 'Mix' }
                ]"
              />
            </template>

            <div class="mt-4">
              <ColorAdjustments v-if="tab === 'adjustments'" :current-color="current" :update-color="updateColor" />
              <ColorTemperature v-else-if="tab === 'temperature'" :current-color="current" :update-color="updateColor" />
              <ColorMixing v-else :current-color="current" :update-color="updateColor" />
            </div>
          </BaseCard>

          <!-- Color Formats -->
          <BaseCard title="Color formats">
            <ColorFormats :formats="formats" />
          </BaseCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <PaletteManager :current-color="current" :on-color-select="updateColor" />
          <MicroTools :current-color="current" :on-color-select="updateColor" />

          <!-- Harmonies -->
          <BaseCard title="Color harmonies">
            <template #header>
              <BaseTabs
                v-model="harmoniesTab"
                :tabs="[
                  { value: 'complementary', label: 'Comp' },
                  { value: 'triadic', label: 'Triadic' },
                  { value: 'analogous', label: 'Analogous' },
                  { value: 'monochromatic', label: 'Mono' }
                ]"
              />
            </template>

            <ColorHarmonies
              :current="current"
              :active="harmoniesTab"
              @update:active="harmoniesTab = $event"
              :onSelect="updateColor"
            />
          </BaseCard>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseSlider, BaseCard, BaseButton, BaseInput, BaseLabel, BasePage,
} from '@components/ui'
import BaseTabs from '@components/ui/BaseTabs.vue'
import { Shuffle } from 'lucide-vue-next'
import {
  convertColor,
  generateRandomColor as getRandomColor,
} from '../composables/useColor'
import type { RGB, ColorFormats as Formats } from '../types/color'

import PaletteManager from '@color/components/PaletteManager.vue'
import MicroTools from '@color/components/MicroTools.vue'
import ColorAdjustments from '../components/ColorAdjustments.vue'
import ColorTemperature from '../components/ColorTemperature.vue'
import ColorMixing from '../components/ColorMixing.vue'
import ColorFormats from '../components/ColorFormats.vue'
import ColorHarmonies from '../components/ColorHarmonies.vue'
import { useToast } from '@composables/ui/useToast'

const current = ref<RGB>({ r: 34, g: 197, b: 94 })
const formats = ref<Formats>(convertColor(current.value))
const tab = ref<'adjustments' | 'temperature' | 'mixing'>('adjustments')
const harmoniesTab = ref<'complementary' | 'triadic' | 'analogous' | 'monochromatic'>('complementary')
const { toast } = useToast()

const labelMap: Record<'r'|'g'|'b', string> = { r: 'Red', g: 'Green', b: 'Blue' }

const updateColor = (c: RGB) => {
  current.value = c
  formats.value = convertColor(c)
}

const setRgb = (component: 'r'|'g'|'b', value: number) => {
  updateColor({
    ...current.value,
    [component]: Math.max(0, Math.min(255, Math.round(value))),
  })
}

const HEX6 = /^#[0-9A-Fa-f]{6}$/
const onHexInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (HEX6.test(val)) {
    updateColor(convertColor(val).rgb)
  } else {
    toast({ title: 'Invalid hex', description: 'Use 6-digit hex like #1A2B3C' })
  }
}

const generateRandomColor = () => updateColor(getRandomColor())
</script>
