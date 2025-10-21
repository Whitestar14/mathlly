<template>
  <BaseModal
    :open="modelValue"
    size="md"
    :hide-close-button="true"
    :close-on-click-outside="false"
    :close-on-escape="true"
    @update:open="$emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <template #title>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Sparkles class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Welcome to Prism</h2>
          <p class="text-sm text-muted-foreground">
            Your all-in-one developer toolkit
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Intro -->
      <p class="text-muted-foreground leading-relaxed">
        Prism is a growing suite of tools built for
        developers and power users. From quick math to encoding, color picking,
        regex testing, and format conversion, Prism helps you move faster with
        everyday tasks.
      </p>

      <!-- Feature grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Calculator class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Math & Calculator</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Code class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Base64 & Encoding</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Palette class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Color Utilities</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Regex class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Regex Tester</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Repeat class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Converters</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Shield class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Privacy-First</span>
        </div>
      </div>

      <!-- Feedback -->
      <div class="text-center p-4 rounded-lg border border-border/50">
        <p class="text-sm text-muted-foreground mb-3">
          Have ideas or found a bug?
        </p>
        <a
          href="https://github.com/Whitestar14/Prism/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          <Github class="h-4 w-4" /> Contribute on GitHub
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex flex-row items-center justify-between w-full">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="dontShowAgain"
            type="checkbox"
            class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 bg-background"
          />
          <span class="text-sm text-muted-foreground">Don't show again</span>
        </label>
        <BaseButton variant="primary" @click="handleGetStarted">
          Explore Tools
          <ArrowRight class="h-4 w-4" />
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
  Sparkles,
  ExternalLink,
  Calculator,
  Code,
  Palette,
  Regex,
  Repeat,
  Shield,
  ArrowRight,
  Github,
} from 'lucide-vue-next'
import { BaseModal, BaseButton } from '@components/ui'

interface Props {
  modelValue: boolean
}
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}
defineProps<Props>()
const emit = defineEmits<Emits>()

const welcomeShown = useLocalStorage('prism-welcome-shown', false)
const dontShowAgain = ref(false)

const handleGetStarted = (): void => {
  if (dontShowAgain.value) {
    welcomeShown.value = true
  }
  emit('update:modelValue', false)
}
</script>
