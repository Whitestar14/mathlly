<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BaseCard, BasePage, BaseButton } from '@components/ui'
import BaseTabs from '@components/ui/BaseTabs.vue'
import { convertColor } from '@color/lib/color'
import type { RGB, RGBA, ColorFormats as Formats } from '@color/lib/color'

import CurrentColorCard from '../components/CurrentColorCard.vue'
import PaletteManager from '@color/components/PaletteManager.vue'
import AdjustmentsCard from '../components/AdjustmentsCard.vue'
import AccessibilityToolsCard from '../components/AccessibilityToolsCard.vue'
import GeneratorsCard from '../components/GeneratorsCard.vue'
import ColorHarmonies from '../components/ColorHarmonies.vue'

const current = ref<RGBA>({ r: 34, g: 197, b: 94, a: 1 })
const formats = ref<Formats>(convertColor(current.value))
const harmoniesTab = ref<'complementary' | 'triadic' | 'analogous' | 'monochromatic'>('complementary')

const updateColor = (c: RGB & { a?: number }) => {
  const next: RGBA = { r: c.r, g: c.g, b: c.b, a: c.a ?? current.value.a ?? 1 }
  const same =
    next.r === current.value.r &&
    next.g === current.value.g &&
    next.b === current.value.b &&
    next.a === current.value.a
  if (same) return
  current.value = next
  formats.value = convertColor(next)
}

// --- Sticky mini-preview logic (mobile only) ---
const currentCardRoot = ref<HTMLElement | null>(null)
const showMiniPreview = ref(false)

let observer: IntersectionObserver | null = null
let observedEl: Element | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      // Show mini-preview when less than 50% visible
      showMiniPreview.value = entry.intersectionRatio < 0.5
    },
    {
      // Fire at every 1% visibility change for smoothness
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    }
  )

  if (currentCardRoot.value) {
    observedEl = currentCardRoot.value
    observer.observe(observedEl)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  observedEl = null
})

const rgbaText = () =>
  `rgba(${current.value.r}, ${current.value.g}, ${current.value.b}, ${current.value.a})`

const copyRgba = async () => {
  await navigator.clipboard.writeText(rgbaText())
}

const scrollToCard = () => {
  currentCardRoot.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <BasePage title="Color Manipulation Tool" :is-tool-layout="true" main-class="flex">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Wrap the card in a real element to observe -->
          <div ref="currentCardRoot">
            <CurrentColorCard
              :current="current"
              :formats="formats"
              :update-color="updateColor"
            />
          </div>
          <AdjustmentsCard :current-color="current" :update-color="updateColor" />
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <PaletteManager :current-color="current" :on-color-select="updateColor" />
          <AccessibilityToolsCard :current-color="current" :on-color-select="updateColor" />
          <GeneratorsCard :current-color="current" :on-color-select="updateColor" />
          <BaseCard title="Color harmonies">
            <template #header>
              <BaseTabs
                v-model="harmoniesTab"
                :tabs="[
                  { value: 'complementary', label: 'Comp' },
                  { value: 'triadic', label: 'Triadic' },
                  { value: 'analogous', label: 'Analogous' },
                  { value: 'monochromatic', label: 'Mono' },
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

    <!-- Mini sticky preview (mobile only) -->
    <transition name="slide-up-fade">
      <div
        v-if="showMiniPreview"
        class="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between fixed-mini-preview"
        @click="scrollToCard"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded border"
            :style="{ backgroundColor: rgbaText() }"
          />
          <div class="flex flex-col text-xs font-mono">
            <span>{{ rgbaText() }}</span>
            <span class="text-muted-foreground">{{ formats.hex }}</span>
          </div>
        </div>
        <BaseButton size="sm" variant="outline" @click.stop="copyRgba">Copy</BaseButton>
      </div>
    </transition>
  </BasePage>
</template>

<style scoped>
.slide-up-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-fade-enter-from {
  opacity: 0;
  transform: translateY(100%) scale(0.95);
}
.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(100%) scale(0.95);
}
.fixed-mini-preview {
  @apply rounded-t-lg backdrop-blur-md bg-background/90 shadow-2xl;
}
</style>
