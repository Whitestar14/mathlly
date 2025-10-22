<script setup lang="ts">
import { ref, unref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
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
import type { BreadcrumbItem } from '@components/ui/BasePage.vue';
import { useKeyboardStore } from '@stores/keyboard';
import { ensureDefaultPalette, fetchPalettes, addColor as serviceAddColor, sanitizeColor, type PaletteEntity } from '@color/services/palette';
import { useToast } from '@composables/ui/useToast';
import { formatRgbaPretty } from '@color/lib/utils';

import CurrentColorCard from '../components/CurrentColorCard.vue';
import PaletteManager from '../components/PaletteManager.vue';
import AdjustmentsPanel from '../components/AdjustmentsPanel.vue';
import AccessibilityToolsCard from '../components/AccessibilityToolsCard.vue';
import GeneratorsCard from '../components/GeneratorsCard.vue';
import HarmoniesCard from '../components/HarmoniesCard.vue';

// --- State ---
const current = ref<RGBA>({ r: 34, g: 197, b: 94, a: 1 });
const formats = ref<Formats>(convertColor(current.value));
const harmoniesTab = ref<
  'complementary' | 'triadic' | 'analogous' | 'monochromatic'
>('complementary');
const palettes = ref<PaletteEntity[]>([]);
const selectedPaletteId = ref<string>('default');

// --- Breadcrumbs ---
const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Tools', path: '/' },
  { label: 'Color' }
];

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
        entry.intersectionRatio < 0.5 || unref(adjustmentsPanel.isOpen);
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

const rgba = computed(() => formatRgbaPretty(current.value));

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
];

// --- Palette and Keyboard ---
const { toast } = useToast();
const keyboard = useKeyboardStore();

const addColorToPalette = async () => {
  const activePalette = palettes.value.find(p => p.id === selectedPaletteId.value);
  if (!activePalette) {
    toast({message: 'No active palette selected', type: 'error'});
    return;
  }
  const exists = activePalette.colors.some(c => c.r === current.value.r && c.g === current.value.g && c.b === current.value.b);
  if (exists) {
    toast({message: 'Color already in palette', type: 'info'});
    return;
  }
  try {
    const updatedPalette = await serviceAddColor(selectedPaletteId.value, sanitizeColor(current.value));
    if (updatedPalette) {
      palettes.value = palettes.value.map(p => p.id === updatedPalette.id ? updatedPalette : p);
      toast({message: 'Color added to palette', type: 'success'});
    } else {
      toast({message: 'Failed to add color to palette', type: 'error'});
    }
  } catch (error) {
    toast({message: 'Error adding color to palette', type: 'error'});
  }
};

const navigateHarmonyTab = (direction: 'next' | 'prev') => {
  const currentIndex = harmonyTabs.findIndex(tab => tab.value === harmoniesTab.value);
  const length = harmonyTabs.length;
  const newIndex = direction === 'next' ? (currentIndex + 1) % length : (currentIndex - 1 + length) % length;
  harmoniesTab.value = harmonyTabs[newIndex].value as typeof harmoniesTab.value;
};

onMounted(async () => {
  await ensureDefaultPalette();
  palettes.value = await fetchPalettes();
  selectedPaletteId.value = palettes.value.find(p => p.id === 'default')?.id || palettes.value[0]?.id || 'default';

  keyboard.pushContext('tools.color');
  keyboard.attachAllForContext('tools.color', {
    'Ctrl+A': () => adjustmentsPanel.toggle(),
    'Ctrl+Shift+C': copyRgba,
    'Ctrl+P': addColorToPalette,
    'Ctrl+ArrowRight': () => navigateHarmonyTab('next'),
    'Ctrl+ArrowLeft': () => navigateHarmonyTab('prev'),
  });
});

onBeforeUnmount(() => {
  keyboard.popContext('tools.color');
});
</script>

<template>
  <BasePage
    title="Color Tool"
    :breadcrumbs="breadcrumbs"
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
              :selected-palette-id="selectedPaletteId"
              :palettes="palettes"
              :on-add-to-palette="addColorToPalette"
            />
          </div>

          <GeneratorsCard
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
              :palettes="palettes"
              v-model:selected-palette-id="selectedPaletteId"
            />
            
            <AccessibilityToolsCard
              :current-color="current"
              :on-color-select="updateColor"
            />

            <HarmoniesCard
              v-model="harmoniesTab"
              :current="current"
              :tabs="harmonyTabs"
              :on-select="updateColor"
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
              <AccordionItem
                id="palette"
                title="Color Palettes"
              >
                <PaletteManager
                  :current-color="current"
                  :on-color-select="updateColor"
                  :palettes="palettes"
                  v-model:selected-palette-id="selectedPaletteId"
                />
              </AccordionItem>

              <!-- Generators -->
              <AccordionItem
                id="accessibility"
                title="Accessibility"
              >  
                <AccessibilityToolsCard
                  :current-color="current"
                  :on-color-select="updateColor"
                />
              </AccordionItem>

              <!-- Color Harmonies -->
              <AccordionItem
                id="harmonies"
                title="Color Harmonies"
              >
                <HarmoniesCard
                  v-model="harmoniesTab"
                  :current="current"
                  :tabs="harmonyTabs"
                  :on-select="updateColor"
                />
              </AccordionItem>
            </BaseAccordion>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini sticky preview (mobile only) -->
    <transition name="slide-up-fade">
      <div
        v-if="showMiniPreview"
        class="lg:hidden bg-card shadow-xl fixed bottom-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between fixed-mini-preview touch-pan-y"
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
        <BaseButton
          size="sm"
          variant="outline"
          @click.stop="copyRgba"
        >
          Copy
        </BaseButton>
      </div>
    </transition>

    <AdjustmentsPanel
      :current-color="current"
      :update-color="updateColor"
    />

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
  @apply rounded-t-lg backdrop-blur-lg bg-background/90 shadow-2xl;
}
</style>