<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      v-show="showHeader"
      class="flex-shrink-0 h-14 px-3 border-b border-border flex items-center justify-between"
    >
      <!-- New: Slot for custom title content, otherwise fallback to h2 -->
      <div v-if="title" class="flex-grow flex items-center min-w-0">
        <slot name="panel-title">
          <h2 class="text-base font-medium text-foreground">
            {{ title }}
          </h2>
        </slot>
      </div>

      <!-- Existing header-actions slot, now correctly positioned alongside the title/logo -->
      <slot name="header-actions" />

      <!-- Mobile close button - always on the far right -->
      <div class="flex items-center w-full justify-end">
        <BaseButton
          class="md:hidden rounded-full"
          variant="ghost"
          size="icon"
          @click="$emit('close')"
        >
          <XIcon class="h-4 w-4" />
        </BaseButton>
      </div>
    </div>

    <div 
      v-if="$slots.sticky" 
      class="flex-shrink-0 sticky top-0 z-20 bg-card"
    >
      <slot name="sticky" />
    </div>
      
    <!-- Main Content - This scrolls -->
    <div
      class="flex-1 overflow-y-auto"
      :class="contentClass"
    >
      <slot />
    </div>
      
    <!-- Footer -->
    <div
      v-if="showFooter && $slots.footer"
      class="flex-shrink-0 border-t border-border p-3 lg:min-h-14"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
  
<script setup>
import { XIcon } from "lucide-vue-next"
import { BaseButton } from '@components/ui'

defineProps({
  title: { type: String, default: "" },
  contentClass: { type: String, default: "" },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
})

defineEmits(['close'])
</script>
