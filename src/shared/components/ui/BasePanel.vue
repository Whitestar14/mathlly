<template>
  <div class="relative z-20 flex flex-col flex-initial">
    <div
      v-if="!isMobile"
      class="h-full">

      <SidePanel
        v-if="type === 'side'"
        v-bind="panelProps"
        :position="position"
        @close="close"
        @toggle="toggle">
        <template #default>
          <slot></slot>
        </template>
        <template #sticky>
          <slot name="sticky"></slot>
        </template>
        <template #header-actions>
          <slot name="header-actions"></slot>
        </template>
        <template
          v-if="$slots.footer"
          #footer>
          <slot name="footer"></slot>
        </template>
      </SidePanel>

      <DesktopPanel
        v-if="type === 'drawer'"
        v-bind="panelProps"
        :position="position"
        @close="close"
        @toggle="toggle">
        <template #default>
          <slot></slot>
        </template>
        <template #sticky>
          <slot name="sticky"></slot>
        </template>
        <template #header-actions>
          <slot name="header-actions"></slot>
        </template>
        <template
          v-if="$slots.footer"
          #footer>
          <slot name="footer"></slot>
        </template>
      </DesktopPanel>
    </div>

    <div
      v-else
      ref="mobilePanelContainer">

      <Transition :name="animationEnabled ? 'fade' : ''">
        <div
          v-show="isOpen"
          class="fixed inset-0 z-20"
          :class="backdropClasses"
          aria-hidden="true"
          @click="() => close()"></div>
      </Transition>

      <BottomPanel
        v-bind="mobileProps"
        @close="close"
        @toggle="toggle({ expanded: true })">
        <template #default>
          <slot></slot>
        </template>
        <template #sticky>
          <slot name="sticky"></slot>
        </template>
        <template #header-actions>
          <slot name="header-actions"></slot>
        </template>
        <template
          v-if="$slots.footer"
          #footer>
          <slot name="footer"></slot>
        </template>
      </BottomPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch, onBeforeUnmount } from 'vue'
import { useThrottleFn, useScrollLock } from '@vueuse/core'
import { useFocusTrap } from '@composables/utils/useFocusTrap'
import { usePanel } from '@composables/ui/usePanel'
import type { PanelAPI } from '@composables/ui/types'
import { useSettingsStore } from '@stores/settings'

interface Props {
  id: string;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
  mainClass?: string;
  contentClass?: string;
  type?: string;
  position?: 'left' | 'right';
  maxHeightRatio?: number;
  snapThreshold?: number;
  storageKey?: string;
  defaultDesktopState?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
  title: '',
  mainClass: '',
  contentClass: '',
  type: 'drawer',
  position: 'right',
  maxHeightRatio: 0.8,
  snapThreshold: 0.3,
  storageKey: 'panel',
  defaultDesktopState: false
})

const SidePanel = defineAsyncComponent(() =>
  import('./panel/SidePanel.vue')
)

const DesktopPanel = defineAsyncComponent(() =>
  import('./panel/DesktopPanel.vue')
)

const BottomPanel = defineAsyncComponent(() =>
  import('./panel/BottomPanel.vue')
)

const settingsStore = useSettingsStore()
const animationEnabled = computed(() => !settingsStore.appearance.animationDisabled)

const options = {
  storageKey: props.id || props.storageKey,
  defaultDesktopState: props.defaultDesktopState,
  maxHeightRatio: props.maxHeightRatio,
  snapThreshold: props.snapThreshold,
  animation: () => animationEnabled.value
}

const panelInstance = usePanel(props.id, options) as PanelAPI

const {
  isOpen,
  isMobile,
  isExpanded,
  toggle,
  close,
  handle,
  panel,
  isDragging,
  panelHeight,
  translateY
} = panelInstance

const panelProps = computed(() => ({
  isOpen: isOpen.value,
  title: props.title,
  showHeader: props.showHeader,
  showFooter: props.showFooter,
  contentClass: props.contentClass,
  mainClass: props.mainClass
}))

const mobileProps = computed(() => ({
  ...panelProps.value,
  panel: panel,
  handle: handle,
  isExpanded: isExpanded.value,
  isDragging: isDragging.value,
  translateY: translateY.value,
  panelHeight: panelHeight.value,
  maxHeightRatio: props.maxHeightRatio,
  animationEnabled: animationEnabled.value
}))

const backdropClasses = computed(() => [
  isDragging.value ? 'bg-backdrop/20' : 'bg-backdrop/40',
  animationEnabled.value ?
    'backdrop-blur-sm transition-colors duration-300' :
    'bg-backdrop/50'
])

const mobilePanelContainer = ref<HTMLElement | null>(null)

const { activate, deactivate } = useFocusTrap(mobilePanelContainer)

const isTrapActive = ref(false)
const isLocked = useScrollLock(document.body)

const throttledActivate = useThrottleFn(() => {
  if (!isTrapActive.value) {
    activate()
    isTrapActive.value = true
  }
}, 100)

const throttledDeactivate = useThrottleFn(() => {
  if (isTrapActive.value) {
    deactivate()
    isTrapActive.value = false
  }
}, 100)

watch([() => isOpen.value, () => isMobile.value], ([open, mobile]) => {
  if (open && mobile) {
    throttledActivate()
  } else {
    throttledDeactivate()
  }
  isLocked.value = open && mobile
}, { immediate: true })

onBeforeUnmount(() => {
  if (isTrapActive.value) {
    deactivate()
  }
})
</script>

<style scoped>
:deep(.panel-side) {
  @apply overflow-hidden h-screen hidden md:flex flex-col fixed top-0 z-20 bottom-0 bg-panel inset-y-0;
}
</style>
