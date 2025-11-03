<template>
  <div>

    <MobileDevDock
      v-if="isMobile"
      :tools="tools"
      :active-panels="activePanels"
      :active-panel-keys="activePanelKeys"
      :active-mobile-panel-index="activeMobilePanelIndex"
      :is-expanded="isExpanded"
      @toggle-expanded="toggleExpanded"
      @toggle-panel="togglePanel"
      @set-active-mobile-panel-index="setActiveMobilePanelIndex" />

    <DesktopDevDock
      v-else
      :tools="tools"
      :active-panels="activePanels"
      :active-panel-keys="activePanelKeys"
      :current-desktop-panel="currentDesktopPanel"
      :is-expanded="isExpanded"
      :is-dock-open="isDockOpen"
      @toggle-dock="toggleDock"
      @toggle-panel="togglePanel"
      @set-current-panel="setCurrentDesktopPanel"
      @navigate-panel="navigatePanel"
      @close-all="closeAll"
      @close-current-panel="closeCurrentPanel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useWindowSize, useEventListener } from '@vueuse/core'
import DesktopDevDock from './DesktopDevDock.vue'
import MobileDevDock from './MobileDevDock.vue'
import PWATestPanelContent from './PWATestPanelContent.vue'
import VersionInfoPanel from './VersionInfoPanel.vue'
import PerformancePanel from './PerformancePanel.vue'
import ConsolePanel from './ConsolePanel.vue'
import StatePanel from './StatePanel.vue'
import KeyboardShortcuts from './KeyboardShortcuts.vue'
import { useAppStorageStore } from '@stores/appStorage'

const storageStore = useAppStorageStore()

const PANEL_KEYS = ['pwa', 'version', 'performance', 'console', 'state', 'shortcuts'] as const
type PanelKey = typeof PANEL_KEYS[number]

interface ActivePanels extends Record<string, boolean> {
  pwa: boolean
  version: boolean
  performance: boolean
  console: boolean
  state: boolean
  shortcuts: boolean
}

interface Tool {
  key: string
  icon: string
  label: string
  component: any
  title: string
}

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

const isExpanded = ref(storageStore.get('devDock', 'expanded', false))
const isDockOpen = ref(storageStore.get('devDock', 'open', false))

watch(isExpanded, val => storageStore.set('devDock', 'expanded', val))
watch(isDockOpen, val => storageStore.set('devDock', 'open', val))

const defaultPanels: ActivePanels = {
  pwa: false,
  version: false,
  performance: false,
  console: false,
  state: false,
  shortcuts: false
}

const activePanels = ref<ActivePanels>(
  (storageStore.get('devDock', 'panels', defaultPanels) ??
    defaultPanels) as ActivePanels
)

watch(activePanels, val => storageStore.set('devDock', 'panels', val), { deep: true })

const currentDesktopPanel = ref<string | null>(storageStore.get('devDock', 'currentPanel', null))

watch(currentDesktopPanel, val => storageStore.set('devDock', 'currentPanel', val))

const activeMobilePanelIndex = ref(0)

const tools: Tool[] = [
  {
    key: 'pwa',
    icon: 'RefreshCw',
    label: 'PWA',
    component: PWATestPanelContent,
    title: 'PWA Testing'
  },
  {
    key: 'version',
    icon: 'Info',
    label: 'Version',
    component: VersionInfoPanel,
    title: 'Version Info'
  },
  {
    key: 'performance',
    icon: 'Activity',
    label: 'Performance Monitor',
    component: PerformancePanel,
    title: 'Performance Monitor'
  },
  {
    key: 'console',
    icon: 'Terminal',
    label: 'Console Logger',
    component: ConsolePanel,
    title: 'Console Logger'
  },
  {
    key: 'state',
    icon: 'Database',
    label: 'State Inspector',
    component: StatePanel,
    title: 'State Inspector'
  },
  {
    key: 'shortcuts',
    icon: 'Keyboard',
    label: 'Keyboard Shortcuts',
    component: KeyboardShortcuts,
    title: 'Keyboard Shortcuts'
  }
]

