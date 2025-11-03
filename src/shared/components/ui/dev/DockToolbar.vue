<template>
  <div class="flex items-center">

    <div class="flex items-center gap-2 px-4 py-4">
      <HorizontalDockItem
        v-for="tool in tools"
        :key="tool.key"
        :icon="tool.icon"
        :label="tool.label"
        :active="activePanels[tool.key]"
        @click="emit('togglePanel', tool.key)" />
    </div>

    <div
      v-if="activePanelKeys.length > 0"
      class="w-px h-8 bg-muted/50"></div>

    <div
      v-if="activePanelKeys.length > 1"
      class="flex items-center gap-2 px-3">
      <span class="text-xs text-muted-foreground font-medium">Active:</span>
      <div class="flex items-center gap-1">
        <button
          v-for="(panelKey, index) in activePanelKeys"
          :key="panelKey"
          v-tippy="{ content: getPanelTitle(panelKey) }"
          class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200"
          :class="panelKey === currentPanel
            ? 'bg-primary text-foreground shadow-lg scale-110'
            : 'bg-muted/60 text-muted-foreground hover:bg-accent0 hover:scale-105'"
          @click="emit('setCurrentPanel', panelKey)">
          {{ index + 1 }}
        </button>
      </div>
    </div>

    <div
      v-if="activePanelKeys.length > 1"
      class="flex items-center gap-1 px-2">
      <button
        v-if="currentPanelIndex > 0"
        v-tippy="{ content: 'Previous Panel (←)' }"
        class="w-6 h-6 rounded-md bg-muted/80 hover:bg-muted/60 flex items-center justify-center transition-colors"
        @click="emit('navigatePanel', -1)">
        <ChevronLeftIcon class="h-3 w-3 text-muted-foreground" />
      </button>

      <button
        v-if="currentPanelIndex < activePanelKeys.length - 1"
        v-tippy="{ content: 'Next Panel (→)' }"
        class="w-6 h-6 rounded-md bg-muted/80 hover:bg-muted/60 flex items-center justify-center transition-colors"
        @click="emit('navigatePanel', 1)">
        <ChevronRightIcon class="h-3 w-3 text-muted-foreground" />
      </button>
    </div>

    <div class="w-px h-8 bg-muted/50"></div>

    <div class="flex items-center px-3">
      <button
        v-tippy="{ content: 'Close All Panels' }"
        class="text-xs text-red-400 hover:text-red-300 transition-colors font-medium px-2 py-1 rounded-md hover:bg-destructive/10"
        @click="emit('closeAll')">
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import HorizontalDockItem from './DockItem.vue'

interface Tool {
  key: string;
  icon: string;
  label: string;
  title: string;
}

interface Props {
  tools: Tool[];
  activePanels: Record<string, boolean>;
  activePanelKeys: string[];
  currentPanel: string | null;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  togglePanel: [panel: string];
  setCurrentPanel: [panel: string];
  navigatePanel: [direction: number];
  closeAll: [];
}>()

const currentPanelIndex = computed(() => {
  if (!props.currentPanel) return -1
  return props.activePanelKeys.indexOf(props.currentPanel)
})

const getPanelTitle = (panelKey: string) => {
  const tool = props.tools.find(t => t.key === panelKey)
  return tool?.title || ''
}
</script>
