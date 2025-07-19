<template>
  <div class="space-y-2">
    <h2 class="category-title">
      {{ category.title }}
    </h2>
    <div class="space-y-0.5">
      <NavigationMenuItem
        v-for="item in category.items"
        ref="sidebarElements"
        :key="item.path"
        class="space-y-0.5"
      >
        <NavigationMenuLink
          :active="currentPill === item.path"
          as-child
        >
          <button
            :data-path="item.path"
            :disabled="item.comingSoon ?? false"
            :class="getMenuItemClasses(item)"
            @click="$emit('item-click', $event, item)"
          >
            <component
              :is="item.icon"
              class="menu-icon"
              :class="getIconClasses(item.path)"
            />
            <span>{{ item.name }}</span>
            <BaseBadge
              v-if="item.comingSoon"
              variant="soon"
            />
            <BaseBadge
              v-if="item.isNew"
              variant="new"
            />
          </button>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "radix-vue";
import { useMenuStyles } from '@/composables/useMenuStyles';
import BaseBadge from "@/components/base/BaseBadge.vue";
import type { NavigationCategory as NavigationCategoryType, NavigationItem } from '@/composables/useSidebarNavigation';

interface Props {
  category: NavigationCategoryType;
  currentPill: string;
  sidebarElements: any[];
}

interface Emits {
  (e: 'item-click', event: Event, item: NavigationItem): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const currentPillRef = computed(() => props.currentPill);
const { getMenuItemClasses, getIconClasses } = useMenuStyles(currentPillRef);
</script>

<style scoped>
.category-title {
  @apply px-3 text-xs font-medium text-muted-foreground/90 dark:text-muted-foreground/90 uppercase tracking-wider;
}

.menu-icon {
  @apply h-4 w-4 shrink-0 transition-colors;
}
</style>
