<template>
  <div class="fixed bottom-0 left-0 right-0 z-50">
    <!-- Mobile Dock Trigger -->
    <div
      v-if="!isExpanded"
      class="flex justify-center"
    >
      <button
        class="bg-background/95 backdrop-blur-xl rounded-t-2xl border border-border/50 border-b-0 shadow-2xl px-4 py-2 flex items-center gap-2 hover:bg-background/95 transition-colors"
        @click="$emit('toggleExpanded')"
      >
        <div class="flex items-center gap-1">
          <div
            v-for="panel in activePanelKeys"
            :key="panel"
            class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
          />
        </div>
        <span class="text-foreground text-xs font-medium">
          Dev Tools {{ activePanelCount > 0 ? `(${activePanelCount})` : '' }}
        </span>
        <ChevronUpIcon class="h-4 w-4 text-foreground" />
      </button>
    </div>
    
    <!-- Mobile Expanded Panel -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-y-full"
      enter-to-class="transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="transform translate-y-0"
      leave-to-class="transform translate-y-full"
    >
      <div
        v-if="isExpanded"
        class="bg-background dark:bg-background border-t border-border dark:border-border shadow-2xl h-[85vh] flex flex-col"
      >
        <!-- Mobile Header -->
        <div class="flex items-center justify-between p-3 border-b border-border dark:border-border bg-muted dark:bg-background">
          <h2 class="text-base font-semibold text-foreground dark:text-foreground">
            Developer Tools
          </h2>
          <button
            class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground hover:bg-muted dark:hover:bg-accent transition-colors"
            @click="$emit('toggleExpanded')"
          >
            <ChevronDownIcon class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Mobile Tool Selector -->
        <div class="p-3 border-b border-border dark:border-border bg-muted/50 dark:bg-background/50">
          <div class="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            <MobileDockItem
              v-for="tool in tools"
              :key="tool.key"
              :icon="tool.icon"
              :label="tool.label"
              :active="activePanels[tool.key]"
              @click="$emit('togglePanel', tool.key)"
            />
          </div>
        </div>
        
        <!-- Mobile Panel Content -->
        <div class="flex-1 overflow-hidden bg-background dark:bg-background">
          <div
            v-if="activePanelKeys.length === 0"
            class="flex items-center justify-center h-full text-muted-foreground dark:text-muted-foreground"
          >
            <div class="text-center px-4">
              <DatabaseIcon class="h-10 w-10 mx-auto mb-2 text-muted-foreground dark:text-muted-foreground" />
              <p class="text-sm font-medium">
                Select a tool to get started
              </p>
              <p class="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                Choose from the options above
              </p>
            </div>
          </div>
          
          <!-- Active Panels (Mobile shows one at a time) -->
          <div
            v-for="(panelKey, index) in activePanelKeys"
            v-show="index === activeMobilePanelIndex"
            :key="panelKey"
            class="h-full overflow-y-auto"
          >
            <div class="p-3">
              <component :is="getPanelComponent(panelKey)" />
            </div>
          </div>
          
          <!-- Mobile Panel Navigation -->
          <div
            v-if="activePanelKeys.length > 1"
            class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/95 dark:bg-background/95 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg border border-border/50"
          >
            <!-- Previous Button -->
            <button
              :disabled="activeMobilePanelIndex === 0"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              :class="activeMobilePanelIndex === 0 
                ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                : 'bg-muted/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground hover:scale-105'"
              @click="activeMobilePanelIndex > 0 && $emit('setActiveMobilePanelIndex', activeMobilePanelIndex - 1)"
            >
              <ChevronLeftIcon class="h-3.5 w-3.5" />
            </button>
            
            <!-- Panel Indicators -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="(panelKey, index) in activePanelKeys"
                :key="panelKey"
                class="w-1.5 h-1.5 rounded-full transition-all duration-200"
                :class="index === activeMobilePanelIndex 
                  ? 'bg-indigo-400 scale-125' 
                  : 'bg-muted/60 hover:bg-accent0'"
                @click="$emit('setActiveMobilePanelIndex', index)"
              />
            </div>
            
            <!-- Panel Counter -->
            <span class="text-[10px] font-medium text-muted-foreground px-1.5">
              {{ activeMobilePanelIndex + 1 }}/{{ activePanelKeys.length }}
            </span>
            
            <!-- Next Button -->
            <button
              :disabled="activeMobilePanelIndex === activePanelKeys.length - 1"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              :class="activeMobilePanelIndex === activePanelKeys.length - 1
                ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                : 'bg-muted/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground hover:scale-105'"
              @click="activeMobilePanelIndex < activePanelKeys.length - 1 && $emit('setActiveMobilePanelIndex', activeMobilePanelIndex + 1)"
            >
              <ChevronRightIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, DatabaseIcon } from 'lucide-vue-next';
import MobileDockItem from './MobileDockItem.vue';

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
  activeMobilePanelIndex: number;
  isExpanded: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  toggleExpanded: [];
  togglePanel: [panel: string];
  setActiveMobilePanelIndex: [index: number];
}>();

const activePanelCount = computed(() => {
  return Object.values(props.activePanels).filter(Boolean).length;
});

const getPanelComponent = (panelKey: string) => {
  const tool = props.tools.find(t => t.key === panelKey);
  return tool?.component;
};
</script>
