<!-- src/features/tools/color/components/ColorTemperature.vue -->
<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">Adjust color temperature</p>
    <div class="flex gap-2">
      <BaseButton size="sm" variant="outline" @click="makeWarmer(currentColor)" class="flex-1 bg-transparent">
        <Sun class="h-4 w-4 mr-2" /> Warmer
      </BaseButton>
      <BaseButton size="sm" variant="outline" @click="makeCooler(currentColor)" class="flex-1 bg-transparent">
        <Moon class="h-4 w-4 mr-2" /> Cooler
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
