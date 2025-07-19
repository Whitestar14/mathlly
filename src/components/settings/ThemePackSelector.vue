<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import type { ThemePackOption } from '@/composables/useTheme';

interface Props {
  modelValue: ThemePackOption;
}

interface Emits {
  (e: 'update:modelValue', value: ThemePackOption): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { themePackConfigs, getThemeVisualConfig } = useTheme();

const selectedPack = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-3 block">
      Choose a theme pack:
    </label>

    <div class="grid grid-cols-2 gap-4 mt-4">
      <label
        v-for="(config, packKey) in themePackConfigs"
        :key="packKey"
        :for="`theme-${packKey}`"
        class="cursor-pointer group"
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
            <!-- Background pattern -->
            <div
              class="absolute inset-0 rounded-lg overflow-hidden"
              :class="getThemeVisualConfig(packKey).colors.accent"
            >
              <div
                class="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white dark:via-white/10 to-transparent"
              />
            </div>

            <!-- Color circles -->
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
          <div class="text-center">
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
            class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary shadow-lg dark:shadow-black/30 flex items-center justify-center transform transition-transform duration-200"
          >
            <svg
              class="h-3 w-3 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- Hover glow effect -->
          <div
            class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-primary/5 dark:from-primary/10 via-transparent to-primary/5 dark:to-primary/10"
          />
        </div>
      </label>
    </div>
  </div>
</template>
