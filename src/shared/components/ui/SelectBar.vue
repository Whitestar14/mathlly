<template>
  <div class="relative w-full">
    <SelectRoot
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)"
    >
      <SelectTrigger
        class="inline-flex items-center justify-between w-full font-medium px-2.5 py-1.5 text-sm bg-background text-foreground border border-border rounded-md hover:bg-muted/40 focus-colors transition-colors duration-200"
        :class="isDropdown ? 'rounded-e-none border-r-0' : ''"
      >
        <SelectValue :placeholder="placeholder" />
        <ChevronDownIcon class="h-4 w-4 flex-shrink-0" />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          class="select-content z-20 overflow-hidden bg-background text-foreground rounded-lg border border-border shadow-md"
          :position="position"
          :side-offset="5"
          :align="align"
        >
          <SelectViewport class="p-1">
            <SelectGroup>
              <SelectLabel
                v-if="label"
                class="px-1.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {{ label }}
              </SelectLabel>
              
              <SelectItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="outline-none flex w-full items-center px-2.5 py-1.5 text-sm text-foreground hover:bg-muted/40 select-none rounded transition-colors duration-200 cursor-pointer"
              >
                <SelectItemText>{{ option.label }}</SelectItemText>
              </SelectItem>
            </SelectGroup>
          </SelectViewport>
        </SelectContent>
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
} from "radix-vue";
import { ChevronDownIcon } from "lucide-vue-next";

defineProps({
  modelValue: {
    type: [Number, String],
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  label: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "item-aligned",
  },
  align: {
    type: String,
    default: "center",
  },
  isDropdown: {
    type: Boolean,
    default: false,
  }
});

defineEmits(["update:model-value"]);
</script>

<style>
/* Ensure the dropdown matches the trigger width */
[data-radix-popper-content-wrapper] {
  width: var(--radix-popper-anchor-width);
  z-index: 20 !important;
}

/* Animation for the select dropdown */
.select-content {
  transform-origin: var(--radix-popper-transform-origin);
  animation: selectContentShow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
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
