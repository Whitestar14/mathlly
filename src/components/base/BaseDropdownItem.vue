<template>
  <button
    :class="[
      'group outline-none flex w-full items-center rounded-lg transition-all duration-150 ease-out',
      'px-3 py-2 text-sm font-medium',
      'hover:scale-[1.02] active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-ring/20',
      {
        // Default state
        'text-foreground dark:text-foreground hover:bg-muted/80 dark:hover:bg-accent/50': !active && !disabled,
        
        // Active state
        'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-primary shadow-sm': active && !disabled,
        
        // Disabled state
        'opacity-50 cursor-not-allowed hover:scale-100 hover:bg-transparent': disabled
      },
      itemClass
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <component 
      :is="icon" 
      v-if="icon" 
      :class="[
        'h-4 w-4 mr-3 flex-shrink-0 transition-colors duration-150',
        {
          'text-muted-foreground dark:text-muted-foreground group-hover:text-foreground dark:group-hover:text-muted-foreground': !active && !disabled,
          'text-primary dark:text-primary': active && !disabled
        }
      ]"
    />
    
    <div class="flex-1 min-w-0">
      <div
        v-if="label"
        class="font-medium truncate"
      >
        {{ label }}
      </div>
      <div 
        v-if="description" 
        :class="[
          'text-xs mt-0.5 truncate transition-colors duration-150',
          {
            'text-muted-foreground dark:text-muted-foreground': !active,
            'text-primary/80 dark:text-primary/80': active
          }
        ]"
      >
        {{ description }}
      </div>
      <slot v-if="!label" />
    </div>

    <div 
      v-if="shortcut" 
      :class="[
        'ml-3 text-xs font-mono px-1.5 py-0.5 rounded transition-colors duration-150',
        {
          'text-muted-foreground dark:text-muted-foreground bg-muted/50 dark:bg-muted/50': !active,
          'text-primary dark:text-primary bg-indigo-100/50 dark:bg-indigo-900/50': active
        }
      ]"
    >
      {{ shortcut }}
    </div>

    <component 
      :is="endIcon" 
      v-if="endIcon" 
      :class="[
        'h-4 w-4 ml-3 flex-shrink-0 transition-colors duration-150',
        {
          'text-muted-foreground dark:text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-muted-foreground': !active && !disabled,
          'text-primary dark:text-primary': active && !disabled
        }
      ]"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number, Object],
    default: null
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  endIcon: {
    type: [Object, Function],
    default: null
  },
  shortcut: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  itemClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click', 'select']);

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
    emit('select', props.value || props.label);
  }
};
</script>
