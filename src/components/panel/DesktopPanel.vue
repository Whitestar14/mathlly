<template>
  <div
    v-show="true"
    class="relative md:flex h-full flex-col flex-auto overflow-hidden hidden transition-[width] duration-300 ease-in-out bg-card border-border"
    :class="[
      isOpen ? 'w-64' : 'w-10',
      position === 'left' ? 'border-l' : 'border-r',
    ]"
  >
    <!-- Panel Content with Transition -->
    <Transition name="slide-out">
      <div
        v-if="isOpen"
        class="flex flex-col w-full absolute inset-y-0 right-0 transition-opacity duration-300 max-h-[100vh]"
        :class="[
          'opacity-100',
          mainClass,
        ]"
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

    <!-- Toggle button (always visible, positioned based on panel state) -->
    <Button
      v-tippy="{
        content: isOpen ? 'Hide Panel' : 'Show Panel',
        placement: position === 'left' ? 'right' : 'left',
      }"
      variant="outline"
      size="icon"
      class="shadow-sm absolute bottom-0 -translate-y-1/3 pointer-events-auto z-10"
      :class="[
        position === 'left' 
          ? (isOpen ? 'right-30 translate-x-1/4' : 'left-1/2 -translate-x-1/2')
          : (isOpen ? 'left-30 -translate-x-1/4' : 'left-1/2 -translate-x-1/2')
      ]"
      @click="$emit('toggle')"
    >
      <ArrowRightToLine
        class="h-4 w-4 text-foreground dark:text-muted-foreground transition-transform duration-300"
        :class="{ 
          'rotate-180': position === 'left' ? isOpen : !isOpen 
        }"
      />
    </Button>
  </div>
</template>

<script setup>
import { ArrowRightToLine } from 'lucide-vue-next';
import Button from '@/components/base/BaseButton.vue';
import PanelContent from '@/components/base/PanelContent.vue';

defineProps({
  isOpen: { type: Boolean, default: false },
  position: { type: String, default: 'right' },
  title: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  contentClass: { type: String, default: '' },
  mainClass: { type: String, default: '' },
});

defineEmits(['close', 'toggle']);
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
