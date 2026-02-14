<template>
  <BasePanel
    id="sidebar"
    type="side"
    position="left"
    :max-height-ratio="1"
    :default-desktop-state="true">

    <template #header-actions>
      <div class="size-12 flex items-center justify-center">
        <PrismLogo class="p-2" />
      </div>
    </template>

    <div class="flex-1 overflow-y-auto">
      <NavigationMenuRoot>
        <NavigationMenuList class="px-3 py-2 space-y-6">
          <Indicator :position="indicatorStyle" />

          <NavigationCategory
            v-for="category in categories"
            :key="category.title"
            :category="category"
            :current-pill="currentPill"
            :sidebar-elements="sidebarElements"
            @item-click="handleItemClick" />
        </NavigationMenuList>
      </NavigationMenuRoot>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-2 mb-2">
        <FooterNavigationItem
          v-for="item in footerItems"
          :key="item.key"
          :item="item"
          :current-pill="currentPill"
          @click="handleFooterItemClick" />
      </div>
      <p class="text-xs text-center text-muted-foreground">
        Stud.io · xijibomi
      </p>
    </template>
  </BasePanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NavigationMenuList,
  NavigationMenuRoot
} from 'radix-vue'
import { usePills } from '@composables/ui/usePills'
import { useSidebarNavigation } from '@composables/ui/useSidebarNavigation'
import { BasePanel, PrismLogo, PillIndicator as Indicator } from '@components/ui'
import NavigationCategory from '@components/layout/sidebar/NavigationCategory.vue'
import FooterNavigationItem from '@components/layout/sidebar/FooterNavigationItem.vue'
import type { NavigationItem } from '@composables/ui/useSidebarNavigation'

interface Props {
  isMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

const emit = defineEmits<{
  'sidebar-close': []
}>()

defineOptions({
  name: 'SidebarMenu'
})

const sidebarElements = ref([])
const { categories, footerItems } = useSidebarNavigation()

const {
  currentPill,
  indicatorStyle,
  handleNavigation
} = usePills({
  position: 'left',
  updateRoute: true,
  containerRef: sidebarElements,
  hideIndicatorPaths: ['/settings', '/feedback', '/error', '/:pathMatch(.*)*'],
  onNavigate: () => {
    if (props.isMobile) {
      emit('sidebar-close')
    }
  }
})

const handleItemClick = (event: Event, item: NavigationItem) => {
  if (item.comingSoon) return
  handleNavigation(item.path, event.currentTarget as HTMLElement)
}

const handleFooterItemClick = (path: string) => {
  handleNavigation(path, null)
}
</script>
