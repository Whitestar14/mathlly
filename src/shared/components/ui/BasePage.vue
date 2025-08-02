<template>
  <div
    :class="[
      isToolLayout ? 'flex flex-col flex-grow' : 'h-full',
      'bg-muted/50 dark:bg-background/50 text-foreground'
    ]"
  >
    <header
      v-if="showHeader"
      class="sticky -top-px z-10 bg-card backdrop-blur-sm border-b border-border"
    >
      <div class="container mx-auto flex items-center gap-2 h-14 px-4">
        <BaseButton
          v-show="showBackButton"
          variant="ghost"
          size="icon"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </BaseButton>
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-medium">
            {{ title }}
          </h1>
        </div>
      </div>
    </header>

    <main :class="[mainClass, isToolLayout ? 'flex-grow' : '']">
      <slot />
    </main>

    <footer
      v-if="showFooter"
      class="mt-auto py-8 border-t border-border bg-card"
    >
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; {{ new Date().getFullYear() }} Prism. 
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { useRouter, type Router } from 'vue-router'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { useTitle } from '@composables/utils/useTitle'
import { BaseButton } from '@components/ui'

interface Props {
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
  mainClass?: string;
  isToolLayout?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  showFooter: false,
  showBackButton: true,
  mainClass: 'container mx-auto px-4 py-8 md:py-12',
  isToolLayout: false,
  badge: false
})

const router: Router = useRouter()

const titleComputed: ComputedRef<string> = computed(() => props.title)
useTitle(titleComputed)

const goBack = (): void => {
  router.go(-1)
}
</script>
