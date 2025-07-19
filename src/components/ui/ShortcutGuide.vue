<template>
  <BaseModal
    :open="show"
    @update:open="handleModalUpdate"
  >
    <template #title>
      <div class="flex items-center">
        <div>
          <h2 class="text-xl font-medium text-foreground">
            Keyboard Shortcuts
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            Quick access to available shortcuts
          </p>
        </div>
      </div>
    </template>

    <div class="mt-2">
      <div class="flex border-b border-border relative">
        <Indicator :position="indicatorStyle" />
        <button
          v-for="category in Object.keys(shortcutGroups)"
          :key="category"
          ref="tabElements"
          :data-path="category"
          class="px-4 py-3 text-sm font-medium transition-colors relative"
          :class="[
            currentPill === category
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="handleTabChange(category, $event.target as HTMLElement)"
        >
          {{ category }}
        </button>
      </div>

      <div class="relative overflow-hidden h-[250px] overflow-y-auto">
        <TransitionGroup
          enter-active-class="transition-transform duration-200 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-4"
        >
          <div
            v-for="(group, category) in shortcutGroups"
            v-show="currentPill === category"
            :key="category"
            class="p-4 space-y-2"
          >
            <div
              v-for="(shortcut, key) in group"
              :key="key"
              class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted"
            >
              <span class="text-sm text-foreground">
                {{ shortcut.description }}
              </span>

              <div class="flex items-center gap-1.5">
                <template v-if="key.includes('+')">
                  <div
                    v-for="(part, index) in key.split('+')"
                    :key="index"
                    class="inline-flex items-center"
                  >
                    <kbd
                      class="px-2 py-1 text-xs font-medium bg-background text-primary rounded border border-border shadow-sm"
                    >
                      {{ part }}
                    </kbd>
                    <span
                      v-if="index < key.split('+').length - 1"
                      class="text-muted-foreground"
                    >+</span>
                  </div>
                </template>
                <kbd
                  v-else
                  class="px-2 py-1 text-xs font-medium bg-background text-primary rounded border border-border shadow-sm"
                >
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { shallowRef, type ShallowRef } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { usePills } from "@/composables/usePills";
import Indicator from "@/components/ui/PillIndicator.vue";

interface Shortcut {
  description: string;
}

type ShortcutGroup = Record<string, Shortcut>;

interface ShortcutGroups {
  [category: string]: ShortcutGroup;
}

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const tabElements: ShallowRef<HTMLElement[]> = shallowRef([]);

const shortcutGroups: ShortcutGroups = {
  Global: {
    "ctrl+alt+f": { description: "Toggle Fullscreen" },
    "ctrl+l": { description: "Toggle Sidebar" },
    "ctrl+h": { description: "Toggle Activity" },
    "ctrl+,(comma)": { description: "Toggle Menubar" },
    "ctrl+space": { description: "Open the Keyboard Shortcuts" },
    "ctrl+shift+m": { description: "Toggle Theme" },
  },
  Calculator: {
    escape: { description: "Clear Input" },
    enter: { description: "Calculate Result" },
    backspace: { description: "Delete Last Character" },
  },
  Programmer: {
    "ctrl+1": { description: "Switch to Hexadecimal" },
    "ctrl+2": { description: "Switch to Decimal" },
    "ctrl+3": { description: "Switch to Octal" },
    "ctrl+4": { description: "Switch to Binary" },
  },
  Tools: {
    "ctrl+enter": { description: "Process Current Input" },
    "ctrl+v": { description: "Paste from Clipboard" },
    "ctrl+c": { description: "Copy Result" },
    "ctrl+s": { description: "Swap Input/Output" },
  },
};

function handleModalUpdate(isOpen: boolean): void {
  emit('update:show', isOpen);
  if (!isOpen) {
    emit('close');
  }
}

const {
  currentPill,
  indicatorStyle,
  handleNavigation
} = usePills({
  position: "bottom",
  updateRoute: false,
  defaultPill: "Global",
  containerRef: tabElements
});

function handleTabChange(category: string, tabElement: HTMLElement): void {
  handleNavigation(category, tabElement);
}
</script>
