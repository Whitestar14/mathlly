<template>
  <Transition :name="position === 'left' ? 'slide-left' : 'slide-right'">
    <div
      v-show="isOpen"
      class="panel-side"
      :class="panelClasses"
    >
      <PanelContent
        :title="title"
        :show-header="showHeader"
        :show-footer="showFooter"
        :content-class="contentClass"
        @close="$emit('close')"
      >
        <template #default>
          <slot />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
        <template
          v-if="$slots.footer"
          #footer
        >
          <slot name="footer" />
        </template>
      </PanelContent>
    </div>
  </Transition>
</template>
  
<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { PanelContent } from '@components/ui/panel'

interface Props {
  isOpen?: boolean
  isMobile?: boolean
  position?: 'left' | 'right'
  title?: string
  showHeader?: boolean
  showFooter?: boolean
  contentClass?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  isMobile: false,
  position: 'right',
  title: '',
  showHeader: true,
  showFooter: true,
  contentClass: '',
})

defineEmits<Emits>()

const panelClasses: ComputedRef<string[]> = computed(() => [
  props.isMobile ? 'w-full' : 'w-64',
  props.position === 'left' ? 'left-0' : 'right-0',
  !props.isMobile && props.position === 'left' ? 'border-r' : '',
  !props.isMobile && props.position === 'right' ? 'border-l' : '',
  'border-border',
])
</script>
  
<style scoped>
/* Side panel animations - Left side */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0%);
}

/* Side panel animations - Right side */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0%);
}
</style>
