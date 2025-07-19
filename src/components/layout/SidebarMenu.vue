<template>
  <BasePanel
    id="sidebar"
    type="side"
    position="left"
    :max-height-ratio="1"
    :default-desktop-state="true"
  >
    <!-- Custom header -->
    <template #header-actions>
      <div class="flex justify-between items-center">
        <TextLogo
          :clipped="isMobile"
          size="sm"
          class="absolute left-2"
        />
      </div>
    </template>

    <!-- Navigation content -->
    <div class="flex-1 overflow-y-auto">
      <NavigationMenuRoot>
        <NavigationMenuList class="px-3 py-2 space-y-6">
          <Indicator :position="indicatorStyle" />
          <div
            v-for="category in categories"
            :key="category.title"
            class="space-y-2"
          >
            <h2 class="px-3 text-xs font-medium text-muted-foreground/90 dark:text-muted-foreground/90 uppercase tracking-wider">
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
                    @click="handleItemClick($event, item)"
                  >
                    <component
                      :is="item.icon"
                      class="h-4 w-4 shrink-0 transition-colors"
                      :class="currentPill === item.path
                        ? 'text-primary'
                        : 'text-muted-foreground/80'
                      "
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
        </NavigationMenuList>
      </NavigationMenuRoot>
    </div>

    <!-- Footer -->
  <template #footer>
    <div class="grid grid-cols-2 gap-2 mb-2">
      <NavigationMenuRoot
        v-for="item in ['settings', 'feedback']"
        :key="item"
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              :active="currentPill === `/${item}`"
              as-child
            >
              <button
                v-tippy="{
                  content:
                    item === 'settings' ? 'Settings' : 'Send Feedback',
                }"
                :data-path="`/${item}`"
                :class="[
                  'flex w-full items-center justify-center gap-2 rounded-md p-2 text-sm transition-colors duration-200',
                  currentPill === `/${item}`
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                ]"
                @click="handleFooterItemClick(`/${item}`)"
              >
                <component
                  :is="item === 'settings' ? CogIcon : MessagesSquareIcon"
                  class="h-5 w-5"
                />
                <span class="block md:hidden capitalize">{{ item }}</span>
              </button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuRoot>
    </div>
    <p class="text-xs text-center text-muted-foreground">
      Mathlly - The Mathlly Team
    </p>
  </template>
  </BasePanel>
</template>

<script setup lang="ts">
import {
  CompassIcon,
  Code2Icon,
  InfoIcon,
  MessagesSquareIcon,
  CogIcon,
  SparklesIcon,
  FunctionSquareIcon,
  RegexIcon,
  LineChartIcon,
  ArrowRightLeftIcon,
  BinaryIcon
} from "lucide-vue-next";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
} from "radix-vue";
import { ref, markRaw } from "vue";
import { usePills } from "@/composables/usePills";
import BaseBadge from "@/components/base/BaseBadge.vue";
import TextLogo from '@/components/base/TextLogo.vue';
import BasePanel from "@/components/base/BasePanel.vue";
import Indicator from "@/components/ui/PillIndicator.vue";

interface Props {
  isMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
});

const emit = defineEmits<{
  'sidebar-close': []
}>();

defineOptions({
  name: "SidebarMenu",
});

const sidebarElements = ref([]);

const categories = markRaw([
  {
    title: "Navigation",
    items: [
      { name: "Home", path: "/", icon: CompassIcon, comingSoon: false, isNew: false },
    ]
  },
  {
    title: "Calculators",
    items: [
      { name: "Calculator", path: "/calculator", icon: Code2Icon, comingSoon: false, isNew: false },
      {
        name: "Functions",
        path: "/functions",
        icon: FunctionSquareIcon,
        comingSoon: true,
      },
      { name: "Regex", path: "/regex", icon: RegexIcon, comingSoon: true },
      {
        name: "Graphing",
        path: "/graphing",
        icon: LineChartIcon,
        comingSoon: true,
      },
      {
        name: "Converter",
        path: "/converter",
        icon: ArrowRightLeftIcon,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        name: "Base64",
        path: "/tools/base64",
        icon: BinaryIcon,
        isNew: true,
        comingSoon: false,
        description: "Encode and decode Base64 strings",
      },
    ],
  },
  {
    title: "Information",
    items: [
      { name: "Updates", path: "/info/update", comingSoon: false, icon: SparklesIcon },
      { name: "About", path: "/info/about", comingSoon: false, icon: InfoIcon },
    ],
  },
]);

const {
  currentPill,
  indicatorStyle,
  handleNavigation,
} = usePills({
  position: "left",
  updateRoute: true,
  containerRef: sidebarElements,
  hideIndicatorPaths: ["/settings", "/feedback", "/error", "/:pathMatch(.*)*"],
  onNavigate: () => {
    if (props.isMobile) {
      emit('sidebar-close');
    }
  },
});

const getMenuItemClasses = (item: any) => {
  const baseClasses = "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors duration-200";
  
  if (currentPill.value === item.path) {
    return `${baseClasses} bg-accent/70 hover:bg-accent text-primary font-medium`;
  }
  
  let classes = `${baseClasses} text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground`;
  
  if (item.comingSoon) {
    classes += ' opacity-50 disabled:hover:!bg-inherit disabled:hover:text-muted-foreground';
  }
  
  return classes;
};

const handleItemClick = (event: Event, item: any) => {
  if (item.comingSoon) return;
  handleNavigation(item.path, event.currentTarget as HTMLElement);
};

const handleFooterItemClick = (path: string) => {
  handleNavigation(path, null);
};
</script>
