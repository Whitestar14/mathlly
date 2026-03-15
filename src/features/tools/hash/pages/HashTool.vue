
<template>
  <BasePage
    title="Hash Generator"
    :breadcrumbs="breadcrumbs"
    :is-tool-layout="true"
    main-class="flex flex-col flex-grow overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-background">
    <div class="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 md:p-4 grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 gap-4 h-full">

      <!-- Input Section (Top/Left Pane) -->
      <div class="flex flex-col h-full min-h-0 gap-2">
        <div class="flex items-center justify-between px-1 shrink-0 h-8">
          <div class="flex items-center gap-2">
            <BaseLabel>Text Input</BaseLabel>
            <HelpCircle
              v-tippy="{
                content: 'Generates cryptographic digests (MD5, SHA-1, SHA-256, etc.) from input text. Useful for verifying data integrity.',
                placement: 'right'
              }"
              class="size-3.5 text-muted-foreground cursor-help" />
          </div>

          <div class="flex items-center gap-2">
            <BasePopover align="end" :disable-outside-pointer-events="false">
              <template #trigger>
                <BaseButton variant="ghost" size="sm" class="h-8 text-xs gap-1.5 px-2">
                  <Settings2 class="size-3.5" />
                  <span>Algorithms</span>
                </BaseButton>
              </template>
              <div class="p-1 min-w-[180px]">
                <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Algorithms
                </div>
                <div v-for="algo in AVAILABLE_ALGORITHMS" :key="algo" class="flex items-center px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer gap-2" @click="toggleAlgorithm(algo)">
                  <div class="flex items-center justify-center size-4 rounded border border-primary/50" :class="{ 'bg-primary border-primary': enabledAlgorithms.includes(algo) }">
                    <Check v-if="enabledAlgorithms.includes(algo)" class="size-3 text-primary-foreground" />
                  </div>
                  <span class="text-sm font-medium">{{ algo }}</span>
                </div>
              </div>
            </BasePopover>

            <div class="w-px h-4 bg-border"></div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground">Uppercase</span>
              <ToggleBar v-model="isUppercase" />
            </div>
          </div>
        </div>

        <div class="flex-1 min-h-0">
          <BaseEditor
            v-model="input"
            class="h-full"
            placeholder="Type text to hash..."
            :show-line-numbers="false"
            :default-status="inputStatus"
            :stats="inputStats">
            <template #toolbar>
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-foreground px-2">Source</label>
              </div>
              <div class="flex items-center gap-1">
                <BaseButton v-tippy="'Copy Input'" variant="ghost" size="icon" class="size-8" :disabled="!input" @click="handleCopy">
                  <Copy class="size-4 text-muted-foreground" />
                </BaseButton>
                <BaseButton v-tippy="'Paste'" variant="ghost" size="icon" class="size-8" @click="handlePaste">
                  <ClipboardPaste class="size-4 text-muted-foreground" />
                </BaseButton>
                <div class="w-px h-4 bg-border mx-1"></div>
                <BaseButton v-tippy="'Clear'" variant="ghost" size="icon" class="size-8 hover:text-destructive" @click="clear">
                  <Trash2 class="size-4" />
                </BaseButton>
              </div>
            </template>
          </BaseEditor>
        </div>
      </div>

      <!-- Results Grid (Bottom/Right Pane) -->
      <div class="flex flex-col h-full min-h-0 bg-muted/10 rounded-lg border border-border/50 overflow-hidden">
        <div class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20 shrink-0 h-[45px]">
          <span class="text-sm font-medium">Results</span>
          <span class="text-xs text-muted-foreground">{{ results.length }} generated</span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <TransitionGroup name="list" tag="div" class="flex flex-col gap-3">
             <template v-if="isProcessing && results.length === 0">
                 <div v-for="i in 4" :key="i" class="bg-card border border-border rounded-lg p-4 animate-pulse">
                    <div class="flex justify-between mb-2">
                       <div class="h-3 w-12 bg-muted rounded"></div>
                    </div>
                    <div class="h-6 w-full bg-muted/40 rounded"></div>
                 </div>
             </template>

            <HashCard
              v-else
              v-for="res in results"
              :key="res.algorithm"
              :algorithm="res.algorithm"
              :hash="res.hash" />
          </TransitionGroup>

          <div v-if="results.length === 0 && !isProcessing" class="h-full flex flex-col items-center justify-center text-muted-foreground/40 min-h-[300px]">
            <Fingerprint class="size-12 mb-3 opacity-20" />
            <p class="text-sm font-medium">No hashes generated</p>
            <p class="text-xs mt-1">Enter text or select algorithms</p>
          </div>
        </div>
      </div>

    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { BasePage, BaseEditor, BaseLabel, ToggleBar, BaseButton, BasePopover } from '@components/ui'
import { Fingerprint, HelpCircle, Copy, ClipboardPaste, Trash2, Settings2, Check } from 'lucide-vue-next'
import { useHash, AVAILABLE_ALGORITHMS } from '../composables/useHash'
import { useKeyboardStore } from '@stores/keyboard'
import { useClipboard } from '@vueuse/core'
import { useToast } from '@composables/ui/useToast'

const HashCard = defineAsyncComponent(() => import('../components/HashCard.vue'))

const breadcrumbs = [{ label: 'Tools', path: '/' }, { label: 'Hash Generator' }]
const { input, results, isUppercase, inputStatus, inputStats, clear, enabledAlgorithms, toggleAlgorithm, isProcessing } = useHash()
const keyboard = useKeyboardStore()
const { copy } = useClipboard()
const { toast } = useToast()

const checkSecureContext = (action: string) => {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    toast({
      title: 'Environment Restriction',
      description: `${action} requires a secure context (HTTPS or localhost). Current: ${window.location.host}`,
      type: 'error',
      duration: 6000
    })
    return false
  }
  return true
}

const handleCopy = async() => {
  try {
    await copy(input.value)
    toast({ title: 'Copied', description: 'Input text copied to clipboard', type: 'success' })
  } catch {
    if (!checkSecureContext('Clipboard write')) {
      return
    }
    toast({ title: 'Error', description: 'Failed to copy input', type: 'error' })
  }
}

const handlePaste = async() => {
  try {
    const text = await navigator.clipboard.readText()
    input.value = text
    toast({ title: 'Pasted', description: 'Content pasted from clipboard', type: 'success' })
  } catch {
    if (!checkSecureContext('Clipboard read')) {
      return
    }
    toast({ title: 'Error', description: 'Could not read from clipboard. Ensure permissions are granted.', type: 'error' })
  }
}

// Shortcuts
onMounted(() => {
  keyboard.pushContext('tools.hash')
  keyboard.attachAllForContext('tools.hash', {
    'Escape': clear
  })
})

onUnmounted(() => {
  keyboard.popContext('tools.hash')
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
