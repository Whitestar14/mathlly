<template>
  <div class="relative w-full">
    <SelectRoot
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)">
      <SelectTrigger
        class="inline-flex text-nowrap items-center justify-between w-full font-medium px-2.5 py-1.5 text-sm bg-background text-foreground border border-border rounded-md hover:bg-muted/40 focus-colors transition-colors duration-200"
        :class="isDropdown ? 'rounded-e-none border-r-0' : ''">
        <SelectValue :placeholder="placeholder" />
        <ChevronDownIcon class="h-4 w-4 flex-shrink-0" />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          class="select-content overflow-hidden bg-background text-foreground rounded-lg border border-border shadow-md"
          :position="position"
          :side-offset="5"
          :align="align">
          <Transition name="fade-slide">
            <SelectScrollUpButton
              v-if="true"
              class="flex items-center justify-center bg-background border border-border/50 rounded-md m-1 hover:bg-muted/40 cursor-pointer p-1">
              <ChevronUpIcon class="size-3" />
            </SelectScrollUpButton>
          </Transition>

          <SelectViewport class="p-1">
            <SelectGroup>
              <SelectLabel
                v-if="label"
                class="px-1.5 py-1 text-nowrap text-xs font-medium text-muted-foreground">
                {{ label }}
              </SelectLabel>

              <SelectItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="outline-none flex w-full items-center px-2.5 py-1.5 text-sm text-foreground hover:bg-muted/40 select-none rounded transition-colors duration-200 cursor-pointer">
                <SelectItemText>{{ option.label }}</SelectItemText>
              </SelectItem>
            </SelectGroup>
          </SelectViewport>

          <Transition name="fade-slide">
            <SelectScrollDownButton
              class="flex items-center justify-center bg-background border border-border/50 rounded-md m-1 hover:bg-muted/40 cursor-pointer p-1">
              <ChevronDownIcon class="size-3" />
            </SelectScrollDownButton>
          </transition></SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup>
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectScrollUpButton,
  SelectScrollDownButton
} from 'radix-vue'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-vue-next'

defineProps({
  modelValue: {
    type: [Number, String],
    required: true
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  label: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'item-aligned'
  },
  align: {
    type: String,
    default: 'center'
  },
  isDropdown: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:model-value'])
</script>

<style>
/* Ensure the dropdown matches the trigger width */
[data-radix-popper-content-wrapper] {
  width: var(--radix-popper-anchor-width);
}

/* Animation for the select dropdown */
.select-content {
  transform-origin: var(--radix-popper-transform-origin);
  animation: selectContentShow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
  z-index: 50;
}

@keyframes selectContentShow {
  from {
    opacity: 0;
    transform: translateY(-2px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animation for when the select dropdown is closing */
.select-content[data-state="closed"] {
  animation: selectContentHide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes selectContentHide {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-2px) scale(0.98);
  }
}
</style>
