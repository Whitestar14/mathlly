<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { themePackConfigs, getThemeVisualConfig, type ThemePackOption } from '@composables/core/themeConfig'
import useEmblaCarousel from "embla-carousel-vue";

interface Props {
  modelValue: ThemePackOption;
}
interface Emits {
  (e: "update:modelValue", value: ThemePackOption): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedPack = computed<ThemePackOption>({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Embla setup
const [emblaViewportRef, emblaApiRef] = useEmblaCarousel({ loop: true, align: "center" });
const selectedIndex = ref(0);
const scrollSnaps = ref<number[]>([]);

onMounted(() => {
  if (!emblaApiRef.value) {
    // embla initializes asynchronously; try again on next tick
    setTimeout(() => {
      if (!emblaApiRef.value) return;
      scrollSnaps.value = emblaApiRef.value.scrollSnapList();
      emblaApiRef.value.on("select", () => {
        selectedIndex.value = emblaApiRef.value?.selectedScrollSnap() ?? 0;
      });
    }, 50);
    return;
  }
  scrollSnaps.value = emblaApiRef.value.scrollSnapList();
  emblaApiRef.value.on("select", () => {
    selectedIndex.value = emblaApiRef.value?.selectedScrollSnap() ?? 0;
  });
});

function scrollTo(index: number) {
  emblaApiRef.value?.scrollTo(index);
}
</script>

<template>
  <div class="space-y-4">
    <!-- Carousel viewport -->
    <div class="overflow-hidden p-1.5" ref="emblaViewportRef">
      <div class="flex">
        <label
          v-for="(config, packKey) in themePackConfigs"
          :key="packKey"
          :for="`theme-${packKey}`"
          class="flex-[0_0_80%] sm:flex-[0_0_50%] px-2 cursor-pointer group"
        >
          <div
            class="relative p-4 rounded-xl border-2 transition-all duration-300 bg-background hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
            :class="[
              selectedPack === packKey
                ? `${getThemeVisualConfig(packKey).colors.selectedBorder} ${getThemeVisualConfig(packKey).colors.selectedBg} shadow-sm dark:shadow-black/10`
                : `border-border ${getThemeVisualConfig(packKey).colors.hoverBg}`,
            ]"
          >
            <input
              :id="`theme-${packKey}`"
              v-model="selectedPack"
              type="radio"
              :value="packKey"
              name="themePack"
              class="sr-only"
            />

            <!-- Theme Preview -->
            <div class="flex items-center justify-center mb-3 relative h-12">
              <div
                class="absolute inset-0 rounded-lg overflow-hidden"
                :class="getThemeVisualConfig(packKey).colors.accent"
              >
                <div
                  class="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white dark:via-white/10 to-transparent"
                />
              </div>
              <div class="relative flex items-center gap-2">
                <div
                  class="h-4 w-4 rounded-full shadow-sm border border-white/20 dark:border-black/20"
                  :class="getThemeVisualConfig(packKey).colors.secondary"
                />
                <div
                  class="h-5 w-5 rounded-full shadow-md border-2 border-white dark:border-white/80"
                  :class="getThemeVisualConfig(packKey).colors.primary"
                />
                <div
                  class="h-3 w-3 rounded-full shadow-sm"
                  :class="getThemeVisualConfig(packKey).colors.secondary"
                />
              </div>
            </div>

            <!-- Theme Info -->
            <div class="text-center select-none">
              <h4 class="font-medium text-sm text-foreground mb-1">
                {{ config.name }}
              </h4>
              <p class="text-xs text-muted-foreground leading-relaxed">
                {{ config.description }}
              </p>
            </div>

            <!-- Selected Indicator -->
            <div
              v-if="selectedPack === packKey"
              class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary shadow-lg dark:shadow-black/30 flex items-center justify-center"
            >
              <svg class="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Pagination dots -->
    <div class="flex justify-center gap-2">
      <button
        v-for="(_, i) in scrollSnaps"
        :key="i"
        @click="scrollTo(i)"
        class="h-2 w-2 rounded-full transition-colors"
        :class="i === selectedIndex ? 'bg-primary' : 'bg-muted'"
      />
    </div>
  </div>
</template>
