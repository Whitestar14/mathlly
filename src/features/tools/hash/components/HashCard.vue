<template>
  <div class="bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:border-primary/40 group">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">{{ algorithm }}</span>
        <span class="text-[10px] text-muted-foreground/50 font-mono">{{ hash.length * 4 }} bits</span>
      </div>
      <div class="flex items-center gap-1">
        <BaseButton
          variant="ghost"
          size="icon"
          class="size-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          v-tippy="'Download'"
          @click="downloadHash"
        >
          <Download class="size-3" />
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="icon"
          class="size-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          v-tippy="'Copy'"
          @click="copyHash"
        >
          <Copy class="size-3" />
        </BaseButton>
      </div>
    </div>
    
    <div class="relative">
      <div 
        class="font-mono text-sm break-all text-foreground bg-muted/30 p-2 rounded border border-transparent group-hover:border-border transition-colors cursor-pointer"
        @click="copyHash"
      >
        {{ hash }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Copy, Download } from 'lucide-vue-next'
import { BaseButton } from '@components/ui'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'

const props = defineProps<{
  algorithm: string
  hash: string
}>()

const { copy } = useClipboard()
const { toast } = useToast()

const handleError = (action: string) => {
   if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast({ 
        title: 'Environment Restriction', 
        description: `${action} requires a secure context (HTTPS/localhost). Current: ${window.location.host}`, 
        type: 'error',
        duration: 6000
      })
   } else {
      toast({ title: 'Error', description: `Failed to ${action.toLowerCase()}.`, type: 'error' })
   }
}

const copyHash = async () => {
  try {
    await copy(props.hash)
    toast({ title: 'Copied', description: `${props.algorithm} hash copied to clipboard`, type: 'success' })
  } catch (e) {
    handleError('Clipboard copy')
  }
}

const downloadHash = () => {
  try {
    const blob = new Blob([props.hash], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.algorithm.toLowerCase()}_hash.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: 'Downloaded', description: 'Hash saved to file', type: 'success' })
  } catch (e) {
    handleError('Download')
  }
}
</script>
