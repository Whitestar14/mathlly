<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child>
      <button
        :class="getTriggerClasses"
        :disabled="disabled"
      >
        <component 
          :is="icon" 
          v-if="icon" 
          class="h-4 w-4 flex-shrink-0"
        />
        <span
          v-if="label"
          class="truncate font-medium"
        >{{ label }}</span>
        <slot name="trigger" />
        <ChevronDownIcon 
          class="h-4 w-4 flex-shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': open }"
        />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        :class="[
          'dropdown-content z-50 overflow-hidden p-2',
          'bg-background/90 backdrop-blur-sm',
          'border border-border/50 shadow-2xl rounded-xl',
          'text-foreground',
          contentClass
        ]"
        :side="side"
        :side-offset="sideOffset"
        :align="align"
        :align-offset="alignOffset"
        @open-auto-focus="handleOpenAutoFocus"
        @close-auto-focus="handleCloseAutoFocus"
      >
        <!-- Header section -->
        <div
          v-if="$slots.header"
          class="px-2 py-2 border-b border-border/50 mb-2"
        >
          <slot name="header" />
        </div>

        <!-- Content section -->
        <slot 
          :close="closeDropdown"
          :items="items"
        />

        <!-- Footer section -->
        <div
          v-if="$slots.footer"
          class="px-2 py-2"
        >
          <slot name="footer" />
        </div>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
} from 'radix-vue';
import { ChevronDownIcon } from 'lucide-vue-next';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  items: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  side: {
    type: String,
    default: 'bottom',
    validator: (val) => ['top', 'right', 'bottom', 'left'].includes(val)
  },
  sideOffset: {
    type: Number,
    default: 8
  },
  align: {
    type: String,
    default: 'center',
    validator: (val) => ['start', 'center', 'end'].includes(val)
  },
  alignOffset: {
    type: Number,
    default: 0
  },
  triggerClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  useDefaultStyling: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['open', 'close', 'item-select']);

const open = ref(false);

const getTriggerClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
    { 'w-full': props.fullWidth }
  ];

  if (!props.useDefaultStyling && props.triggerClass) {
    return [...baseClasses, props.triggerClass];
  }
  
  const defaultClasses = [
    'bg-background/90 hover:bg-background text-foreground border border-border/50 shadow-sm hover:shadow-md',
    'rounded-lg px-3 py-2 text-sm',
    'hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100',
    'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ];

  return [...baseClasses, ...defaultClasses, props.triggerClass];
});

const closeDropdown = () => {
  open.value = false;
};

const handleOpenAutoFocus = (event) => {
  open.value = true;
  emit('open', event);
};

const handleCloseAutoFocus = (event) => {
  open.value = false;
  emit('close', event);
};

defineExpose({
  close: closeDropdown
});
</script>

<style scoped>
.dropdown-content {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  animation: dropdownContentShow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@keyframes dropdownContentShow {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-content[data-state="closed"] {
  animation: dropdownContentHide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownContentHide {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}

[data-radix-popper-content-wrapper] {
  min-width: var(--radix-dropdown-menu-trigger-width);
  z-index: 50 !important;
}

.dropdown-content::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  pointer-events: none;
}

.dark .dropdown-content::before {
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
}
</style>
