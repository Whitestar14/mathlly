<template>
  <button
    class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-h-[64px] relative overflow-hidden group"
    :class="[
      active
        ? 'bg-primary hover:bg-primary text-foreground shadow-md ring-1 ring-indigo-300 dark:ring-indigo-400'
        : 'bg-muted hover:bg-muted dark:bg-background dark:hover:bg-accent text-foreground dark:text-muted-foreground border border-border dark:border-border',
      'hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 dark:focus:ring-offset-gray-900'
    ]"
    @click="$emit('click')">

    <div
      v-if="active"
      class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-90"></div>

    <div class="relative z-10 flex flex-col items-center">
      <component
        :is="iconComponent"
        class="h-5 w-5 mb-1.5 transition-transform duration-200 group-hover:scale-105"
        :class="active ? 'text-foreground' : 'text-muted-foreground dark:text-muted-foreground'" />
      <span
        class="text-[10px] font-medium text-center leading-tight"
        :class="active ? 'text-foreground' : 'text-foreground dark:text-muted-foreground'">
        {{ label }}
      </span>
    </div>

    <div
      v-if="active"
      class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-background rounded-full shadow-sm"></div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  RefreshCwIcon,
  InfoIcon,
  ActivityIcon,
  TerminalIcon,
  DatabaseIcon,
  KeyboardIcon
} from 'lucide-vue-next'

interface Props {
  icon: string;
  label: string;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

defineEmits<{
  click: [];
}>()

const iconMap = {
  RefreshCw: RefreshCwIcon,
  Info: InfoIcon,
  Activity: ActivityIcon,
  Terminal: TerminalIcon,
  Database: DatabaseIcon,
  Keyboard: KeyboardIcon
}

const iconComponent = computed(() => iconMap[props.icon as keyof typeof iconMap])
</script>
