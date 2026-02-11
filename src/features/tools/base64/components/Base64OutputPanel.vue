<template>
  <div class="flex flex-col h-full min-h-0 border border-border rounded-lg bg-card overflow-hidden shadow-sm">
    <!-- Toolbar -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px] flex-shrink-0">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-foreground px-2">Output</label>
        <div
          class="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono uppercase">
          {{ formatLabel }}
        </div>
      </div>
      <div class="flex items-center gap-1">
        <BaseButton v-if="hasPreview" v-tippy="showPreview ? 'Show Text' : 'Show Preview'" variant="ghost" size="icon"
          class="size-8" @click="showPreview = !showPreview">
          <component :is="showPreview ? FileTextIcon : EyeIcon" class="size-4 text-muted-foreground" />
        </BaseButton>
        <div v-if="hasPreview" class="w-px h-4 bg-border mx-1"></div>
        <BaseButton v-tippy="'Swap'" variant="ghost" size="icon" class="size-8" :disabled="!modelValue"
          @click="$emit('swap')">
          <ArrowDownUp class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Download'" variant="ghost" size="icon" class="size-8" :disabled="!modelValue"
          @click="$emit('download')">
          <Download class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton v-tippy="'Copy'" variant="ghost" size="icon" class="size-8" :disabled="!modelValue"
          @click="$emit('copy')">
          <Copy class="size-4 text-muted-foreground" />
        </BaseButton>
      </div>
    </div>

    <!-- Content -->
    <div class="relative flex-1 min-h-0 bg-background flex flex-col">
      <div v-if="showPreview && hasPreview" class="flex-1 flex flex-col items-center justify-center p-4 bg-muted/5">
        <div class="relative max-w-full max-h-full flex flex-col items-center justify-center gap-4">
          <img v-if="previewInfo?.mime.startsWith('image/')" :src="previewUrl!"
            class="max-h-[300px] object-contain rounded-md border border-border shadow-sm bg-[url('/img/transparent-grid.png')]" />
          <iframe v-else-if="previewInfo?.mime === 'application/pdf'" :src="previewUrl!"
            class="w-full h-[300px] border border-border rounded shadow-sm"></iframe>
          <div v-else
            class="flex flex-col items-center text-muted-foreground p-8 border border-dashed border-border rounded-lg">
            <FileIcon class="size-12 mb-2 opacity-50" />
            <span class="text-sm">Binary Data</span>
          </div>
          <div class="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {{ previewInfo?.mime }} • {{ previewInfo?.size }}
          </div>
        </div>
      </div>
      <textarea v-else :value="modelValue" readonly
        class="flex-1 w-full h-full p-4 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed custom-scrollbar"
        :class="{ 'text-muted-foreground italic': !modelValue }"
        :placeholder="!modelValue ? 'Result will appear here...' : ''"></textarea>
    </div>

    <!-- Footer Stats -->
    <div v-if="showStats"
      class="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium border-t border-border bg-muted/30 h-8 flex-shrink-0 select-none"
      :class="error ? 'text-destructive bg-destructive/5' : 'text-muted-foreground'">
      <div class="flex items-center gap-2 truncate max-w-[70%]">
        <template v-if="error">
          <AlertCircle class="size-3" />
          <span>{{ error }}</span>
        </template>
        <template v-else>
          <span>{{ modelValue ? 'Success' : 'Idle' }}</span>
        </template>
      </div>
      <div v-if="stats && !error">
        {{ stats.characters.toLocaleString() }} chars
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Download, ArrowDownUp, Eye as EyeIcon, FileText as FileTextIcon, File as FileIcon, AlertCircle } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'

const props = defineProps<{
  modelValue: string
  formatLabel: string
  stats?: any
  showStats?: boolean
  error?: string
  previewUrl?: string | null
  previewInfo?: { mime: string, size: string } | null
}>()

const emit = defineEmits(['copy', 'download', 'swap'])
const showPreview = ref(true)
const hasPreview = computed(() => !!props.previewUrl || !!props.previewInfo)
</script>