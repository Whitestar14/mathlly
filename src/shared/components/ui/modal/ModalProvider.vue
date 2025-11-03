<template>
  <SharedModalOverlay />
</template>

<script setup lang="ts">
import SharedModalOverlay from './SharedModalOverlay.vue'
</script>

<style scoped>
#modal-root {
  position: relative;
  z-index: var(--active-modal-z, 40);
}
</style>
