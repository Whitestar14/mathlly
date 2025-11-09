<template>
  <PopoverRoot
    :open="isControlled ? modelValue : internalOpen"
    :modal="modal"
    @update:open="handleUpdate">

    <PopoverTrigger as-child>
      <slot name="trigger"></slot>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="z-30 min-w-[180px] bg-popover rounded-lg overflow-hidden border border-border p-1 shadow-md popover-content"
        :side-offset="sideOffset"
        :align="align"
        :side="side"
        :avoid-collisions="true"
        :trap-focus="trapFocus"
        :disable-outside-pointer-events="disableOutsidePointerEvents"
        :prevent-scroll="preventScroll">
        <slot></slot>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal
} from 'radix-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined }, // undefined => uncontrolled
  sideOffset: { type: Number, default: 6 },
  align: {
    type: String as () => 'start' | 'center' | 'end',
    default: 'end'
  },
  side: {
    type: String as () => 'top' | 'right' | 'bottom' | 'left',
    default: 'bottom'
  },
  animationDuration: { type: Number, default: 200 },

  modal: { type: Boolean, default: false },
  trapFocus: { type: Boolean, default: true },
  disableOutsidePointerEvents: { type: Boolean, default: true },
  preventScroll: { type: Boolean, default: true }
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const isControlled = computed(() => typeof props.modelValue === 'boolean')

const internalOpen = ref<boolean>(false)

watch(
  () => props.modelValue,
  v => {
    if (isControlled.value && typeof v === 'boolean') {
      internalOpen.value = v
    }
  },
  { immediate: true }
)

const handleUpdate = (next: boolean) => {
  internalOpen.value = next
  if (isControlled.value) emit('update:modelValue', next)
}
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
