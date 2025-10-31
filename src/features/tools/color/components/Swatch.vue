<!-- src/features/tools/color/components/Swatch.vue -->
<template>
  <div class="relative w-12 h-12">
    <button
      type="button"
      class="w-full h-full rounded-md border border-border shadow-sm cursor-pointer transition hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      :style="{ backgroundColor: hex }"
      :title="hex"
      @click="$emit('click', color)"
    />
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RGB } from '@color/lib/color'
import { rgbToHex } from '@color/lib/color'

const props = defineProps<{ color: RGB }>()
defineEmits<EmitType>()
type EmitType = { (event: "click", value: RGB ) : void }
const hex = computed(() => rgbToHex(props.color))
</script>
