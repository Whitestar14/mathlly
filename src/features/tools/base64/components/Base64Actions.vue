<template>
  <div class="flex items-center">

    <div class="hidden md:flex items-center gap-2">
      <BaseButton
        v-tippy="{ content: 'Sample Text' }"
        variant="ghost"
        size="icon"
        @click="loadSampleText">
        <FileText class="h-4 w-4" />
      </BaseButton>

      <BaseButton
        v-tippy="{ content: 'Sample Base64' }"
        variant="ghost"
        size="icon"
        @click="loadSampleBase64">
        <Code class="h-4 w-4" />
      </BaseButton>

      <BaseButton
        v-tippy="{ content: 'Random Data' }"
        variant="ghost"
        size="icon"
        @click="generateRandomData">
        <Shuffle class="h-4 w-4" />
      </BaseButton>

      <BaseButton
        v-tippy="{ content: 'Clear All' }"
        variant="ghost"
        size="icon"
        @click="clearAll">
        <Trash2 class="h-4 w-4" />
      </BaseButton>

      <BaseButton
        v-tippy="{ content: 'Upload file' }"
        variant="ghost"
        size="icon"
        @click="triggerFilePicker">
        <UploadCloud class="h-4 w-4" />
      </BaseButton>
    </div>

    <div class="md:hidden">
      <PopoverRoot>
        <PopoverTrigger as-child>
          <BaseButton
            variant="ghost"
            size="icon">
            <MoreVerticalIcon class="h-4 w-4" />
          </BaseButton>
        </PopoverTrigger>

        <PopoverPortal>
          <PopoverContent
            class="z-50 min-w-[180px] bg-background rounded-lg overflow-hidden border border-border p-1 shadow-md"
            :side-offset="6"
            align="end">
            <div class="flex flex-col">
              <PopoverItem
                label="Sample Text"
                :icon="FileText"
                @click="loadSampleText" />
              <PopoverItem
                label="Sample Base64"
                :icon="Code"
                @click="loadSampleBase64" />
              <PopoverItem
                label="Random Data"
                :icon="Shuffle"
                @click="generateRandomData" />
              <PopoverItem
                label="Upload file"
                :icon="UploadCloud"
                @click="triggerFilePicker" />
              <PopoverItem
                label="Clear All"
                :icon="Trash2"
                destructive
                @click="clearAll" />
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Code, Shuffle, Trash2, UploadCloud, MoreVertical as MoreVerticalIcon } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'radix-vue'
import PopoverItem from '@components/ui/PopoverItem.vue'

const props = defineProps<{
  loadSampleText: () => void;
  loadSampleBase64: () => void;
  generateRandomData: () => void;
  clearAll: () => void;
  triggerFilePicker: () => void;
}>()

const {
  loadSampleText,
  loadSampleBase64,
  generateRandomData,
  clearAll,
  triggerFilePicker
} = props
</script>
