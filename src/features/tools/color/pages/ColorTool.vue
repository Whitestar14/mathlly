<script setup lang="ts">
import {
  ref,
  unref,
  onMounted,
  onBeforeUnmount,
  computed,
  defineAsyncComponent,
  Suspense,
  h,
  Transition,
} from 'vue';
import {
  BasePage,
  BaseButton,
  BaseAccordion,
  AccordionItem,
  BaseCard,
}
// Assuming these are from your component library
from '@components/ui';
import { convertColor, isValidRGBA } from '@color/lib/color';
import type { RGB, RGBA, ColorFormats as Formats } from '@color/lib/color';
import { useClipboard, useThrottleFn } from '@vueuse/core';
import { usePanel } from '@composables/ui/usePanel';
import type { BreadcrumbItem } from '@components/ui/BasePage.vue';
import { useKeyboardStore } from '@stores/keyboard';
import {
  ensureDefaultPalette,
  fetchPalettes,
  addColor as serviceAddColor,
  sanitizeColor,
  type PaletteEntity,
} from '@color/services/palette';
import { useToast } from '@composables/ui/useToast';
import { formatRgbaPretty } from '@color/lib/utils';
import { useColorOptions } from '@color/composables/useColorOptions';
import { appStorage } from '@services/storage';

// Local components (kept for context, though they are likely separate files in your project)
import CurrentColorCard from '../components/CurrentColorCard.vue';
import AdjustmentsPanel from '../components/AdjustmentsPanel.vue';
import PanelLoader from '@components/ui/panel/PanelLoader.vue'
import PaletteManagerSkeleton from '../components/PaletteManagerSkeleton.vue';

// Async Components
const PaletteManager = defineAsyncComponent(
  () => import('../components/PaletteManager.vue')
);
const GeneratorsCard = defineAsyncComponent(
  () => import('../components/GeneratorsCard.vue')
);
const HarmoniesCard = defineAsyncComponent(
  () => import('../components/HarmoniesCard.vue')
);
const AccessibilityToolsCard = defineAsyncComponent(
  () => import('../components/AccessibilityToolsCard.vue')
);

// --- State ---
const current = ref<RGBA>({ r: 34, g: 197, b: 94, a: 1 });
const formats = ref<Formats>(convertColor(current.value));
const harmoniesTab = ref<
  'complementary' | 'triadic' | 'analogous' | 'monochromatic'
>('complementary');
const palettes = ref<PaletteEntity[]>([]);
const selectedPaletteId = ref<string>('default');
const palettesLoading = ref(true);

// --- Storage ---
const COLOR_STORAGE_KEY = 'lastUsedColor';

// --- Breadcrumbs ---
const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Tools', path: '/' },
  { label: 'Color' },
];

// --- Functional Component for Reusing Suspense/Transition Logic ---
// This centralizes the wrapper logic for all sidebar cards (Palette, Accessibility, Harmonies)
interface SuspenseWrapperProps {
  component: any; // The async component to render
  fallback: any;  // The skeleton component/template for the fallback
  props?: Record<string, any>; // Props to pass to the component
}

const SuspenseCardWrapper = (props: SuspenseWrapperProps) => {
  return h(Suspense, null, {
    default: () => h(Transition, { name: 'fade', mode: 'out-in', appear: true }, () => h('div', [h(props.component, props.props)])),
    fallback: () => h(props.fallback),
  });
};


// --- Template Content Definitions (Centralized Logic using Functional Components) ---
// These functions return the centralized VNodes for the sidebar content.

// 1. Palette Manager Content
const PaletteManagerContent = () => h(SuspenseCardWrapper, {
  component: PaletteManager,
  fallback: PaletteManagerSkeleton,
  props: {
    'current-color': current.value,
    'on-color-select': updateColor,
    'palettes': palettes.value,
    'selected-palette-id': selectedPaletteId.value,
    // Note: Event handling is passed through to the wrapper props
    'onUpdate:selectedPaletteId': (id: string) => selectedPaletteId.value = id,
    'onUpdate:palettes': (p: PaletteEntity[]) => palettes.value = p,
  }
});

// 2. Accessibility Tools Content
// Fallback is defined as VNodes using h() to render the BaseCard skeleton
const AccessibilityContent = () => h(SuspenseCardWrapper, {
  component: AccessibilityToolsCard,
  fallback: () => h(BaseCard, { title: 'Accessibility Tools', class: 'h-[250px]' }, [
      h('div', { class: 'flex gap-2 mb-4' }, [
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' }),
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' }),
      ]),
      h('div', { class: 'flex gap-2 mb-4' }, [
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
      ]),
      h('div', { class: 'h-4 bg-muted rounded animate-pulse' }),
    ]),
  props: {
    'current-color': current.value,
    'on-color-select': updateColor,
  }
});

// 3. Harmonies Card Content
const HarmoniesContent = () => h(SuspenseCardWrapper, {
  component: HarmoniesCard,
  fallback: () => h(BaseCard, { class: 'h-[200px]' }, [
      h('div', { class: 'flex gap-2 mb-4' }, [
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' }),
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' }),
      ]),
      h('div', { class: 'grid grid-cols-4 gap-2' }, [
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
      ]),
    ]),
  props: {
    // v-model is converted to modelValue and onUpdate:modelValue props
    'modelValue': harmoniesTab.value,
    'onUpdate:modelValue': (v: 'complementary' | 'triadic' | 'analogous' | 'monochromatic') => harmoniesTab.value = v,
    'current': current.value,
    'tabs': harmonyTabs,
    'on-select': updateColor,
  }
});


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
  saveColor(next);
};

