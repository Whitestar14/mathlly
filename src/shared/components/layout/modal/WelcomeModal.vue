<template>
  <BaseModal
    :open="modelValue"
    id="welcome-modal"
    size="md"
    :hide-close-button="true"
    :close-on-click-outside="false"
    :close-on-escape="true"
    @update:open="$emit('update:modelValue', $event)">

    <template #title>
      <div class="flex items-center gap-3">
        <div class="flex size-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Sparkles class="size-4 text-primary" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">
            Welcome to Prism
          </h2>
          <p class="text-sm text-muted-foreground">
            Your all-in-one dev toolkit (Beta)
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">

      <p class="text-muted-foreground leading-relaxed">
        Prism is a growing suite of tools built for
        developers and power users. From quick math to encoding, color picking,
        regex testing, and format conversion, Prism helps you move faster with
        everyday tasks.
      </p>

      <div class="flex items-start gap-3 p-4 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent/30 mb-6">
        <AlertTriangle class="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="text-sm font-semibold text-accent">
            Beta Software Notice
          </h3>
          <p class="text-sm text-accent/80 mt-1">
            Prism is currently in beta and data structure may change frequently as we improve the app (sorry!).
            therefore settings and history might be lost during updates. We recommend exporting important data regularly.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Calculator class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Calculator</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Code class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Base64</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Palette class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Color Tools</span>
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

      <div class="text-center p-4 rounded-lg border border-border/50">
        <p class="text-sm text-muted-foreground mb-3">
          Have ideas or found a bug?
        </p>
        <a
          href="https://github.com/Whitestar14/Prism/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80  hover:underline underline-offset-4 bg-transparent transition-colors">
          <Github class="h-4 w-4" /> Contribute on GitHub
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-row items-center justify-between w-full">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="dontShowAgain"
            type="checkbox"
            class="h-4 w-4 rounded border-border accent-checkbox focus:ring-2 focus:ring-primary/20 bg-background" />
          <span class="text-sm text-muted-foreground">Don't show again</span>
        </label>
        <BaseButton
          variant="primary"
          @click="handleGetStarted">
          Explore Tools
          <ArrowRight class="h-4 w-4" />
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStorageStore } from '@stores/appStorage'
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
  AlertTriangle
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

const storageStore = useAppStorageStore()

const welcomeShown = computed({
  get: () => storageStore.get('onboarding', 'welcomeShown', false),
  set: (value: boolean) => storageStore.set('onboarding', 'welcomeShown', value)
})
const dontShowAgain = ref(false)

const handleGetStarted = (): void => {
  if (dontShowAgain.value) {
    welcomeShown.value = true
  }
  emit('update:modelValue', false)
}
</script>

<style scoped>
.accent-checkbox {
  accent-color: oklch(var(--color-accent));
}
</style>
