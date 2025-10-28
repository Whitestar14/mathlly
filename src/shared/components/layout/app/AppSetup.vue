<template>
  <div
    class="flex flex-col flex-grow transition-[padding] duration-300"
    :class="mainContentClasses"
  >
    <app-header
      :is-sidebar-open="unref(sidebarPanel.isOpen)"
      :is-menubar-open="unref(menuPanel.isOpen)"
      @toggle-sidebar="sidebarPanel.toggle()"
      @toggle-menubar="menuPanel.toggle()"
      @open-shortcut-modal="openShortcutModal"
    />

    <PanelLoader
      :component="SidebarMenu"
      :componentProps="{ isMobile: device.isMobile, onSidebarClose: sidebarPanel.close }"
      side="left"
      :isOpen="unref(sidebarPanel.isOpen)"
      :widthRem="16"
    />

    <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
            <component 
              :is="Component"
              :settings="settings"
              :is-mobile="device.isMobile"
              />
            </Transition>
      </RouterView>

    <PanelLoader :component="MainMenu" side="right" :isOpen="unref(menuPanel.isOpen)" :widthRem="16" />

    <Toast :is-mobile="device.isMobile" />
    <ShortcutGuide v-model:show="isShortcutModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, shallowRef, defineAsyncComponent, unref, ref } from 'vue'
import { useDeviceStore } from '@stores/device'
import { useKeyboardStore } from '@stores/keyboard'
import { useSettingsStore } from '@stores/settings'
import { usePanel } from '@composables/ui/usePanel'
import { useTheme } from '@composables/core/useTheme'
import { useFullscreen } from '@vueuse/core'
import { AppHeader } from '@components/layout'
import PanelLoader from '@components/ui/panel/PanelLoader.vue'

import { globalManifest } from '@app/lib/shortcuts'
import { calculatorManifest } from '@calculator/lib/shortcuts'
import { base64Manifest } from '@base64/lib/shortcuts'
import { colorManifest } from '@color/lib/shortcuts'

import { RouterView } from 'vue-router'

const SidebarMenu = defineAsyncComponent(() => import('../sidebar/SidebarMenu.vue'))
const MainMenu = defineAsyncComponent(() => import('../sidebar/MainMenu.vue'))
const Toast = defineAsyncComponent(() => import('@components/ui/BaseToast.vue'))
const ShortcutGuide = defineAsyncComponent(() => import('../modal/ShortcutGuide.vue'))

const device = useDeviceStore()
const settings = useSettingsStore()
const keyboard = useKeyboardStore()
const { toggleTheme } = useTheme()

// init keyboard shortcuts
;[globalManifest, calculatorManifest, base64Manifest, colorManifest].flat().forEach(cfg => keyboard.register(cfg))

onMounted(() => {
  keyboard.attachListener()
  keyboard.attachAllForContext('global', {
    'Ctrl+Alt+F': () => useFullscreen(document.documentElement).toggle(),
    'Ctrl+L': () => sidebarPanel.toggle(),
    'Ctrl+M': () => menuPanel.toggle(),
    'Ctrl+Space': () => openShortcutModal(),
    'Ctrl+Shift+M': () => toggleTheme(),
  })
  keyboard.pushContext('global')
})

onUnmounted(device.destroyDeviceInfo)

const sidebarPanel = usePanel('sidebar')
const menuPanel = usePanel('menu')
const isShortcutModalOpen = shallowRef(false)

function openShortcutModal() {
  isShortcutModalOpen.value = true
}

const mainContentClasses = computed(() => {
  if (device.isMobile) return []
  const classes: string[] = []
  if (unref(sidebarPanel.isOpen)) classes.push('md:pl-64')
  if (unref(menuPanel.isOpen)) classes.push('md:pr-64')
  return classes
})
</script>