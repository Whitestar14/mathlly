<!-- src/features/tools/color/components/ColorTemperature.vue -->
<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">
      Adjust color temperature
    </p>
    <div class="flex gap-2">
      <BaseButton
        size="sm"
        variant="outline"
        class="flex-1 bg-transparent"
        @click="makeWarmer(currentColor)"
      >
        <Sun class="size-4" /> Warmer
      </BaseButton>
      <BaseButton
        size="sm"
        variant="outline"
        class="flex-1 bg-transparent"
        @click="makeCooler(currentColor)"
      >
        <Moon class="size-4" /> Cooler
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useColorTemperature } from '@color/composables/useColorTemperature'
import type { RGB } from '@color/lib/color'
import { BaseButton } from '@components/ui'

const props = defineProps<{ currentColor: RGB, updateColor: (c: RGB) => void }>()
const { makeWarmer, makeCooler } = useColorTemperature(props.updateColor)
</script>