const activePanelKeys = computed((): string[] => {
  return Object.keys(activePanels.value).filter(key =>
    activePanels.value[key as keyof ActivePanels]
  )
})

watch(activePanelKeys, async(newKeys: string[]) => {
  if (!isMobile.value) {
    if (currentDesktopPanel.value && !newKeys.includes(currentDesktopPanel.value)) {
      currentDesktopPanel.value = newKeys.length > 0 ? newKeys[0] : null
    }

    if (!currentDesktopPanel.value && newKeys.length > 0) {
      currentDesktopPanel.value = newKeys[0]
    }

    if (newKeys.length === 0) {
      currentDesktopPanel.value = null
      isExpanded.value = false
    } else {
      await nextTick()
      isExpanded.value = true
    }
  }
}, { immediate: true })

const isValidPanelKey = (key: string): key is PanelKey => {
  return PANEL_KEYS.includes(key as PanelKey)
}

const toggleDock = (): void => {
  isDockOpen.value = !isDockOpen.value
}

const togglePanel = async(panel: string): Promise<void> => {
  if (!isValidPanelKey(panel)) {
    console.warn(`Invalid panel key: ${panel}`)
    return
  }

  const wasActive = activePanels.value[panel]
  activePanels.value[panel] = !wasActive

  await nextTick()

  if (activePanels.value[panel]) {
    if (isMobile.value) {
      const newIndex = activePanelKeys.value.indexOf(panel)
      if (newIndex !== -1) {
        activeMobilePanelIndex.value = newIndex
      }
    } else {
      currentDesktopPanel.value = panel
    }

    isExpanded.value = true
  }

  if (isMobile.value && activeMobilePanelIndex.value >= activePanelKeys.value.length) {
    activeMobilePanelIndex.value = Math.max(0, activePanelKeys.value.length - 1)
  }
}

const setCurrentDesktopPanel = (panel: string): void => {
  if (isMobile.value) return

  if (!isValidPanelKey(panel)) {
    console.warn(`Invalid panel key: ${panel}`)
    return
  }

  currentDesktopPanel.value = panel
  isExpanded.value = true // Ensure expansion when switching panels
}

const navigatePanel = (direction: number): void => {
  if (isMobile.value || activePanelKeys.value.length <= 1 || !currentDesktopPanel.value) return

  const currentIndex = activePanelKeys.value.indexOf(currentDesktopPanel.value)
  const newIndex = currentIndex + direction

  if (newIndex >= 0 && newIndex < activePanelKeys.value.length) {
    currentDesktopPanel.value = activePanelKeys.value[newIndex]
  }
}

const closeCurrentPanel = (): void => {
  if (!currentDesktopPanel.value) return
  togglePanel(currentDesktopPanel.value)
}

const toggleExpanded = (): void => {
  isExpanded.value = !isExpanded.value
}

const setActiveMobilePanelIndex = (index: number): void => {
  activeMobilePanelIndex.value = index
}

const closeAll = (): void => {
  PANEL_KEYS.forEach(key => {
    activePanels.value[key] = false
  })
  isExpanded.value = false
  activeMobilePanelIndex.value = 0
  currentDesktopPanel.value = null
  isDockOpen.value = false
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (isMobile.value || !e.ctrlKey || !e.shiftKey) return

  switch (e.key.toLowerCase()) {
    case 'd':
      e.preventDefault()
      toggleDock()
      break
    case 'p':
      e.preventDefault()
      togglePanel('pwa')
      break
    case 'v':
      e.preventDefault()
      togglePanel('version')
      break
    case 'c':
      e.preventDefault()
      togglePanel('console')
      break
    case 's':
      e.preventDefault()
      togglePanel('state')
      break
    case 'k':
      e.preventDefault()
      togglePanel('shortcuts')
      break
    case 'a':
      e.preventDefault()
      togglePanel('performance')
      break
    case 'arrowleft':
      e.preventDefault()
      navigatePanel(-1)
      break
    case 'arrowright':
      e.preventDefault()
      navigatePanel(1)
      break
    case 'escape':
      e.preventDefault()
      closeAll()
      break
  }
})
</script>
