<template>
  <div
    class="flex flex-col flex-grow transition-[padding] duration-300"
    :class="mainContentClasses">

    <div
      v-show="showRouteLoading"
      class="fixed left-0 top-0 h-0.5 w-full z-[100]">
      <div class="h-full w-full bg-primary animate-[loading_1.2s_ease-in-out_infinite]"></div>
    </div>
    <AppHeader
      :is-sidebar-open="unref(sidebarPanel.isOpen)"
      :is-menubar-open="unref(menuPanel.isOpen)"
      @toggle-sidebar="sidebarPanel.toggle()"
      @toggle-menubar="menuPanel.toggle()"
      @open-shortcut-modal="openShortcutModal" />

    <PanelLoader
      :component="SidebarMenu"
      :component-props="{ isMobile: device.isMobile, onSidebarClose: sidebarPanel.close }"
      side="left"
      :is-open="unref(sidebarPanel.isOpen)"
      :width-rem="16" />

    <RouterView v-slot="{ Component }">
      <Transition
        name="fade"
        mode="out-in">
        <component
          :is="Component"
          :settings="settings"
          :is-mobile="device.isMobile" />
      </Transition>
    </RouterView>

    <PanelLoader
      :component="MainMenu"
      side="right"
      :is-open="unref(menuPanel.isOpen)"
      :width-rem="16" />

    <Toast :is-mobile="device.isMobile" />
    <ModalProvider />
    <ShortcutGuide v-model:show="isShortcutModalOpen" />

    <CommandPalette />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, shallowRef, defineAsyncComponent, unref, ref, watch } from 'vue'
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
import { converterManifest } from '@converter/lib/shortcuts'
import { jsonManifest } from '@features/tools/json/lib/shortcuts'
import { qrCodeManifest } from '@features/tools/qrcode/lib/shortcuts'
import { hashManifest } from '@features/tools/hash/lib/shortcuts'

import { RouterView } from 'vue-router'
import { isRouteLoading } from '@router/router'
import { useTimeoutFn } from '@vueuse/core'

/**
 *  Note for future maintainers: the order of these imports are important
    because of the lazy loading of the components, ModalProvider must be imported after the other components
    imported lazily along with ShortcutGuide.vue. Do NOT MOVE THESE COMPONENTS AROUND.
    or the MainCalculator.vue panel loader will break!
 */
const SidebarMenu = defineAsyncComponent(() => import('../sidebar/SidebarMenu.vue'))
const MainMenu = defineAsyncComponent(() => import('../sidebar/MainMenu.vue'))
const Toast = defineAsyncComponent(() => import('@components/ui/BaseToast.vue'))
const ShortcutGuide = defineAsyncComponent(() => import('../modal/ShortcutGuide.vue'))
const ModalProvider = defineAsyncComponent(() => import('@components/ui/modal/ModalProvider.vue'))
const CommandPalette = defineAsyncComponent(() => import('@components/ui/CommandPalette.vue'))

const device = useDeviceStore()
const settings = useSettingsStore()
const keyboard = useKeyboardStore()
const { toggleTheme } = useTheme()

;[globalManifest, calculatorManifest, converterManifest, base64Manifest, colorManifest, jsonManifest, qrCodeManifest, hashManifest].flat().forEach(cfg => keyboard.register(cfg))

onMounted(() => {
  keyboard.attachListener()
  keyboard.attachAllForContext('global', {
    'Ctrl+Alt+F': () => useFullscreen(document.documentElement).toggle(),
    'Ctrl+L': () => sidebarPanel.toggle(),
    'Ctrl+M': () => menuPanel.toggle(),
    'Ctrl+Space': () => openShortcutModal(),
    'Ctrl+Shift+K': () => toggleTheme()
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

const showRouteLoading = ref(false)
let cancelShow: (() => void) | null = null
let cancelHide: (() => void) | null = null

watch(isRouteLoading, loading => {
  if (loading) {
    cancelHide?.()
    const { stop } = useTimeoutFn(() => (showRouteLoading.value = true), 120)
    cancelShow = stop
  } else {
    cancelShow?.()
    const { stop } = useTimeoutFn(() => (showRouteLoading.value = false), 150)
    cancelHide = stop
  }
})
</script>

<style scoped>
@keyframes loading {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(50%); }
  100% { transform: translateX(200%); }
}
</style>
