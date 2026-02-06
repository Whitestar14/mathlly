<template>
  <div class="flex items-center gap-2">
    
    <div class="hidden sm:flex items-center gap-2 mr-2">
      <div class="w-32">
        <SelectBar
          :model-value="options.outputFormat"
          :options="formatOptions"
          placeholder="Format"
          :is-dropdown="false"
          @update:model-value="updateFormat" />
      </div>
    </div>

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
      <BasePopover
        class="z-50 min-w-[180px] bg-background rounded-lg overflow-hidden border border-border p-1 shadow-md"
        :side-offset="6"
        :align="'end'">
        <template #trigger>
          <BaseButton
            variant="ghost"
            size="icon">
            <MoreVerticalIcon class="h-4 w-4" />
          </BaseButton>
        </template>

        <div class="p-2 border-b border-border mb-1 sm:hidden">
          <label class="text-xs text-muted-foreground mb-1 block">Format</label>
          <SelectBar
            :model-value="options.outputFormat"
            :options="formatOptions"
            @update:model-value="updateFormat" />
        </div>

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
      </BasePopover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Code, Shuffle, Trash2, UploadCloud, MoreVertical as MoreVerticalIcon } from 'lucide-vue-next'
import { BaseButton, BasePopover, PopoverItem, SelectBar } from '@components/ui'
import type { Base64Options } from '../types/base64'

defineOptions({
  name: 'Base64Actions'
})

const props = defineProps<{
  options: Base64Options;
  loadSampleText: () => void;
  loadSampleBase64: () => void;
  generateRandomData: () => void;
  clearAll: () => void;
  triggerFilePicker: () => void;
}>()

const formatOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'url-safe', label: 'URL Safe' },
  { value: 'mime', label: 'MIME' }
]

const updateFormat = (val: string) => {
  props.options.outputFormat = val as any
}

</script>