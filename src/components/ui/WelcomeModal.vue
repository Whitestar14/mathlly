<template>
  <BaseModal 
    :open="modelValue"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #title>
      Welcome to Mathlly Beta
    </template>

    <div class="space-y-6">
      <p class="text-sm text-muted-foreground dark:text-muted-foreground">
        You're among the first to try out Mathlly, our experimental calculator
        app designed for modern computing needs.
      </p>

      <div class="space-y-3">
        <h4 class="text-sm font-medium text-foreground dark:text-foreground">
          What you should know:
        </h4>
        <ul class="text-sm text-muted-foreground dark:text-muted-foreground space-y-2">
          <li
            v-for="(feature, index) in features"
            :key="index"
            class="flex items-start"
          >
            <span class="text-primary mr-2">•</span>
            {{ feature }}
          </li>
        </ul>
      </div>

      <div class="bg-muted dark:bg-muted/50 rounded-lg p-4">
        <p class="text-sm text-muted-foreground dark:text-muted-foreground">
          Found a bug or have a suggestion?
          <a
            href="https://github.com/Whitestar14/mathlly-app/issues"
            target="_blank"
            class="text-primary dark:text-primary hover:text-primary dark:hover:text-indigo-300"
          >
            Open an issue on GitHub
          </a>
        </p>
      </div>

      <div class="flex justify-between items-center pt-2">
        <label class="flex items-center space-x-2">
          <input
            v-model="dontShowAgain"
            type="checkbox"
            class="rounded border-border text-primary shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-border dark:bg-muted"
          >
          <span class="text-sm text-muted-foreground dark:text-muted-foreground">Don't show again</span>
        </label>

        <button
          type="button"
          class="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-foreground hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors duration-200"
          @click="handleClose"
        >
          Get Started
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const features = [
  "This is a beta version and some features might be experimental",
  "Calculations are processed locally for your security",
  "Your feedback is invaluable in shaping Mathlly's future",
];

const dontShowAgain = ref(false);

const handleClose = () => {
  if (dontShowAgain.value) {
    localStorage.setItem("mathlly-welcome-shown", "true");
  }
  emit('update:modelValue', false);
};
</script>
