<script setup lang="ts">
import { computed } from 'vue'
import { CircleHelp, Palette } from 'lucide-vue-next'
import { RadioGroupRoot, RadioGroupItem, Separator } from 'radix-vue'
import { ToggleBar, BaseCollapsible } from '@components/ui'
import type { Settings } from '@services/storage/db'

interface Props {
  settings: Settings;
  isVisible: boolean;
}

interface Emits {
  (e: 'update:settings', settings: Settings): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const textSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
]

const borderRadiusOptions = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'rounded', label: 'Rounded' }
]

const localSettings = computed({
  get: () => props.settings,
  set: value => emit('update:settings', value)
})
</script>

<template>
  <BaseCollapsible
    v-if="isVisible"
    id="themes"
    title="Appearance"
    :icon="Palette"
    :default-open="true">
    <div class="space-y-6">
      <div class="px-3 py-2 rounded-md bg-muted/40 border border-border/40">
        <p class="text-xs text-muted-foreground">
          <span class="font-bold">Theme settings</span> have been moved to the menu (open the menu and select "Themes") for a more immediate experience and to avoid first-paint flicker.
        </p>
      </div>

      <div>
        <label
          for="textSize"
          class="text-sm font-medium text-foreground mb-1.5 block">
          Text Size
        </label>
        <div class="mt-2">
          <RadioGroupRoot
            v-model="localSettings.display.textSize"
            class="inline-flex items-center rounded-md bg-muted p-1">
            <div class="flex space-x-1">
              <RadioGroupItem
                v-for="option in textSizeOptions"
                :key="option.value"
                :value="option.value"
                class="rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                :class="[
                  localSettings.display.textSize === option.value
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ]">
                {{ option.label }}
              </RadioGroupItem>
            </div>
          </RadioGroupRoot>
        </div>
        <p class="mt-1 text-xs text-muted-foreground">
          Adjust the size of text throughout the application
        </p>
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="max-w-[80%]">
          <div class="flex items-center gap-2">
            <label
              for="animationDisabled"
              class="text-sm font-medium text-foreground">
              Disable Animation
            </label>
            <CircleHelp
              v-tippy="{
                content:
                  'May experience layout thrashing and flashes during transitions. Backdrops will be disabled.',
                placement: 'top',
                onShow() {
                  return true;
                },
              }"
              class="h-4 w-4 cursor-help" />
          </div>
          <p class="text-xs text-muted-foreground">
            Turn off animations for improved performance or reduced motion
          </p>
        </div>
        <ToggleBar v-model="localSettings.appearance.animationDisabled" />
      </div>

      <div>
        <label
          for="borderRadius"
          class="text-sm font-medium text-foreground mb-1.5 block">
          Border Style
        </label>
        <div class="mt-2">
          <RadioGroupRoot
            v-model="localSettings.appearance.borderRadius"
            class="inline-flex items-center rounded-md bg-muted p-1">
            <div class="flex space-x-1">
              <RadioGroupItem
                v-for="option in borderRadiusOptions"
                :key="option.value"
                :value="option.value"
                class="rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200"
                :class="[
                  localSettings.appearance.borderRadius === option.value
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ]">
                {{ option.label }}
              </RadioGroupItem>
            </div>
          </RadioGroupRoot>
        </div>
        <p class="mt-1 text-xs text-muted-foreground">
          Choose between sharp modern edges or rounded friendly corners
        </p>
      </div>

      <Separator class="h-px w-full bg-border" />

      <div class="flex items-center justify-between py-2">
        <div class="max-w-[80%]">
          <div class="flex items-center gap-2">
            <label
              for="checkForUpdates"
              class="text-sm font-medium text-foreground">
              Check for Updates
            </label>
          </div>
          <p class="text-xs text-muted-foreground">
            Automatically check for new updates in the background
          </p>
        </div>
        <ToggleBar v-model="localSettings.appearance.checkForUpdates" />
      </div>
    </div>
  </BaseCollapsible>
</template>