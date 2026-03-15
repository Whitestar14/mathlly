<template>
  <div
    class="flex items-center left-0 top-0 absolute z-10 opacity-50 transition-opacity hover:opacity-100 group">
    <div
      class="flex items-center m-2 border border-border bg-background rounded-lg overflow-hidden shadow-sm">
      <BaseButton
        variant="ghost"
        size="icon"
        class="rounded-none group-hover:bg-opacity-100 md:hidden"
        @click="openHistory">
        <DraftingCompassIcon size="15" />
      </BaseButton>
      <Separator
        class="h-6 bg-border w-px md:hidden group-has-[.rounded-none:hover]:h-8 transition-[height]" />
      <BaseButton
        v-tippy="{content: 'Copy to Clipboard', placement: 'right'}"
        variant="ghost"
        size="icon"
        class="rounded-none group-hover:bg-opacity-100"
        @click="copyToClipboard">
        <Copy size="15" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { Separator } from 'radix-vue'
import { DraftingCompassIcon, Copy } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'

const emit = defineEmits(['open-activity', 'copy-to-clipboard'])

const openHistory = () => emit('open-activity')
const copyToClipboard = () => emit('copy-to-clipboard')
</script>
