<template>
  <BaseModal 
    :open="modelValue"
    size="md"
    :close-on-click-outside="false"
    :close-on-escape="true"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">
            Welcome to Mathlly
          </h2>
          <p class="text-sm text-muted-foreground">
            Modern calculator platform
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Quick intro -->
      <p class="text-muted-foreground leading-relaxed">
        Thanks for trying Mathlly! This is a modern calculator with powerful features, 
        beautiful design, and privacy-first approach.
      </p>

      <!-- Key features -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Zap class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Fast & Local</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Shield class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Privacy First</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Heart class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Open Source</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Sparkles class="h-4 w-4 text-primary flex-shrink-0" />
          <span class="text-sm font-medium text-foreground">Modern UI</span>
        </div>
      </div>

      <!-- Feedback link -->
      <div class="text-center p-4 rounded-lg border border-border/50">
        <p class="text-sm text-muted-foreground mb-3">
          Found a bug or have feedback?
        </p>
        <a
          href="https://github.com/Whitestar14/mathlly/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Github class="h-4 w-4" />
          Report on GitHub
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="dontShowAgain"
            type="checkbox"
            class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
          >
          <span class="text-sm text-muted-foreground">Don't show again</span>
        </label>

        <BaseButton
          variant="primary"
          @click="handleGetStarted"
        >
          Get Started
          <ArrowRight class="h-4 w-4 ml-1" />
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { 
  Sparkles, 
  ExternalLink, 
  Zap,
  Shield,
  ArrowRight,
  Heart,
  Github
} from "lucide-vue-next";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButton from "@/components/base/BaseButton.vue";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

// Use VueUse for better localStorage handling
const welcomeShown = useLocalStorage("mathlly-welcome-shown", false);
const dontShowAgain = ref(false);

const handleGetStarted = (): void => {
  if (dontShowAgain.value) {
    welcomeShown.value = true;
  }
  emit('update:modelValue', false);
};
</script>
