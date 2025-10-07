<template>
  <div
    v-show="true"
    class="relative md:flex h-full flex-col flex-auto overflow-hidden hidden transition-[width] duration-300 ease-in-out bg-background border-border"
    :class="panelClasses"
  >
    <!-- Panel Content with Transition -->
    <Transition name="slide-out">
      <div
        v-if="isOpen"
        class="flex flex-col w-full absolute inset-y-0 right-0 transition-opacity duration-300 max-h-[100vh]"
        :class="['opacity-100', mainClass]"
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
          <template #sticky>
            <slot name="sticky" />
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

    <!-- Toggle button (always visible, positioned based on panel state) -->
    <BaseButton
      v-tippy="{
        content: isOpen ? 'Hide Panel' : 'Show Panel',
        placement: position === 'left' ? 'right' : 'left',
      }"
      variant="outline"
      size="icon"
      class="shadow-sm absolute bottom-0 -translate-y-1/3 pointer-events-auto z-10"
      :class="toggleButtonClasses"
      @click="$emit('toggle')"
    >
      <ArrowRightToLine
        class="h-4 w-4 text-foreground transition-transform duration-300"
        :class="{ 
          'rotate-180': position === 'left' ? isOpen : !isOpen 
        }"
      />
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { ArrowRightToLine } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { PanelContent } from '@components/ui/panel'

interface Props {
  isOpen?: boolean
  position?: 'left' | 'right'
  title?: string
  showHeader?: boolean
  showFooter?: boolean
  contentClass?: string
  mainClass?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'toggle'): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  position: 'right',
  title: '',
  showHeader: true,
  showFooter: true,
  contentClass: '',
  mainClass: '',
})

defineEmits<Emits>()

const panelClasses: ComputedRef<string[]> = computed(() => [
  props.isOpen ? 'w-64' : 'w-10',
  props.position === 'left' ? 'border-l' : 'border-r',
])

const toggleButtonClasses: ComputedRef<string[]> = computed(() => [
  props.position === 'left' 
    ? (props.isOpen ? 'right-30 translate-x-1/4' : 'left-1/2 -translate-x-1/2')
    : (props.isOpen ? 'left-30 -translate-x-1/4' : 'left-1/2 -translate-x-1/2')
])
</script>

<style scoped>
.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-out-enter-from,
.slide-out-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-out-enter-to,
.slide-out-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
