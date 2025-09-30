<template>
  <PopoverClose as-child>
    <button
      :class="[ destructive ? 'context-menu-item-danger' : 'context-menu-item', className ]"
      @click="handleClick"
    >
      <component
        :is="props.icon"
        v-if="props.icon"
        class="mr-2 h-4 w-4"
      />
      <span class="truncate">{{ props.label }}</span>
    </button>
  </PopoverClose>
</template>

<script setup lang="ts">
import { PopoverClose } from 'radix-vue';

const props = defineProps<{
  label: string;
  icon?: any;
  destructive?: boolean;
  className?: string;
}>();

const emit = defineEmits<{
  (e: 'click', event?: MouseEvent): void;
}>();

const handleClick = (e: MouseEvent) => {
  emit('click', e);
};
</script>
