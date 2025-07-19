<template>
  <header
    class="flex justify-center items-center bg-card border-b border-border dark:border-border px-4 min-h-14"
  >
    <div class="container mx-auto flex justify-between items-center gap-2">
      <div class="flex items-center justify-between gap-3">
        <Button
          v-tippy="{ content: isSidebarOpen ? 'Close Sidebar': 'Open Sidebar', placement: 'right' }"
          variant="ghost"
          size="icon"
          @click="$emit('toggle-sidebar')"
        >
          <component
            :is="isSidebarOpen ? CircleMinus : CircleEqual"
            class="h-5 w-5"
          />
        </Button>
        <offline-indicator />
      </div>

      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-end items-center space-x-4">
          <!-- Teleport target for calculator mode switcher -->
          <div
            id="calculator-mode-switcher-slot"
            class="w-full"
          />

          <div class="flex items-center justify-between gap-2">
            <Button
              v-tippy="{content: 'Keyboard Shortcuts'}"
              class="hidden md:flex"
              variant="ghost"
              size="icon"
              @click="$emit('open-shortcut-modal')"
            >
              <Command class="h-5 w-5" />
              <span class="sr-only">Keyboard Shortcuts</span>
            </Button>

            <Button
              v-tippy="{ content: isMenubarOpen ? 'Close Menu': 'Open Menu', placement: 'left' }"
              variant="ghost"
              size="icon"
              @click="$emit('toggle-menubar')"
            >
              <component 
                :is="isMenubarOpen ? CircleMinus : CircleEqual" 
                class="h-5 w-5" 
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Command,
  CircleEqual,
  CircleMinus, 
} from "lucide-vue-next";
import Button from "@/components/base/BaseButton.vue";
import OfflineIndicator from '@/components/ui/OfflineIndicator.vue';

// Define props interface - much cleaner now!
interface Props {
  isSidebarOpen: boolean;
  isMenubarOpen: boolean;
}

// Define emits interface - no more mode-specific events
interface Emits {
  (e: 'toggle-sidebar'): void;
  (e: 'toggle-menubar'): void;
  (e: 'open-shortcut-modal'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>
