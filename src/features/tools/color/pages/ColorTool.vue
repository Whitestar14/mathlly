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
  Transition
} from 'vue'
import {
  BasePage,
  BaseButton,
  BaseAccordion,
  AccordionItem,
  BaseCard
}
  from '@components/ui'
import { convertColor, isValidRGBA } from '@color/lib/color'
import type { RGB, RGBA, ColorFormats as Formats } from '@color/lib/color'
import { useClipboard, useThrottleFn, useElementVisibility } from '@vueuse/core'
import { usePanel } from '@composables/ui/usePanel'
import type { BreadcrumbItem } from '@components/ui/BasePage.vue'
import { useKeyboardStore } from '@stores/keyboard'
import {
  ensureDefaultPalette,
  fetchPalettes,
  addColor as serviceAddColor,
  sanitizeColor,
  type PaletteEntity
} from '@color/services/palette'
import { useToast } from '@composables/ui/useToast'
import { formatRgbaPretty } from '@color/lib/utils'
import { useColorOptions } from '@color/composables/useColorOptions'
import { useAppStorageStore } from '@stores/appStorage'
import { useColorHistory } from '@color/composables/useColorHistory'

import CurrentColorCard from '@color/components/CurrentColorCard.vue'
import AdjustmentsPanel from '@color/components/AdjustmentsPanel.vue'
import DesktopPanelLoader from '@components/ui/panel/DesktopPanelLoader.vue'
import PaletteManagerSkeleton from '@color/components/PaletteManagerSkeleton.vue'

const PaletteManager = defineAsyncComponent(
  () => import('../components/PaletteManager.vue')
)
const GeneratorsCard = defineAsyncComponent(
  () => import('../components/GeneratorsCard.vue')
)
const HarmoniesCard = defineAsyncComponent(
  () => import('../components/HarmoniesCard.vue')
)
const AccessibilityToolsCard = defineAsyncComponent(
  () => import('../components/AccessibilityToolsCard.vue')
)

const current = ref<RGBA>({ r: 34, g: 197, b: 94, a: 1 })
const formats = ref<Formats>(convertColor(current.value))
const harmoniesTab = ref<
  'complementary' | 'triadic' | 'analogous' | 'monochromatic'
>('complementary')
const palettes = ref<PaletteEntity[]>([])
const selectedPaletteId = ref<string>('default')
const palettesLoading = ref(true)

const COLOR_STORAGE_KEY = 'lastUsedColor'
const storageStore = useAppStorageStore()

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Tools', path: '/' },
  { label: 'Color' }
]

interface SuspenseWrapperProps {
  component: any;
  fallback: any;
  props?: Record<string, any>;
}

const SuspenseCardWrapper = (props: SuspenseWrapperProps) => {
  return h(Suspense, null, {
    default: () => h(Transition, { name: 'fade', mode: 'out-in', appear: true }, () => h('div', [h(props.component, props.props)])),
    fallback: () => h(props.fallback)
  })
}

const PaletteManagerContent = () => h(SuspenseCardWrapper, {
  component: PaletteManager,
  fallback: () => h(PaletteManagerSkeleton),
  props: {
    'current-color': current.value,
    'on-color-select': updateColor,
    'palettes': palettes.value,
    'selected-palette-id': selectedPaletteId.value,
    'onUpdate:selectedPaletteId': (id: string) => selectedPaletteId.value = id,
    'onUpdate:palettes': (p: PaletteEntity[]) => palettes.value = p
  }
})

const AccessibilityContent = () => h(SuspenseCardWrapper, {
  component: AccessibilityToolsCard,
  fallback: () => h(BaseCard, { title: 'Accessibility Tools', class: 'h-[250px]' }, {
    default: () => [
      h('div', { class: 'flex gap-2 mb-4' }, [
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' }),
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' })
      ]),
      h('div', { class: 'flex gap-2 mb-4' }, [
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' })
      ]),
      h('div', { class: 'h-4 bg-muted rounded animate-pulse' })
    ]
  }),
  props: {
    'current-color': current.value,
    'on-color-select': updateColor
  }
})

