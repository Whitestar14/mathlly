<template>
  <BaseModal
    id="about-modal"
    :open="modelValue"
    size="md"
    :naked="true"
    :hide-close-button="true"
    @update:open="$emit('update:modelValue', $event)">

    <div class="relative overflow-hidden bg-card text-card-foreground rounded-xl">
      <!-- Background Effects -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      <!-- Close Button -->
      <button
        class="absolute top-3 right-3 p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors z-20"
        @click="$emit('update:modelValue', false)">
        <X class="size-4" />
      </button>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center text-center p-8 pb-6">

        <!-- Logo -->
        <div class="size-16 mb-6 relative">
          <PrismLogo class="p-2 text-secondary-foreground" />
        </div>

        <h2 class="text-2xl font-bold tracking-tight mb-2">Prism</h2>
        <div class="flex items-center gap-2 mb-6">
          <BaseBadge variant="secondary" :text="`v${version}`" class="font-mono" />
          <span class="text-xs text-muted-foreground">•</span>
          <span class="text-xs text-muted-foreground">MIT License</span>
        </div>

        <p class="text-sm text-muted-foreground leading-relaxed max-w-xs mb-8">
          A developer's utility belt built for precision, performance, and clarity. Open source and community driven.
        </p>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-3 w-full mb-8">
          <a
            href="https://github.com/Whitestar14/mathlly"
            target="_blank"
            class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all group">
            <Github class="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span class="text-xs font-medium">GitHub</span>
          </a>
          <a
            href="https://github.com/Whitestar14/mathlly/blob/main/LICENSE"
            target="_blank"
            class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all group">
            <Scale class="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span class="text-xs font-medium">License</span>
          </a>
        </div>

        <!-- Tech Stack / Footer -->
        <div class="w-full pt-6 border-t border-border/50">
          <p class="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Powered By</p>
          <div class="flex justify-center gap-4 text-muted-foreground">
            <span class="text-xs hover:text-primary transition-colors cursor-default">Vue 3</span>
            <span class="text-xs hover:text-primary transition-colors cursor-default">TypeScript</span>
            <span class="text-xs hover:text-primary transition-colors cursor-default">Vite</span>
            <span class="text-xs hover:text-primary transition-colors cursor-default">Tailwind</span>
          </div>
        </div>

      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { X, Github, Scale } from 'lucide-vue-next'
import { BaseModal, BaseBadge, PrismLogo } from '@components/ui'
import { useVersionStore } from '@stores/version'

defineProps<{
  modelValue: boolean
}>()

defineEmits(['update:modelValue'])

const versionStore = useVersionStore()
const version = versionStore.versionInfo.full
</script>
