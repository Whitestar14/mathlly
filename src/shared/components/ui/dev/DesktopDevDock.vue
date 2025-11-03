<template>
  <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">

    <div class="flex justify-center">
      <button
        v-tippy="{
          content: isDockOpen ? 'Close Developer Tools' : `Developer Tools${activePanelCount > 0 ? ` (${activePanelCount} active)` : ''}`,
          placement: 'top'
        }"
        class="group relative bg-background/95 dark:bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl p-3 transition-all duration-300"
        :class="{
          'bg-primary/90 border-primary/50': isDockOpen,
          'rounded-xl': !isDockOpen,
          'rounded-l-xl rounded-r-none': isDockOpen,
          'hover:scale-110 active:scale-95': !isDockOpen
        }"
        @click="$emit('toggleDock')">
        <CodeIcon
          class="h-5 w-5 text-foreground transition-transform duration-300"
          :class="{ 'rotate-180': isDockOpen }" />
      </button>

      <div
        v-if="activePanelCount > 0 && !isDockOpen"
        class="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-primary text-foreground text-xs font-bold rounded-full flex items-center justify-center border-2 border-border">
        {{ activePanelCount }}
      </div>

      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform scale-x-0"
        enter-to-class="opacity-100 transform scale-x-100"
        leave-active-class="transition-all duration-250 ease-in"
        leave-from-class="opacity-100 transform scale-x-100"
        leave-to-class="opacity-0 transform scale-x-0">
        <div
          v-if="isDockOpen"
          class="bg-background/95 dark:bg-background/95 backdrop-blur-xl rounded-r-xl border border-border/50 border-l-0 shadow-2xl origin-left">
          <HorizontalDockToolbar
            :tools="tools"
            :active-panels="activePanels"
            :active-panel-keys="activePanelKeys"
            :current-panel="currentDesktopPanel"
            @toggle-panel="$emit('togglePanel', $event)"
            @set-current-panel="$emit('setCurrentPanel', $event)"
            @navigate-panel="$emit('navigatePanel', $event)"
            @close-all="$emit('closeAll')" />
        </div>
      </Transition>
    </div>
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 transform translate-y-6 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-250 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform translate-y-6 scale-95"
      mode="out-in">
      <div
        v-if="isExpanded && currentDesktopPanel"
        :key="`panel-${currentDesktopPanel}`"
        class="fixed inset-0 z-40 pointer-events-none flex items-center justify-center pb-16">
        <div class="pointer-events-auto">
          <DevPanel
            :title="getPanelTitle(currentDesktopPanel)"
            size="consistent"
            height="consistent"
            class="shadow-2xl"
            @close="$emit('closeCurrentPanel')">
            <component :is="getPanelComponent(currentDesktopPanel)" />
          </DevPanel>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CodeIcon } from 'lucide-vue-next'
import HorizontalDockToolbar from './DockToolbar.vue'
import DevPanel from './DevPanel.vue'

interface Tool {
  key: string;
  icon: string;
  label: string;
  component: any;
  title: string;
}

interface Props {
  tools: Tool[];
  activePanels: Record<string, boolean>;
  activePanelKeys: string[];
  currentDesktopPanel: string | null;
  isExpanded: boolean;
  isDockOpen: boolean;
}

const props = defineProps<Props>()

defineEmits<{
  toggleDock: [];
  togglePanel: [panel: string];
  setCurrentPanel: [panel: string];
  navigatePanel: [direction: number];
  closeAll: [];
  closeCurrentPanel: [];
}>()

const activePanelCount = computed(() => {
  return Object.values(props.activePanels).filter(Boolean).length
})

const getPanelComponent = (panelKey: string) => {
  const tool = props.tools.find(t => t.key === panelKey)
  return tool?.component
}

const getPanelTitle = (panelKey: string) => {
  const tool = props.tools.find(t => t.key === panelKey)
  return tool?.title || ''
}
</script>
