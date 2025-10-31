<template>
  <header
    class="flex justify-center items-center bg-background border-b border-border px-4 min-h-14"
  >
    <div class="container mx-auto flex justify-between items-center gap-2">
      <div class="flex items-center justify-between gap-3">
        <BaseButton
          v-tippy="{ content: isSidebarOpen ? 'Close Sidebar': 'Open Sidebar', placement: 'right' }"
          variant="ghost"
          size="icon"
          @click="$emit('toggle-sidebar')"
        >
          <component
            :is="isSidebarOpen ? CircleMinus : CircleEqual"
            class="h-5 w-5"
          />
        </BaseButton>
        <offline-indicator />
      </div>

      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full md:min-w-64 rounded-md sm:w-auto flex justify-end items-center space-x-4">
          <Suspense>
            <HeaderDock />
          </Suspense>

          <div class="flex items-center justify-between gap-2">
            <BaseButton
              v-tippy="{content: 'Keyboard Shortcuts'}"
              class="hidden md:flex"
              variant="ghost"
              size="icon"
              @click="$emit('open-shortcut-modal')"
            >
              <Command class="h-5 w-5" />
              <span class="sr-only">Keyboard Shortcuts</span>
            </BaseButton>

            <BaseButton
              v-tippy="{ content: isMenubarOpen ? 'Close Menu': 'Open Menu', placement: 'left' }"
              variant="ghost"
              size="icon"
              @click="$emit('toggle-menubar')"
            >
              <component 
                :is="isMenubarOpen ? CircleMinus : CircleEqual" 
                class="h-5 w-5" 
              />
            </BaseButton>
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
import { BaseButton } from "@components/ui"
import { OfflineIndicator } from '@components/layout'
import { defineAsyncComponent } from "vue"

interface Props {
  isSidebarOpen: boolean;
  isMenubarOpen: boolean;
}

interface Emits {
  (e: 'toggle-sidebar'): void;
  (e: 'toggle-menubar'): void;
  (e: 'open-shortcut-modal'): void;
}

defineProps<Props>();
defineEmits<Emits>();
const HeaderDock = defineAsyncComponent(() => import('./HeaderDock.vue'))
</script>