const HarmoniesContent = () => h(SuspenseCardWrapper, {
  component: HarmoniesCard,
  fallback: () => h(BaseCard, { class: 'h-[200px]' }, {
    default: () => [
      h('div', { class: 'flex gap-2 mb-4' }, [
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' }),
        h('div', { class: 'h-8 w-16 bg-muted rounded animate-pulse' })
      ]),
      h('div', { class: 'grid grid-cols-4 gap-2' }, [
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' }),
        h('div', { class: 'w-8 h-8 bg-muted rounded animate-pulse' })
      ])
    ]
  }),
  props: {
    'modelValue': harmoniesTab.value,
    'onUpdate:modelValue': (v: 'complementary' | 'triadic' | 'analogous' | 'monochromatic') => harmoniesTab.value = v,
    'current': current.value,
    'tabs': harmonyTabs,
    'on-select': updateColor
  }
})

const updateColor = (c: RGB & { a?: number }) => {
  const next: RGBA = { r: c.r, g: c.g, b: c.b, a: c.a ?? current.value.a ?? 1 }
  if (
    next.r === current.value.r &&
    next.g === current.value.g &&
    next.b === current.value.b &&
    next.a === current.value.a
  )
    return
  current.value = next
  addToHistory(next)
  formats.value = convertColor(next)
  saveColor(next)
}

const saveColor = useThrottleFn((color: RGBA) => {
  storageStore.set('router', COLOR_STORAGE_KEY, color)
}, 500)

const currentCardRoot = ref<HTMLElement | null>(null)
const adjustmentsPanel = usePanel('adjustments')
const sidebarPanel = usePanel('sidebar')
const menuPanel = usePanel('menu')

const isCardVisible = useElementVisibility(currentCardRoot, { threshold: 0.5 })

const shouldShowMiniPreview = computed(() => {
  if (sidebarPanel.isOpen) return false
  if (menuPanel.isOpen) return false
  if (adjustmentsPanel.isOpen) return true
  return !isCardVisible.value
})

const rgba = computed(() => formatRgbaPretty(current.value))

const { copy } = useClipboard()
const { error: errorToast, info } = useToast()
const copyRgba = async() => {
  await copy(rgba.value)
  info('RGBA color copied to clipboard', { title: 'Copied!' })
}

