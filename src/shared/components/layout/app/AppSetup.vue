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

    <div class="relative">
      <Suspense @resolve="panelStates.sidebar.isLoaded = true">
        <sidebar-menu
          :is-mobile="device.isMobile"
          @sidebar-close="sidebarPanel.close()"
        />
        <template #fallback>
          <div 
            v-if="panelStates.sidebar.isOpen" 
            class="w-64 h-screen hidden md:flex fixed top-0 left-0 bg-background border-r border-border z-20"
          />
        </template>
      </Suspense>
    </div>

    <Suspense>
      <app-view
        :settings="settings"
        :is-mobile="device.isMobile"
      />
      <template #fallback>
        <div class="flex-grow flex items-center justify-center">
          <div class="w-20 h-20 rounded-full bg-muted animate-pulse" />
        </div>
      </template>
    </Suspense>

    <div class="relative">
      <Suspense @resolve="panelStates.menu.isLoaded = true">
        <main-menu />
        <template #fallback>
          <div 
            v-if="panelStates.menu.isOpen" 
            class="w-64 h-screen fixed hidden md:flex top-0 right-0 bg-background border-l border-border z-20"
          />
        </template>
      </Suspense>
    </div>

    <Suspense>
      <toast :is-mobile="device.isMobile" />
    </Suspense>
    
    <Suspense>
      <ShortcutGuide
        v-if="panelStates.isLoaded"
        v-model:show="isShortcutModalOpen"
      />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, computed, unref, shallowRef, reactive, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useFullscreen, useLocalStorage } from "@vueuse/core";
import { useDeviceStore } from "@stores/device";
import { useSettingsStore } from "@stores/settings.ts";
import { useKeyboard } from "@composables/ui/useKeyboard";
import { usePanel } from "@composables/ui/usePanel";
import { useTheme } from "@composables/core/useTheme";
import { AppHeader } from "@components/layout";

const SidebarMenu = defineAsyncComponent(() => import("../sidebar/SidebarMenu.vue"));
const AppView = defineAsyncComponent(() => import("./AppView.vue"));
const MainMenu = defineAsyncComponent(() => import("../sidebar/MainMenu.vue"));
const Toast = defineAsyncComponent(() => import("@components/ui/BaseToast.vue"));
const ShortcutGuide = defineAsyncComponent(() => import("../modal/ShortcutGuide.vue"));

const router = useRouter();
const device = useDeviceStore();
const settings = useSettingsStore();

const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));

await Promise.all([
  settings.loadSettings(),
  router.isReady(),
  minLoadTime,
])

device.initializeDeviceInfo();

const { toggleTheme } = useTheme();

const panelStates = reactive({
  sidebar: { isOpen: false, isLoaded: false },
  menu: { isOpen: false, isLoaded: false },
  isLoaded: false
});

const isShortcutModalOpen = shallowRef(false);

const sidebarPanel = usePanel('sidebar');
const menuPanel = usePanel('menu');

function openShortcutModal() {
  isShortcutModalOpen.value = true;
}

useKeyboard("global", {
  toggleSidebar: () => sidebarPanel.toggle(),
  toggleMenubar: () => menuPanel.toggle(),
  toggleFullscreen: () => useFullscreen(document.documentElement).toggle(),
  toggleTheme,
  openShortcutModal,
});

const mainContentClasses = computed(() => {
  if (device.isMobile) return [];
  
  const classes = [];

  if (!panelStates.sidebar.isLoaded || !panelStates.menu.isLoaded) {
    if (panelStates.sidebar.isOpen) classes.push('md:pl-64');
    if (panelStates.menu.isOpen) classes.push('md:pr-64');
  }

  if (unref(sidebarPanel.isOpen)) classes.push('md:pl-64');
  if (unref(menuPanel.isOpen)) classes.push('md:pr-64');

  return classes;
});

const preloadPanelStates = () => {
  const defaults = {
    desktop: { isOpen: false },
    mobile: { isOpen: false }
  };

  const sidebarPrefs = useLocalStorage('sidebar-preferences', defaults);
  const menuPrefs = useLocalStorage('menu-preferences', defaults);
  
  panelStates.sidebar.isOpen = sidebarPrefs.value.desktop.isOpen;
  panelStates.menu.isOpen = menuPrefs.value.desktop.isOpen;
  
  panelStates.isLoaded = true;
};

preloadPanelStates();

onUnmounted(device.destroyDeviceInfo);
</script>
