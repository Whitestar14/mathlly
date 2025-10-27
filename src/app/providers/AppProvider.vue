<template>
  <div 
    class="min-h-screen flex transition-colors duration-300"
    :class="globalClasses"
  >
    <AppSetup />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { createPanelContext } from '@composables/ui/panelContext'
import { useDeviceStore } from '@stores/device'
import { useSettingsStore } from '@stores/settings'
import { useAppStorageStore } from '@stores/appStorage'
import AppSetup from '@components/layout/app/AppSetup.vue'
const device = useDeviceStore()
const settings = useSettingsStore()
const { actions } = createPanelContext()

const storageStore = useAppStorageStore()
storageStore.ensureStorageVersion()
storageStore.initialize()

onMounted(async () => {
  device.initializeDeviceInfo()

  actions.setMobile(device.isMobile)
})

watch(() => device.isMobile, newVal => {
  actions.setMobile(newVal)
})

const globalClasses = computed(() => {
  const classes = []
  if (settings.appearance.animationDisabled) classes.push('animation-disabled')
  classes.push(`border-style-${settings.appearance.borderRadius}`)
  return classes
})

const textSize = computed(() => (settings.display.textSize ?? 'medium'))

watch(textSize, newSize => {
  const root = document.documentElement
  for (const size of ['small', 'normal', 'medium', 'large'])
    root.classList.toggle(`ts-${size}`, size === newSize)
}, { immediate: true })
</script>