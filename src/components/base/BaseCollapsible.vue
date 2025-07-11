<template>
  <CollapsibleRoot
    v-model:open="isOpen"
    class="w-full bg-background dark:bg-background border border-border dark:border-border rounded-lg overflow-hidden shadow-sm mb-4"
    :class="customClass"
  >
    <CollapsibleTrigger
      class="group flex flex-1 data-[state='open']:border-b border-border dark:border-border items-center justify-between p-4 text-left font-medium text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors w-full"
      :class="headerClass"
    >
      <div class="flex items-center space-x-3">
        <component 
          :is="getFeatureIcon(icon)" 
          v-if="icon" 
          class="h-5 w-5 text-primary dark:text-primary" 
          :class="iconClass"
          aria-hidden="true"
        />
        <span class="text-base font-medium text-foreground dark:text-foreground">{{ title }}</span>
      </div>
      <ChevronDownIcon 
        class="h-5 w-5 text-muted-foreground dark:text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] indicator-icon"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
      
    <CollapsibleContent 
      class="overflow-hidden text-sm radix-collapsible-content"
    >
      <div
        class="p-4 pt-2 text-foreground dark:text-muted-foreground"
        :class="contentClass"
      >
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
  
  <script setup>
  import { ref } from 'vue';
  import { 
    CollapsibleRoot, 
    CollapsibleTrigger, 
    CollapsibleContent 
  } from 'radix-vue';
  import { MonitorIcon, CalculatorIcon, PowerIcon, PaletteIcon, ChevronDownIcon } from 'lucide-vue-next';
  
  const props = defineProps({
    // id: {
    //   type: String,
    //   required: true
    // },
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
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
      },  });
  
  const isOpen = ref(props.defaultOpen);

  const getFeatureIcon = (iconName) => {
  const iconMap = {
    'Calculator': CalculatorIcon,
    'Palette': PaletteIcon,
    'Monitor': MonitorIcon,
    'Power': PowerIcon
  };
  
  return iconMap[iconName] || CalculatorIcon;
};
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
  