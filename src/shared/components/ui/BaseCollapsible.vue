<template>
  <CollapsibleRoot
    v-model:open="isOpen"
    class="w-full bg-card border border-border rounded-lg overflow-hidden shadow-sm mb-4"
    :class="customClass">
    <CollapsibleTrigger
      class="group flex w-full data-[state='open']:border-b border-border items-center justify-between px-4 py-3 text-left font-medium text-foreground hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
      :class="headerClass">
      <div class="flex items-center space-x-3">
        <component
          :is="icon"
          v-if="icon"
          class="h-5 w-5 text-primary"
          :class="iconClass"
          aria-hidden="true" />
        <span class="text-base font-medium">{{ title }}</span>
      </div>
      <ChevronDownIcon
        class="h-5 w-5 text-muted-foreground transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true" />
    </CollapsibleTrigger>

    <CollapsibleContent class="overflow-hidden radix-collapsible-content">
      <div
        class="p-4 pt-2 text-foreground"
        :class="contentClass">
        <slot></slot>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<script setup>
import { ref } from 'vue'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent
} from 'radix-vue'
import { ChevronDownIcon } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function, String],
    default: null
  },
  defaultOpen: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  },
  headerClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  iconClass: {
    type: String,
    default: ''
  }
})

const isOpen = ref(props.defaultOpen)
</script>

<style>
.radix-collapsible-content[data-state='open'] {
  animation: slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

.radix-collapsible-content[data-state='closed'] {
  animation: slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

@keyframes slide-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}
</style>