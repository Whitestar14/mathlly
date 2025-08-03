<template>
  <NavigationMenuRoot>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuLink
          :active="currentPill === item.path"
          as-child
        >
          <button
            v-tippy="{
              content: item.label,
            }"
            :data-path="item.path"
            :class="getFooterItemClasses(item.path)"
            @click="$emit('click', item.path)"
          >
            <component
              :is="item.icon"
              class="h-5 w-5"
            />
            <span class="block md:hidden capitalize">{{ item.key }}</span>
          </button>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenuRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
} from "radix-vue";
import { useMenuStyles } from '@composables/ui/useMenuStyles';
import type { FooterItem } from '@composables/ui/useSidebarNavigation';

interface Props {
  item: FooterItem;
  currentPill: string;
}

interface Emits {
  (e: 'click', path: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const currentPillRef = computed(() => props.currentPill);
const { getFooterItemClasses } = useMenuStyles(currentPillRef);
</script>
