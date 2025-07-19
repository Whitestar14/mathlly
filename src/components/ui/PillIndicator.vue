<template>
  <div
    class="absolute will-change-transform rounded-full bg-primary/80 transition-all duration-300 ease-in-out"
    :style="computedStyle"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  position: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: Number,
    default: 15,
  },
  width: {
    type: Number,
    default: 2,
  }
})

const computedStyle = computed(() => {
  const style = { ...props.position }
  if ('left' in style || 'right' in style) {
    [style.height, style.width] = [`${props.width}px`, `${props.height}px`]
  } else if ('top' in style || 'bottom' in style) {
    [style.height, style.width] = [`${props.height}px`, `${props.width}px`]
  }
  return style
})
</script>
