<template>
  <PopoverRoot v-model:open="open">
    <!-- Trigger -->
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>

    <!-- Portal + Content -->
    <PopoverPortal>
      <PopoverContent
        class="z-30 min-w-[180px] bg-background rounded-lg overflow-hidden border border-border p-1 shadow-md popover-content"
        :side-offset="sideOffset"
        :align="align"
        :side="side"
        :avoid-collisions="true"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from 'radix-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sideOffset: { type: Number, default: 6 },
  align: { type: String as () => 'start' | 'center' | 'end', default: 'start' },
  side: { type: String as () => 'top' | 'right' | 'bottom' | 'left', default: 'bottom' },
  animationDuration: { type: Number, default: 200 },
})

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})
</script>

<style>
.popover-content {
  transform-origin: var(--radix-popover-content-transform-origin);
  animation: popover-content-enter var(--popover-animation-duration, 150ms)
    cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.popover-content[data-state='closed'] {
  animation: popover-content-exit var(--popover-animation-duration, 120ms)
    cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes popover-content-enter {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes popover-content-exit {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.95); }
}
/* Bind animation duration to prop */
.popover-content {
  --popover-animation-duration: v-bind('animationDuration + "ms"');
}
</style>
