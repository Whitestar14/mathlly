<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  BasePage,
  BaseButton,
  BaseAccordion,
  AccordionItem,
} from '@components/ui';
import { convertColor } from '@color/lib/color';
import type { RGB, RGBA, ColorFormats as Formats } from '@color/lib/color';
import { useClipboard } from '@vueuse/core';
import { usePanel } from '@composables/ui/usePanel';

import CurrentColorCard from '../components/CurrentColorCard.vue';
import PaletteManager from '../components/PaletteManager.vue';
import AdjustmentsCard from '../components/AdjustmentsCard.vue';
import AccessibilityToolsCard from '../components/AccessibilityToolsCard.vue';
import GeneratorsCard from '../components/GeneratorsCard.vue';
import HarmoniesCard from '../components/HarmoniesCard.vue';

// --- State ---
const current = ref<RGBA>({ r: 34, g: 197, b: 94, a: 1 });
const formats = ref<Formats>(convertColor(current.value));
const harmoniesTab = ref<
  'complementary' | 'triadic' | 'analogous' | 'monochromatic'
>('complementary');

// --- Methods ---
const updateColor = (c: RGB & { a?: number }) => {
  const next: RGBA = { r: c.r, g: c.g, b: c.b, a: c.a ?? current.value.a ?? 1 };
  if (
    next.r === current.value.r &&
    next.g === current.value.g &&
    next.b === current.value.b &&
    next.a === current.value.a
  )
    return;
  current.value = next;
  formats.value = convertColor(next);
};

// --- Sticky mini-preview logic (mobile only) ---
const currentCardRoot = ref<HTMLElement | null>(null);
const showMiniPreview = ref(false);
const adjustmentsPanel = usePanel('adjustments');

let observer: IntersectionObserver | null = null;
let observedEl: Element | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      showMiniPreview.value =
        entry.intersectionRatio < 0.5 || adjustmentsPanel.isOpen;
    },
    { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
  );

  if (currentCardRoot.value) {
    observedEl = currentCardRoot.value;
    observer.observe(observedEl);
  }

  watch(
    () => adjustmentsPanel.isOpen,
    (open) => {
      if (open) {
        showMiniPreview.value = true;
      } else if (observedEl) {
        const rect = observedEl.getBoundingClientRect();
        const ratio = rect.height
          ? Math.min(
              1,
              Math.max(0, (window.innerHeight - rect.top) / rect.height)
            )
          : 0;
        showMiniPreview.value = ratio < 0.5;
      } else {
        showMiniPreview.value = false;
      }
    },
    { immediate: true }
  );
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  observedEl = null;
});

const rgba = ref(`rgba(${current.value.r}, ${current.value.g}, ${current.value.b}, ${current.value.a})`)

// --- Clipboard ---
const { copy } = useClipboard();
const copyRgba = async () => {
  await copy(rgba.value);
};

// --- Scroll helper ---
const scrollToCard = () => {
  currentCardRoot.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const harmonyTabs = [
  { value: 'complementary', label: 'Comp' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'monochromatic', label: 'Mono' },
]
</script>

<template>
  <BasePage
    title="Color Manipulation Tool"
    :is-tool-layout="true"
    main-class="flex"
  >
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Current Color -->
          <div ref="currentCardRoot">
            <CurrentColorCard
              :current="current"
              :formats="formats"
              :update-color="updateColor"
            />
          </div>

          <AccessibilityToolsCard
            :current-color="current"
            :on-color-select="updateColor"
          />
        </div>

        <!-- Sidebar -->
        <div class="space-y-2">
          <!-- Desktop: Show individual components -->
          <div class="hidden lg:block space-y-6">
            <PaletteManager
              :current-color="current"
              :on-color-select="updateColor"
            />
            <GeneratorsCard
              :current-color="current"
              :on-color-select="updateColor"
            />
            <HarmoniesCard
              v-model="harmoniesTab"
              :current="current"
              :tabs="harmonyTabs"
              :onSelect="updateColor"
            />
          </div>

          <!-- Mobile: Show accordion -->
          <div class="lg:hidden pb-10">
            <BaseAccordion
              default-value="palette"
              :multiple="false"
              :collapsible="true"
              class="w-full"
            >
              <!-- Palette Manager -->
              <AccordionItem id="palette" title="Color Palettes">
                <PaletteManager
                  :current-color="current"
                  :on-color-select="updateColor"
                />
              </AccordionItem>

              <!-- Generators -->
              <AccordionItem id="generators" title="Color Generators">
                <GeneratorsCard
                  :current-color="current"
                  :on-color-select="updateColor"
                />
              </AccordionItem>

              <!-- Color Harmonies -->
              <AccordionItem id="harmonies" title="Color Harmonies">
                <HarmoniesCard
                  v-model="harmoniesTab"
                  :current="current"
                  :tabs="harmonyTabs"
                  :onSelect="updateColor"
                />
              </AccordionItem>
            </BaseAccordion>
          </div>
        </div>
      </div>
    </div>

    <AdjustmentsCard :current-color="current" :update-color="updateColor" />

    <!-- Mini sticky preview (mobile only) -->
    <transition name="slide-up-fade">
      <div
        v-if="showMiniPreview"
        ref="miniPreviewEl"
        class="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between fixed-mini-preview touch-pan-y"
        @click="scrollToCard"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded border"
            :style="{ backgroundColor: rgba }"
          />
          <div class="flex flex-col text-xs font-mono">
            <span>{{ rgba }}</span>
            <span class="text-muted-foreground">{{ formats.hex }}</span>
          </div>
        </div>
        <BaseButton size="sm" variant="outline" @click.stop="copyRgba"
          >Copy</BaseButton
        >
      </div>
    </transition>
  </BasePage>
</template>

<style scoped>
.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-fade-enter-from,
.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(100%) scale(0.95);
}
.fixed-mini-preview {
  @apply rounded-t-lg backdrop-blur-md bg-background/90 shadow-2xl;
}
</style>