const saveColor = useThrottleFn((color: RGBA) => {
  appStorage.set('router', COLOR_STORAGE_KEY, String(color));
}, 500);

// --- Sticky mini-preview logic (mobile only) ---
const currentCardRoot = ref<HTMLElement | null>(null);
const showMiniPreview = ref(false);
const adjustmentsPanel = usePanel('adjustments');

let observer: IntersectionObserver | null = null;
let observedEl: Element | null = null;

const shouldShowMiniPreview = computed(() => {
  if (adjustmentsPanel.isOpen) return true;
  if (!observedEl) return false;
  const rect = observedEl.getBoundingClientRect();
  const ratio = rect.height ? Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height)) : 0;
  return ratio < 0.5;
});

onMounted(() => {
  observer = new IntersectionObserver(
    () => {
      showMiniPreview.value = shouldShowMiniPreview.value;
    },
    { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
  );

  if (currentCardRoot.value) {
    observedEl = currentCardRoot.value;
    observer.observe(observedEl);
  }
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

  toast({ message: 'RGBA color copied to clipboard', type: 'success' });
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
const { autoApplyAdjustments } = useColorOptions();

const addColorToPalette = async () => {
  const activePalette = palettes.value.find(
    (p) => p.id === selectedPaletteId.value
  );
  if (!activePalette) {
    toast({ message: 'No active palette selected', type: 'error' });
    return;
  }
  const exists = activePalette.colors.some(
    (c) =>
      c.r === current.value.r &&
      c.g === current.value.g &&
      c.b === current.value.b
  );
  if (exists) {
    toast({ message: 'Color already in palette', type: 'info' });
    return;
  }
  try {
    const updatedPalette = await serviceAddColor(
      selectedPaletteId.value,
      sanitizeColor(current.value)
    );
    if (updatedPalette) {
      palettes.value = palettes.value.map((p) =>
        p.id === updatedPalette.id ? updatedPalette : p
      );
      toast({ message: 'Color added to palette', type: 'success' });
    } else {
      toast({ message: 'Failed to add color to palette', type: 'error' });
    }
  } catch (error) {
    toast({ message: 'Error adding color to palette', type: 'error' });
  }
};

onMounted(async () => {
  // Color persistence: Restore saved color
  try {
    const savedColor = appStorage.get('router', COLOR_STORAGE_KEY, null);
    if (savedColor && isValidRGBA(savedColor)) {
      current.value = savedColor;
      formats.value = convertColor(current.value);
    }
  } catch (error) {
    console.warn('Failed to load saved color:', error);
  }

  palettesLoading.value = true;
  try {
    await ensureDefaultPalette();
    palettes.value = await fetchPalettes();
    // This logic ensures 'selectedPaletteId' is always a valid ID from the loaded palettes
    selectedPaletteId.value =
      palettes.value.find((p) => p.id === 'default')?.id ||
      palettes.value[0]?.id ||
      'default';
  } catch (error) {
    toast({ message: 'Failed to load palettes', type: 'error' });
  } finally {
    palettesLoading.value = false;
  }

  keyboard.pushContext('tools.color');
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
        <!-- Main Content (Generators Card) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Current Color Card (Kept outside template block as it is always visible) -->
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

          <!-- Generators Card (Always in main column) -->
          <Suspense>
            <template #default>
              <Transition name="fade" mode="out-in" appear>
                <div>
                  <GeneratorsCard
                    :current-color="current"
                    :on-color-select="updateColor"
                  />
                </div>
              </Transition>
            </template>
            <template #fallback>
              <BaseCard title="Gradient Generator" class="h-[250px]">
                <div class="h-20 bg-muted rounded animate-pulse mb-4"></div>
                <div class="flex gap-2 mb-2">
                  <div class="h-8 w-12 bg-muted rounded animate-pulse"></div>
                  <div class="h-8 w-12 bg-muted rounded animate-pulse"></div>
                </div>
                <div class="h-4 bg-muted rounded animate-pulse"></div>
              </BaseCard>
            </template>
          </Suspense>
        </div>

        <!-- Sidebar / Accordion Wrapper -->
        <div class="space-y-2">

          <!-- --- USAGE: Render the functional components --- -->

          <!-- Desktop: Show individual components (lg:block) -->
          <div class="hidden lg:block space-y-6">
            <PaletteManagerContent />
            <AccessibilityContent />
            <HarmoniesContent />
          </div>

          <!-- Mobile: Show accordion (lg:hidden) -->
          <div class="lg:hidden pb-10">
            <BaseAccordion
              default-value="palette"
              :multiple="false"
              :collapsible="true"
              class="w-full"
            >
              <!-- Palette Manager in Accordion -->
              <AccordionItem id="palette" title="Color Palettes">
                <PaletteManagerContent />
              </AccordionItem>

              <!-- Accessibility in Accordion -->
              <AccordionItem id="accessibility" title="Accessibility">
                <AccessibilityContent />
              </AccordionItem>

              <!-- Color Harmonies in Accordion -->
              <AccordionItem id="harmonies" title="Color Harmonies">
                <HarmoniesContent />
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
        class="md:hidden bg-card shadow-xl fixed bottom-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between fixed-mini-preview touch-pan-y"
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
        <BaseButton size="sm" variant="outline" @click.stop="copyRgba">
          Copy
        </BaseButton>
      </div>
    </transition>

    <PanelLoader
      :component="AdjustmentsPanel"
      :isOpen="unref(adjustmentsPanel.isOpen)"
      side="left"
      panelType="drawer"
      :componentProps="{ currentColor: current, updateColor: updateColor, autoApply: autoApplyAdjustments }"
    />
  </BasePage>
</template>
