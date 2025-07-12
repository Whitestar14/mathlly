<template>
  <BaseModal 
    :open="modelValue"
    size="lg"
    :close-on-click-outside="false"
    :close-on-escape="true"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Welcome to Mathlly</h2>
          <p class="text-sm text-muted-foreground">Beta Release</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Introduction -->
      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <p class="text-sm text-foreground leading-relaxed">
          You're among the first to experience Mathlly, our modern calculator platform 
          designed for today's computing needs. Thank you for being an early adopter!
        </p>
      </div>

      <!-- Features Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Info class="h-4 w-4 text-primary" />
          <h3 class="text-sm font-medium text-foreground">
            What to expect
          </h3>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="flex items-start gap-3 rounded-md p-3 bg-card border border-border/50"
          >
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
              <component :is="feature.icon" class="h-3 w-3 text-primary" />
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium text-foreground">{{ feature.title }}</p>
              <p class="text-xs text-muted-foreground leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="rounded-lg border border-border bg-card p-4">
        <div class="flex items-start gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <MessageSquare class="h-4 w-4 text-accent-foreground" />
          </div>
          <div class="flex-1 space-y-2">
            <h4 class="text-sm font-medium text-foreground">Help us improve</h4>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Found a bug or have a suggestion? Your feedback shapes Mathlly's future.
            </p>
            <a
              href="https://github.com/Whitestar14/mathlly-app/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink class="h-3 w-3" />
              Open an issue on GitHub
            </a>
          </div>
        </div>
      </div>

    </div>

    <template #footer>
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer group">
          <div class="relative">
            <input
              v-model="dontShowAgain"
              type="checkbox"
              class="peer sr-only"
            >
            <div class="h-4 w-4 rounded border border-input bg-background transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
              <Check class="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity absolute inset-0.5" />
            </div>
          </div>
          <span class="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Don't show this again
          </span>
        </label>
      </div>

      <div class="flex items-center justify-end gap-3">
        <BaseButton
          variant="outline"
          @click="$emit('update:modelValue', false)"
        >
          Skip
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="handleGetStarted"
        >
          <Rocket class="h-4 w-4" />
          Get Started
        </BaseButton>
      </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import { 
  Sparkles, 
  Info, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  Rocket,
  Zap,
  Shield,
  Heart
} from "lucide-vue-next";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButton from "@/components/base/BaseButton.vue";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const features = [
  {
    icon: Zap,
    title: "Beta Experience",
    description: "You're testing cutting-edge features that may evolve based on your feedback."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All calculations are processed locally on your device for maximum security."
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "Your input directly influences new features and improvements."
  }
];

const dontShowAgain = ref(false);

const handleGetStarted = () => {
  if (dontShowAgain.value) {
    localStorage.setItem("mathlly-welcome-shown", "true");
  }
  emit('update:modelValue', false);
};
</script>

<style scoped>
/* Custom checkbox styling for better integration */
input[type="checkbox"]:checked + div {
  background-image: none;
}

/* Smooth transitions for interactive elements */
.group:hover .transition-colors {
  transition-duration: 150ms;
}

/* Enhanced focus states */
.group:focus-within .ring-offset-background {
  ring-offset-width: 2px;
}
</style>
