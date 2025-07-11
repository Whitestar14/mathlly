<template>
  <ContextMenuRoot>
    <ContextMenuTrigger as-child>
      <slot name="trigger" />
    </ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent
        class="z-20 min-w-[180px] bg-background dark:bg-background rounded-lg overflow-hidden border border-border dark:border-border p-1 shadow-md context-menu-content"
        :side-offset="sideOffset"
        :align="align"
        :animation-duration="animationDuration"
      >
        <slot />
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
  
<script setup>
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuPortal,
} from "radix-vue";

defineProps({
  sideOffset: {
    type: Number,
    default: 5
  },
  align: {
    type: String,
    default: 'start'
  },
  animationDuration: {
    type: Number,
    default: 300
  }
});
</script>
  
<style>
.context-menu-item,
.context-menu-item-danger {
  @apply flex items-center text-sm w-full px-2.5 rounded-md py-1.5 cursor-pointer outline-none;
}
.context-menu-item {
  @apply hover:bg-muted dark:hover:bg-accent/30 text-foreground dark:text-muted-foreground;
}

.context-menu-item-danger {
  @apply hover:bg-red-100 dark:hover:bg-red-700/30 text-destructive dark:text-destructive;
}

/* Animation styles for the context menu */
.context-menu-content {
  transform-origin: var(--radix-context-menu-content-transform-origin);
  animation: context-menu-content-enter var(--context-menu-animation-duration, 150ms) cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.context-menu-content[data-state="closed"] {
  animation: context-menu-content-exit var(--context-menu-animation-duration, 150ms) cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes context-menu-content-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes context-menu-content-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Set animation duration based on prop */
.context-menu-content {
  --context-menu-animation-duration: v-bind('animationDuration + "ms"');
}
</style>
