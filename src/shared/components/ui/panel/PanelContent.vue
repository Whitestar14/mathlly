<template>
  <div class="flex flex-col h-full">

    <div
      v-show="showHeader"
      class="flex-shrink-0 h-14 px-3 border-b border-border flex items-center justify-between">

      <div
        v-if="title"
        class="flex-grow flex items-center min-w-0">
        <slot name="panel-title">
          <h2 class="text-base font-medium text-foreground">
            {{ title }}
          </h2>
        </slot>
      </div>

      <slot name="header-actions"></slot>

      <div class="flex items-center w-full justify-end">
        <BaseButton
          class="md:hidden rounded-full"
          variant="ghost"
          size="icon"
          @click="$emit('close')">
          <ChevronsDownIcon class="size-5" />
        </BaseButton>
      </div>
    </div>

    <div
      v-if="$slots.sticky"
      class="flex-shrink-0 sticky top-0 z-20 bg-card">
      <slot name="sticky"></slot>
    </div>

    <div
      class="flex-1 overflow-y-auto"
      :class="contentClass">
      <slot></slot>
    </div>

    <div
      v-if="showFooter && $slots.footer"
      class="flex-shrink-0 border-t border-border p-3 lg:min-h-14">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { ChevronsDownIcon } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'

defineProps({
  title: { type: String, default: '' },
  contentClass: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true }
})

defineEmits(['close'])
</script>
