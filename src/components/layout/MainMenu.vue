<template>
  <BasePanel
    id="menu"
    type="side"
    title="Menu"
    position="right"
    :max-height-ratio="0.85"
  >
    <!-- Content -->
    <div class="flex-1 overflow-hidden flex flex-col h-full">
      <!-- Show tool options or main menu -->
      <div v-if="showToolOptions" class="flex-1 overflow-auto p-3">
        <!-- Options loading state -->
        <div v-if="isLoadingOptions" class="space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b border-border">
            <div class="w-8 h-8 bg-muted animate-pulse rounded-md"></div>
            <div class="h-4 w-16 bg-muted animate-pulse rounded"></div>
          </div>
          <div class="space-y-3">
            <div class="h-3 w-20 bg-muted animate-pulse rounded"></div>
            <div class="space-y-2">
              <div class="h-4 w-32 bg-muted animate-pulse rounded"></div>
              <div class="h-2 w-full bg-muted animate-pulse rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 w-28 bg-muted animate-pulse rounded"></div>
              <div class="h-2 w-full bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
        
        <!-- Actual options -->
        <ToolOptions
          v-else-if="currentToolOptions"
          :tool-options="currentToolOptions"
          @close="showToolOptions = false"
        />
      </div>
      
      <!-- Main menu - NO ScrollArea, just direct flex layout -->
      <div v-else class="flex-1 flex flex-col overflow-hidden">
        <!-- Top section with options button -->
        <div v-if="hasToolOptions || isCheckingOptions" class="flex-shrink-0 p-3 pb-0">
          <BaseButton
            variant="ghost"
            class="w-full justify-start px-3 py-2 h-auto text-muted-foreground rounded-lg border border-border/50 hover:border-border hover:bg-accent/30"
            :disabled="isCheckingOptions"
            @click="handleShowOptions"
          >
            <div v-if="isCheckingOptions" class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
            <Settings v-else class="h-4 w-4" />
            <span class="text-sm font-medium">Tool Options</span>
          </BaseButton>
        </div>

        <!-- Spacer that grows to push links to bottom -->
        <div class="flex-1"></div>

        <!-- External Links at bottom - ALWAYS at bottom -->
        <div class="flex-shrink-0 p-3">
          <div class="space-y-3">
            <h3 class="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
              Quick Links
            </h3>
            
            <!-- Links in a 2-column grid for better use of space -->
            <div class="grid grid-cols-1 gap-2">
              <a
                v-for="link in externalLinks"
                :key="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex-shrink-0 p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200">
                  <component
                    :is="link.icon"
                    class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 block truncate">
                    {{ link.text }}
                  </span>
                  <span class="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                    {{ link.description }}
                  </span>
                </div>
                <ExternalLink class="h-3 w-3 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-200 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="space-y-2">
        <h3 class="text-xs font-semibold text-muted-foreground px-3 uppercase tracking-wider">
          Theme
        </h3>
        <ToggleGroupRoot
          v-model="selectedTheme"
          type="single"
          class="inline-flex items-center gap-1 p-1 mx-3 bg-muted/50 rounded-lg border border-border/50"
        >
          <ToggleGroupItem
            v-for="item of themeItems"
            :key="item.id"
            :value="item.id"
            class="text-muted-foreground flex justify-center items-center w-8 h-8 rounded-md transition-all duration-200 outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 ring-ring data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:border-border hover:bg-accent/50 hover:text-accent-foreground"
            :title="item.title"
          >
            <component
              :is="item.icon"
              class="h-4 w-4"
            />
            <span class="sr-only">{{ item.title }}</span>
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </div>
    </template>
  </BasePanel>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import {
  Sun,
  Moon,
  AppWindowMac,
  AtSign,
  GithubIcon,
  Settings,
  ExternalLink,
  type LucideIcon,
} from "lucide-vue-next";
import { useTheme, type ThemeOption } from "@/composables/useTheme";
import { useToolSettingsStore } from "@/stores/toolSettings"; // Updated import
import BasePanel from "@/components/base/BasePanel.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import ToolOptions from "@/components/ui/ToolOptions.vue";
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
  ToggleGroupRoot,
  ToggleGroupItem
} from "radix-vue";

// Types
interface ThemeItem {
  id: ThemeOption;
  title: string;
  icon: LucideIcon;
}

interface ExternalLink {
  url: string;
  text: string;
  description: string;
  icon: LucideIcon;
}

// Composables
const { selectedTheme } = useTheme();
const toolStore = useToolSettingsStore();

// Local state
const showToolOptions = ref(false);
const isCheckingOptions = ref(false);
const isLoadingOptions = ref(false);

// Updated to use new store properties
const hasToolOptions = computed(() => toolStore.hasCurrentToolOptions);
const currentToolOptions = computed(() => toolStore.currentToolConfig);
const currentTool = computed(() => toolStore.currentToolId);

// Theme items configuration
const themeItems: ThemeItem[] = [
  { id: "light", title: "Light", icon: Sun },
  { id: "dark", title: "Dark", icon: Moon },
  { id: "system", title: "System", icon: AppWindowMac }
];

// External links configuration
const externalLinks: ExternalLink[] = [
  {
    url: "https://github.com/Whitestar14/mathlly",
    text: "Star on GitHub",
    icon: GithubIcon
  },
  {
    url: "https://x.com/@xijibomi",
    text: "Follow my Twitter",
    icon: AtSign
  }
];

// Handle showing options with loading state
const handleShowOptions = async () => {
  if (!currentToolOptions.value) return;
  
  isLoadingOptions.value = true;
  showToolOptions.value = true;
  
  // Small delay to show the loading state
  await nextTick();
  setTimeout(() => {
    isLoadingOptions.value = false;
  }, 150);
}

// Close tool options panel when route changes
watch(() => currentTool.value, (newTool, oldTool) => {
  showToolOptions.value = false;
  isLoadingOptions.value = false;
  
  // Show checking state when route changes
  if (newTool !== oldTool && newTool) {
    isCheckingOptions.value = true;
    
    // Force reactivity update on route change
    nextTick(() => {
      // Give some time for tool options to register
      setTimeout(() => {
        isCheckingOptions.value = false;
      }, 300);
    });
  } else {
    isCheckingOptions.value = false;
  }
});

// Watch for tool options availability changes
watch(() => hasToolOptions.value, (hasOptions) => {
  // If we lost tool options while showing them, close the panel
  if (!hasOptions && showToolOptions.value) {
    showToolOptions.value = false;
    isLoadingOptions.value = false;
  }
  
  // Stop checking when options become available
  if (hasOptions) {
    isCheckingOptions.value = false;
  }
});
</script>