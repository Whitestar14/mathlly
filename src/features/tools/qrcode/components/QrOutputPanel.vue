<template>
  <div class="h-full bg-card border border-border rounded-lg flex flex-col overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between p-2 border-b border-border bg-muted/30 h-[53px] shrink-0">
      <div class="flex items-center gap-2 px-2">
        <span class="text-sm font-medium">Output</span>
      </div>
      <div class="flex items-center gap-1">
        <BaseButton
          v-if="dataUrl"
          v-tippy="'Download PNG'"
          variant="ghost"
          size="icon"
          class="size-8"
          @click="$emit('download', 'png')">
          <Image class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton
          v-if="dataUrl"
          v-tippy="'Download SVG'"
          variant="ghost"
          size="icon"
          class="size-8"
          @click="$emit('download', 'svg')">
          <Code class="size-4 text-muted-foreground" />
        </BaseButton>
        <BaseButton
          v-if="dataUrl"
          v-tippy="'Copy Image'"
          variant="ghost"
          size="icon"
          class="size-8"
          @click="copyImage">
          <Copy class="size-4 text-muted-foreground" />
        </BaseButton>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center p-8 bg-muted/5 relative overflow-hidden">

      <div v-if="isGenerating" class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
        <Loader2 class="size-6 animate-spin text-primary" />
      </div>

      <div v-if="error" class="text-center max-w-sm">
        <AlertCircle class="size-8 text-destructive mx-auto mb-2" />
        <p class="text-sm text-destructive font-medium">{{ error }}</p>
      </div>

      <div v-else-if="dataUrl" class="relative group">
        <!-- Checkerboard background for transparency check -->
        <div class="absolute inset-0 bg-[url('/img/transparent-grid.png')] opacity-50 rounded-lg -z-10"></div>
        <img
          :src="dataUrl"
          alt="Generated QR Code"
          class="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm border border-border bg-white" />
      </div>

      <div v-else class="text-center text-muted-foreground/40">
        <QrCode class="size-12 mx-auto mb-2 opacity-20" />
        <p class="text-sm font-medium">Enter text to generate QR code</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Image, Copy, QrCode, Loader2, AlertCircle, Code } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { useToast } from '@composables/ui/useToast'

const props = defineProps<{
  dataUrl: string | null
  isGenerating: boolean
  error: string | null
}>()

defineEmits<{
  (e: 'download', format: 'png' | 'svg'): void
}>()

const { toast } = useToast()

const copyImage = async() => {
  if (!props.dataUrl) return
  try {
    const blob = await (await fetch(props.dataUrl)).blob()
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
    toast({ title: 'Copied', description: 'QR Code image copied to clipboard', type: 'success' })
  } catch(e) {
    console.error(e)
    toast({ title: 'Error', description: 'Failed to copy image', type: 'error' })
  }
}
</script>
