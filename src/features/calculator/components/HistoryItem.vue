<template>
  <div class="group relative">
    <ContextMenu
      :side-offset="5"
      align="start"
    >
      <template #trigger>
        <div
          class="rounded-lg hover:bg-secondary/80 bg-secondary p-3 transition-colors cursor-pointer"
          :class="{ 'animate-highlight': selectedItemId === item.id }"
          @click="$emit('select', item)"
        >
          <div class="text-sm text-secondary-foreground/75 break-all">
            {{ item.expression }}
          </div>
          <div class="flex items-center justify-between gap-2">
            <div
              class="text-lg font-medium text-secondary-foreground/80 break-all"
            >
              {{ item.result }}
            </div>
            <kbd
              class="text-xs rounded-sm text-accent/75 bg-accent/10"
              v-if="item.mode === 'Programmer' && item.base"
            >{{ item.base }}</kbd>
          </div>

          <BaseButton
            v-tippy="{ content: 'Delete item' }"
            variant="ghost"
            size="icon"
            class="absolute right-2 top-1/2 transform -translate-y-1/2"
            :class="isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
            @click.stop="$emit('delete', item.id)"
          >
            <TrashIcon class="h-4 w-4" />
          </BaseButton>
        </div>
      </template>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('select', item)"
      >
        <CheckIcon class="mr-2 h-4 w-4" />
        <span>Select Item</span>
      </ContextMenuItem>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('copy', copyText)"
      >
        <CopyIcon class="mr-2 h-4 w-4" />
        <span>Copy Item</span>
      </ContextMenuItem>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('copy-json', item)"
      >
        <CodeIcon class="mr-2 h-4 w-4" />
        <span>Copy as JSON</span>
      </ContextMenuItem>

      <ContextMenuSeparator class="h-px w-full bg-border my-1" />

      <ContextMenuItem
        class="context-menu-item-danger"
        @click="$emit('delete', item.id)"
      >
        <TrashIcon class="mr-2 h-4 w-4" />
        <span>Delete Item</span>
      </ContextMenuItem>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrashIcon, CheckIcon, CopyIcon, CodeIcon } from "lucide-vue-next";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "radix-vue";
import { BaseButton, ContextMenu } from "@components/ui"

interface HistoryItem {
  id?: number;
  expression: string;
  result: string;
  timestamp?: number;
  mode?: string;
  base?: string;
  baseValues?: Record<string, string>;
}

interface Props {
  item: HistoryItem;
  isMobile?: boolean;
  selectedItemId?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false,
  selectedItemId: null,
});
defineEmits(['select', 'delete', 'copy', 'copy-json']);

const copyText = computed(() => {
  if (props.item.mode === 'Programmer' && props.item.base) {
    return `${props.item.expression} = ${props.item.result} (${props.item.base})`
  }
  return `${props.item.expression} = ${props.item.result}`
})
</script>

<style>
.animate-highlight {
  animation: highlight 0.3s ease-out;
}

@keyframes highlight {
  0% {
    @apply bg-muted/30;
  }
  100% {
    @apply bg-muted;
  }
}
</style>