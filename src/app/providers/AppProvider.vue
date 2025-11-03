<template>
  <div
    class="min-h-screen flex transition-colors duration-300">
    <AppSetup />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, watchEffect, onMounted, type Ref } from 'vue'
import { createPanelContext } from '@composables/ui/panelContext'
import { useDeviceStore } from '@stores/device'
import { useSettingsStore } from '@stores/settings'
import { useAppStorageStore } from '@stores/appStorage'
import AppSetup from '@components/layout/app/AppSetup.vue'

const device = useDeviceStore()
const settings = useSettingsStore()
const { actions } = createPanelContext()

const storageStore = useAppStorageStore()
storageStore.initialize()

onMounted(() => { device.initializeDeviceInfo() })

watch(() => device.isMobile, newVal => {
  actions.setMobile(newVal)
}, { immediate: true })

function useBodyClasses(classes: Ref<Record<string, boolean>>) {
  watchEffect(() => {
    document.body.classList.forEach(cls => {
      if (cls.startsWith('border-style-')) {
        document.body.classList.remove(cls)
      }
    })

    Object.entries(classes.value).forEach(([cls, active]) => {
      document.body.classList.toggle(cls, active)
    })
  })
}

const globalClasses = computed(() => ({
  'animation-disabled': settings.appearance.animationDisabled,
  [`border-style-${settings.appearance.borderRadius}`]: true
}))

useBodyClasses(globalClasses)

const textSize = computed(() => settings.display.textSize ?? 'medium')

watch(textSize, newSize => {
  const root = document.documentElement
  for (const size of ['small', 'normal', 'medium', 'large']) {
    root.classList.toggle(`ts-${size}`, size === newSize)
  }
}, { immediate: true })
</script>
