<template>
  <div class="left-0 bottom-0 w-full absolute z-10">
    <div class="flex flex-row gap-20 justify-between items-center opacity-30 w-full transition-opacity duration-300 hover:opacity-100 p-2">
      <div class="flex-1 cursor-pointer">
        <div
          v-show="showLeftChevron"
          class="flex justify-start"
          @click="scrollToPrevious">
          <BaseButton
            size="icon"
            variant="ghost"
            class="hover:!bg-transparent">
            <ChevronLeft size="20" />
          </BaseButton>
        </div>
      </div>

      <div class="flex-1 cursor-pointer">
        <div
          v-show="showRightChevron"
          class="flex justify-end"
          @click="scrollToNext">
          <BaseButton
            size="icon"
            variant="ghost"
            class="hover:!bg-transparent">
            <ChevronRight size="20" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'

defineProps({
  showLeftChevron: { type: Boolean, default: false },
  showRightChevron: { type: Boolean, default: false }
})

const emit = defineEmits(['scroll-to-previous', 'scroll-to-next'])

const scrollToPrevious = () => emit('scroll-to-previous')
const scrollToNext = () => emit('scroll-to-next')
</script>
