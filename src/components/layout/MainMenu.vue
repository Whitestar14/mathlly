<template>
  <BasePanel
    id="menu"
    type="side"
    title="Menu"
    position="right"
    :max-height-ratio="0.85"
  >
    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <ScrollAreaRoot class="h-full w-full">
        <ScrollAreaViewport class="h-full w-full">
          <div class="p-3 space-y-1">
            <!-- Links -->
            <a
              v-for="link in externalLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center px-3 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            >
              <component
                :is="link.icon"
                class="h-4 w-4 mr-2 text-muted-foreground"
              />
              <span>{{ link.text }}</span>
            </a>
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" />
      </ScrollAreaRoot>
    </div>

    <template #footer>
      <div class="space-y-1.5">
        <h3 class="text-xs font-medium text-muted-foreground px-3">
          Appearance
        </h3>
        <ToggleGroupRoot
          v-model="selectedTheme"
          type="single"
          class="inline-flex *:items-center gap-1 p-1 mx-3 bg-muted rounded-lg border border-border"
        >
          <ToggleGroupItem
            v-for="item of themeItems"
            :key="item.id"
            :value="item.id"
            class="text-muted-foreground flex justify-center w-8 h-8 rounded-md transition-colors duration-150 outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 ring-ring data-[state=on]:bg-accent data-[state=on]:shadow-sm data-[state=on]:text-primary hover:bg-accent/50"
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
import {
  Sun,
  Moon,
  AppWindowMac,
  AtSign,
  GithubIcon,
  type LucideIcon,
} from "lucide-vue-next";
import { useTheme, type ThemeOption } from "@/composables/useTheme";
import BasePanel from "@/components/base/BasePanel.vue";
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
  icon: LucideIcon;
}

// Theme management - now properly destructured
const { selectedTheme } = useTheme();

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
</script>
