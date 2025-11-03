<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="hasOpenModals"
        class="fixed inset-0 bg-backdrop/50 backdrop-blur-sm"
        :style="{ zIndex: overlayZ }"
        @click="closeTop"></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasOpenModals, modalStackRef, closeTopModal } from '@composables/ui/useModal'

const overlayZ = computed(() => {
  const stackLength = modalStackRef.value.length ?? 0
  const base = 30
  return base + stackLength * 10 - 5
})

const closeTop = () => closeTopModal()
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>

<style>
body.has-modal-open [data-radix-popper-content-wrapper] {
  z-index: calc(var(--active-modal-z, 50) + 25) !important;
}
</style>
