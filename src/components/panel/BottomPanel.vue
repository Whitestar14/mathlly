<template>
  <div
    v-show="isOpen"
    class="fixed inset-x-0 z-20"
  >
    <div
      ref="panelRef"
      class="bg-background fixed inset-x-0 bottom-0 overflow-hidden"
      :class="mobilePanelClasses"
      :style="mobilePanelStyle"
    >
      <!-- Expand/Minimize Button -->
      <button
        v-if="!(maxHeightRatio === 1)"
        class="absolute right-14 top-3.5 p-1.5 rounded-full bg-muted dark:bg-background text-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-accent transition-colors"
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
      </button>

      <!-- Draggable Handle - Hide when expanded -->
      <div
        ref="handleRef"
        class="w-full absolute h-6 flex items-center justify-center touch-manipulation"
        :class="handleClasses"
        aria-label="Drag handle to resize panel"
      >
        <div class="w-10 h-1 pb-1 rounded-full bg-muted dark:bg-muted" />
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

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { Maximize2, Minimize2 } from 'lucide-vue-next';
import PanelContent from '@/components/base/PanelContent.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  mainClass: { type: String, default: '' },
  contentClass: { type: String, default: '' },
  panel: { type: Object, default: null },
  handle: { type: Object, default: null },
  isExpanded: { type: Boolean, default: false },
  panelHeight: { type: Number, default: 300 },
  translateY: { type: Number, default: 0 },
  isDragging: { type: Boolean, default: false },
  maxHeightRatio: { type: Number, default: 0.8 },
  animationEnabled : { type: Boolean, default: false },
});

defineEmits(['close', 'toggle']);

const panelRef = ref(null);
const handleRef = ref(null);

onMounted(updateRefs);

watch([panelRef, handleRef], updateRefs);

function updateRefs() {
  if (props.panel && panelRef.value) {
    // eslint-disable-next-line vue/no-mutating-props
    props.panel.value = panelRef.value;
  }

  if (props.handle && handleRef.value) {
    // eslint-disable-next-line vue/no-mutating-props
    props.handle.value = handleRef.value;
  }
}

const mobilePanelClasses = computed(() => [
  props.isExpanded || props.maxHeightRatio === 1 ? 'rounded-none' : 
  props.animationEnabled ? 'transition-[rounded] duration-300 rounded-t-xl' : 'rounded-t-xl'
]);

const mobilePanelStyle = computed(() => ({
  height: `${props.panelHeight}px`,
  transform: `translateY(${props.translateY}px)`,
  transition: props.isDragging ? '' : props.animationEnabled ? 'transform 0.3s ease-out, height 0.3s ease-out' : '',
}));

const handleClasses = computed(() => [
  { 'cursor-grabbing': props.isDragging },
  props.isExpanded || props.maxHeightRatio === 1 ? 'pointer-events-none opacity-0' : 'cursor-grab'
]);
</script>
