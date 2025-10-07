<template>
  <div
    v-show="isOpen"
    class="fixed inset-x-0 z-20"
  >
    <div
      ref="panelRef"
      class="bg-panel fixed inset-x-0 bottom-0 overflow-hidden"
      :class="mobilePanelClasses"
      :style="mobilePanelStyle"
    >
      <!-- Expand/Minimize Button -->
      <BaseButton
        v-if="!(maxHeightRatio === 1)"
        v-tippy="{ content: isExpanded ? 'Minimize Panel' : 'Expand Panel' }"
        variant="ghost"
        size="icon"
        class="absolute right-14 top-3.5 p-1.5 rounded-full"
        aria-label="Toggle panel expansion"
        @click="$emit('toggle')"
      >
        <Maximize2
          v-if="!isExpanded"
          class="w-4 h-4"
        />
        <Minimize2
          v-else
          class="w-4 h-4"
        />
      </BaseButton>

      <!-- Draggable Handle - Hide when expanded -->
      <div
        ref="handleRef"
        class="w-full absolute h-6 flex items-center justify-center touch-manipulation"
        :class="handleClasses"
        aria-label="Drag handle to resize panel"
      >
        <div class="w-10 h-1 pb-1 rounded-full bg-muted" />
      </div>

      <div
        class="h-full"
        :class="mainClass"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, type Ref, type ComputedRef } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { PanelContent } from '@components/ui/panel'

interface Props {
  isOpen?: boolean
  title?: string
  showHeader?: boolean
  showFooter?: boolean
  mainClass?: string
  contentClass?: string
  panel?: Ref<HTMLElement | null>
  handle?: Ref<HTMLElement | null>
  isExpanded?: boolean
  panelHeight?: number
  translateY?: number
  isDragging?: boolean
  maxHeightRatio?: number
  animationEnabled?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'toggle'): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: '',
  showHeader: true,
  showFooter: true,
  mainClass: '',
  contentClass: '',
  panel: () => ref(null),
  handle: () => ref(null),
  isExpanded: false,
  panelHeight: 300,
  translateY: 0,
  isDragging: false,
  maxHeightRatio: 0.8,
  animationEnabled: false,
})

defineEmits<Emits>()

const panelRef: Ref<HTMLElement | null> = ref(null)
const handleRef: Ref<HTMLElement | null> = ref(null)

const updateRefs = (): void => {
  if (props.panel && panelRef.value) {
    // eslint-disable-next-line
    props.panel.value = panelRef.value
  }

  if (props.handle && handleRef.value) {
    // eslint-disable-next-line
    props.handle.value = handleRef.value
  }
}

const mobilePanelClasses: ComputedRef<string[]> = computed(() => [
  'overflow-hidden', // Add overflow hidden to prevent layout issues
  props.isExpanded || props.maxHeightRatio === 1 ? 'rounded-none' : 
  props.animationEnabled ? 'transition-[rounded] duration-300 rounded-t-xl' : 'rounded-t-xl'
])

const mobilePanelStyle: ComputedRef<Record<string, string>> = computed(() => ({
  height: `${props.panelHeight}px`,
  transform: `translateY(${props.translateY}px)`,
  transition: props.isDragging ? '' : props.animationEnabled ? 'transform 0.3s ease-out, height 0.3s ease-out' : '',
}))

const handleClasses: ComputedRef<(string | Record<string, boolean>)[]> = computed(() => [
  { 'cursor-grabbing': props.isDragging },
  props.isExpanded || props.maxHeightRatio === 1 ? 'pointer-events-none opacity-0' : 'cursor-grab'
])

onMounted(updateRefs)
watch([panelRef, handleRef], updateRefs)
</script>