const scrollToCard = () => {
  currentCardRoot.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const harmonyTabs = [
  { value: 'complementary', label: 'Comp' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'monochromatic', label: 'Mono' }
]

const keyboard = useKeyboardStore()
const { autoApplyAdjustments, showImageExtractor } = useColorOptions()

const { canUndo, addToHistory, undo: undoColor } = useColorHistory()

const addColorToPalette = async() => {
  const activePalette = palettes.value.find(
    p => p.id === selectedPaletteId.value
  )
  if (!activePalette) {
    info('No active palette selected')
    return
  }
  const exists = activePalette.colors.some(
    c =>
      c.r === current.value.r &&
      c.g === current.value.g &&
      c.b === current.value.b
  )
  if (exists) {
    info('Color already in palette')
    return
  }
  try {
    const updatedPalette = await serviceAddColor(
      selectedPaletteId.value,
      sanitizeColor(current.value)
    )
    if (updatedPalette) {
      palettes.value = palettes.value.map(p =>
        p.id === updatedPalette.id ? updatedPalette : p
      )
      info('Color added to palette', { title: 'Added' })
    } else {
      errorToast('Failed to add color to palette')
    }
  } catch(e) {
    errorToast(e as string, { title: 'Error adding color to palette' })
  }
}

const handleUndo = () => {
  const previousColor = undoColor()
  if (previousColor) {
    current.value = previousColor
    formats.value = convertColor(previousColor)
    saveColor(previousColor)
  }
}

onMounted(async() => {
  try {
    const savedColor = storageStore.get('router', COLOR_STORAGE_KEY, { r: 22, g: 64, b: 196, a: 1 })
    if (savedColor && isValidRGBA(savedColor)) {
      current.value = savedColor
      formats.value = convertColor(current.value)
    }
  } catch(error) {
    console.warn('Failed to load saved color:', error)
  }

  addToHistory(current.value)

  palettesLoading.value = true
  try {
    await ensureDefaultPalette()
    palettes.value = await fetchPalettes()
    selectedPaletteId.value =
      palettes.value.find(p => p.id === 'default')?.id ||
      palettes.value[0]?.id ||
      'default'
  } catch(e) {
    errorToast(e as string, { title: 'Failed to load palettes' })
  } finally {
    palettesLoading.value = false
  }

  keyboard.pushContext('tools.color')
})

const refreshPalettes = async() => {
  palettesLoading.value = true
  try {
    await ensureDefaultPalette()
    const freshPalettes = await fetchPalettes()
    palettes.value = freshPalettes

    const stillExists = freshPalettes.some(p => p.id === selectedPaletteId.value)
    if (!stillExists) {
      selectedPaletteId.value = freshPalettes.find(p => p.id === 'default')?.id || freshPalettes[0]?.id || 'default'
    }
  } catch(e) {
    errorToast(e as string, { title: 'Failed to refresh palettes' })
  } finally {
    palettesLoading.value = false
  }
}

onBeforeUnmount(() => {
  keyboard.popContext('tools.color')
})

defineExpose({ refreshPalettes })
</script>

<template>
  <BasePage
    title="Color Tool"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div ref="currentCardRoot">
            <CurrentColorCard
              :current="current"
              :formats="formats"
              :update-color="updateColor"
              :selected-palette-id="selectedPaletteId"
              :palettes="palettes"
              :on-add-to-palette="addColorToPalette"
              :on-undo="handleUndo"
              :can-undo="canUndo" />
          </div>

          <Suspense>
            <template #default>
              <Transition
                name="fade"
                mode="out-in"
                appear>
                <div>
                  <GeneratorsCard
                    :current-color="current"
                    :on-color-select="updateColor" />
                </div>
              </Transition>
            </template>
            <template #fallback>
              <BaseCard
                title="Gradient Generator"
                class="h-[250px]">
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

        <div class="space-y-2">
          <div class="hidden lg:block space-y-6">
            <PaletteManagerContent />
            <AccessibilityContent />
            <HarmoniesContent />
          </div>

          <div class="lg:hidden pb-10">
            <BaseAccordion
              default-value="palette"
              :multiple="false"
              :collapsible="true"
              class="w-full">
              <AccordionItem
                id="palette"
                title="Color Palettes">
                <PaletteManagerContent />
              </AccordionItem>

              <AccordionItem
                id="accessibility"
                title="Accessibility">
                <AccessibilityContent />
              </AccordionItem>

              <AccordionItem
                id="harmonies"
                title="Color Harmonies">
                <HarmoniesContent />
              </AccordionItem>
            </BaseAccordion>
          </div>
        </div>
      </div>
    </div>

    <Transition name="slide-up-fade">
      <div
        v-if="shouldShowMiniPreview"
        class="md:hidden bg-card shadow-xl fixed bottom-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between fixed-mini-preview touch-pan-y"
        @click="scrollToCard">
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded border"
            :style="{ backgroundColor: rgba }"></div>
          <div class="flex flex-col text-xs font-mono">
            <span>{{ rgba }}</span>
            <span class="text-muted-foreground">{{ formats.hex }}</span>
          </div>
        </div>
        <BaseButton
          size="sm"
          variant="outline"
          @click.stop="copyRgba">
          Copy
        </BaseButton>
      </div>
    </Transition>

    <DesktopPanelLoader
      :component="AdjustmentsPanel"
      :is-open="unref(adjustmentsPanel.isOpen)"
      position="left"
      :component-props="{
        currentColor: current,
        updateColor: updateColor,
        autoApply: autoApplyAdjustments,
        showImageExtractor: showImageExtractor,
      }" />
  </BasePage>
</template>
