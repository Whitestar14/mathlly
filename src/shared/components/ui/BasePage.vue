<template>
  <div
    :class="[
      isToolLayout ? 'flex flex-col flex-grow' : 'h-full',
      'bg-background dark:bg-background/50 text-foreground'
    ]">
    <header
      v-if="showHeader"
      class="sticky -top-px z-10 bg-background backdrop-blur-sm border-b border-border">
      <div class="container mx-auto flex font-mono items-center gap-2 h-14 px-4">
        <BaseButton
          v-show="showBackButton"
          variant="ghost"
          size="icon"
          @click="goBack">
          <ChevronLeftIcon class="size-4" />
        </BaseButton>
        <div class="flex items-center gap-3">
          <template v-if="breadcrumbs && breadcrumbs.length > 0">
            <nav aria-label="Breadcrumb">
              <ol class="flex items-center gap-2 text-sm">
                <li
                  v-for="(crumb, index) in breadcrumbs"
                  :key="index"
                  class="flex items-center gap-2">
                  <RouterLink
                    v-if="crumb.path && index < breadcrumbs.length - 1"
                    :to="crumb.path"
                    class="text-primary hover:underline">
                    {{ crumb.label }}
                  </RouterLink>
                  <span
                    v-else
                    class="text-foreground font-medium">
                    {{ crumb.label }}
                  </span>
                  <span
                    v-if="index < breadcrumbs.length - 1"
                    class="text-muted-foreground">/</span>
                </li>
              </ol>
            </nav>
          </template>
          <template v-else>
            <h1 class="text-xl font-medium">
              {{ title }}
            </h1>
          </template>
        </div>
      </div>
    </header>

    <main :class="[mainClass, isToolLayout ? 'flex-grow' : '']">
      <slot></slot>
    </main>

    <footer
      v-if="showFooter"
      class="mt-auto py-8 border-t border-border bg-card">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; {{ new Date().getFullYear() }} Prism.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { useRouter, type Router, RouterLink } from 'vue-router'
import { ChevronLeftIcon } from 'lucide-vue-next'
import { useTitle } from '@composables/utils/useTitle'
import { BaseButton } from '@components/ui'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface Props {
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
  mainClass?: string;
  isToolLayout?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  showFooter: false,
  showBackButton: true,
  mainClass: 'container mx-auto px-4 py-8 md:py-12',
  isToolLayout: false,
  breadcrumbs: () => ([])
})

const router: Router = useRouter()

const titleComputed: ComputedRef<string> = computed(() => props.title)
useTitle(titleComputed)

const goBack = (): void => {
  router.go(-1)
}
</script>
