<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEventListener } from '@vueuse/core'
import useEmblaCarousel from 'embla-carousel-vue'
import { themePackConfigs, getThemeVisualConfig, type ThemePackOption } from '@composables/core/themeConfig'
import { useTheme } from '@composables/core/useTheme'
import { ToggleBar } from '@components/ui'

interface Props {
  modelValue: ThemePackOption;
}
interface Emits {
  (e: 'update:modelValue', value: ThemePackOption): void;
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedPack = computed<ThemePackOption>({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const keys = Object.keys(themePackConfigs) as ThemePackOption[]
const computedStartIndex = Math.max(0, keys.indexOf(props.modelValue))

const [emblaViewportRef, emblaApiRef] = useEmblaCarousel({ loop: true, align: 'center', startIndex: computedStartIndex })
const selectedIndex = ref<number>(computedStartIndex)
const scrollSnaps = ref<number[]>([])

const visualMap = computed(() => {
  const map: Record<ThemePackOption, ReturnType<typeof getThemeVisualConfig>> = {} as any
  for (const key of keys) map[key] = getThemeVisualConfig(key)
  return map
})

let wheelHandler: ((e: WheelEvent) => void) | undefined
let stopWheel: (() => void) | undefined

const { setThemePack, setThemeVariant, getThemeVariant } = useTheme()

onMounted(() => {
  const api = emblaApiRef.value
  if (!api) return

  scrollSnaps.value = api.scrollSnapList()

  api.on('select', () => {
    const idx = api.selectedScrollSnap()
    selectedIndex.value = idx
  })

  const initialIdx = keys.indexOf(selectedPack.value)
  if (initialIdx >= 0 && initialIdx !== api.selectedScrollSnap()) {
    api.scrollTo(initialIdx, true)
  }
})
onBeforeUnmount(() => {
  if (stopWheel) stopWheel()
  stopWheel = undefined
  wheelHandler = undefined
})

function attachWheel() {
  const viewport = emblaViewportRef.value as HTMLElement | null
  if (!viewport || wheelHandler) return
  wheelHandler = (e: WheelEvent) => {
    e.preventDefault()
    const api = emblaApiRef.value
    if (!api) return
    const y = e.deltaY || 0
    if (y > 0) api.scrollNext()
    else if (y < 0) api.scrollPrev()
  }
  stopWheel = useEventListener(viewport, 'wheel', wheelHandler, { passive: false }) as () => void
}

function detachWheel() {
  if (stopWheel) stopWheel()
  stopWheel = undefined
  wheelHandler = undefined
}

function onPackClick(packKey: ThemePackOption) {
  if (packKey !== selectedPack.value) {
    selectedPack.value = packKey
  }
  try {
    setThemePack(packKey)
  } catch(err) {
    console.error('Failed to set theme pack with error:', err)
  }

  const idx = keys.indexOf(packKey)
  if (idx >= 0) {
    emblaApiRef.value?.scrollTo(idx)
  }
}

function scrollTo(index: number) {
  emblaApiRef.value?.scrollTo(index)
}

function variantLabel(key: string): string {
  switch (key) {
    case 'bordered':
      return 'Enhance with sharper borders'
    default:
      return key
  }
}
</script>

<template>
  <div class="space-y-4">

    <div
      ref="emblaViewportRef"
      class="overflow-hidden p-1.5"
      @mouseenter="attachWheel"
      @mouseleave="detachWheel">
      <div class="flex">
        <label
          v-for="(config, packKey) in themePackConfigs"
          :key="packKey"
          :for="`theme-${packKey}`"
          class="flex-[0_0_80%] sm:flex-[0_0_50%] px-2 cursor-pointer group"
          @click.prevent="onPackClick(packKey as ThemePackOption)">
          <div
            class="relative p-4 min-h-48 rounded-xl border-2 transition-all duration-300 bg-background hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
            :class="[
              selectedPack === (packKey as ThemePackOption)
                ? `${visualMap[packKey as ThemePackOption].colors.selectedBorder} ${visualMap[packKey as ThemePackOption].colors.selectedBg} shadow-sm dark:shadow-black/10`
                : `border-border ${visualMap[packKey as ThemePackOption].colors.hoverBg}`,
            ]">
            <input
              :id="`theme-${packKey}`"
              v-model="selectedPack"
              type="radio"
              :value="packKey"
              name="themePack"
              class="sr-only" />

            <div class="flex items-center justify-center mb-3 relative h-12">
              <div
                class="absolute inset-0 rounded-lg overflow-hidden"
                :class="visualMap[packKey as ThemePackOption].colors.accent">
                <div
                  class="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white dark:via-white/10 to-transparent"></div>
              </div>
              <div class="relative flex items-center gap-2">
                <div
                  class="h-4 w-4 rounded-full shadow-sm border border-white/20 dark:border-black/20"
                  :class="visualMap[packKey as ThemePackOption].colors.secondary"></div>
                <div
                  class="h-5 w-5 rounded-full shadow-md border-2 border-white dark:border-white/80"
                  :class="visualMap[packKey as ThemePackOption].colors.primary"></div>
                <div
                  class="h-3 w-3 rounded-full shadow-sm"
                  :class="visualMap[packKey as ThemePackOption].colors.secondary"></div>
              </div>
            </div>

            <div class="text-center select-none">
              <h4 class="font-medium text-sm text-foreground mb-1">
                {{ config.name }}
              </h4>
              <p class="text-xs text-muted-foreground leading-relaxed">
                {{ config.description }}
              </p>
            </div>

            <div
              v-if="selectedPack === (packKey as ThemePackOption)"
              class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary shadow-lg dark:shadow-black/30 flex items-center justify-center">
              <svg
                class="h-3 w-3 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </div>

            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <div
                v-if="selectedPack === (packKey as ThemePackOption) && (config.variants?.length ?? 0) > 0"
                class="mt-3 pt-3 flex flex-col gap-2 border-t border-border"
                @click.stop>
                <div
                  v-for="variant in config.variants"
                  :key="variant"
                  class="flex flex-row justify-between items-center gap-1">
                  <div class="w-2/3">
                    <p class="text-xs text-balance font-medium">
                      {{ variantLabel(variant) }}
                    </p>
                  </div>
                  <ToggleBar
                    :model-value="getThemeVariant(variant)"
                    @update:model-value="val => setThemeVariant(variant, val)" />
                </div>
              </div>
            </Transition>
          </div>
        </label>
      </div>
    </div>

    <div class="flex justify-center gap-2">
      <button
        v-for="(_, i) in scrollSnaps"
        :key="i"
        class="h-2 w-2 rounded-full transition-colors"
        :class="i === selectedIndex ? 'bg-primary' : 'bg-muted'"
        aria-label="Go to theme"
        @click="scrollTo(i)"></button>
    </div>
  </div>
</template>
