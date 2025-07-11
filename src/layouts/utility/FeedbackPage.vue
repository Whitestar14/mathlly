<template>
  <BasePage title="Feedback">
    <div class="space-y-8 max-w-4xl mx-auto">
      <section class="space-y-6">
        <h2 class="text-lg font-medium tracking-tight text-foreground dark:text-foreground">
          Submit Feedback
        </h2>
        <div class="bg-background dark:bg-background rounded-lg border border-border dark:border-border p-6 space-y-6">
          <div class="flex flex-col gap-2 justify-between space-y-2 sm:flex-row sm:items-center group">
            <div>
              <h3 class="text-sm font-medium text-foreground dark:text-foreground">
                Report an Issue
              </h3>
              <p class="text-sm text-muted-foreground dark:text-muted-foreground">
                Found a bug? Create an issue on GitHub
              </p>
            </div>
            <a
              href="https://github.com/Whitestar14/mathlly-app/issues/new?template=bug_report.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="primary"
                class="w-full sm:w-auto"
              >
                Report Bug
              </Button>
            </a>
          </div>

          <div class="border-t border-border dark:border-border pt-6">
            <div class="flex flex-col gap-2 justify-between space-y-2 sm:flex-row sm:items-center group">
              <div>
                <h3 class="text-sm font-medium text-foreground dark:text-foreground">
                  Feature Request
                </h3>
                <p class="text-sm text-muted-foreground dark:text-muted-foreground">
                  Have an idea? Share it with us
                </p>
              </div>
              <a
                href="https://github.com/Whitestar14/mathlly-app/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="primary"
                  class="w-full sm:w-auto"
                >
                  Request Feature
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <h2 class="text-lg font-medium tracking-tight text-foreground dark:text-foreground">
          Submission Guidelines
        </h2>
        <div class="bg-background dark:bg-background rounded-lg border border-border dark:border-border p-6">
          <ul class="space-y-4">
            <li
              v-for="(guideline, index) in [
                'Be specific about the issue or feature request',
                'Include steps to reproduce if reporting a bug',
                'Provide screenshots or code examples if applicable',
                'Check if a similar issue already exists'
              ]"
              :key="index"
              class="flex items-start group"
            >
              <CheckCircleIcon class="h-4 w-4 text-primary dark:text-primary mt-1 mr-3 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" />
              <span class="text-sm text-muted-foreground dark:text-muted-foreground">{{ guideline }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from 'lucide-vue-next';
import BasePage from "@/components/base/BasePage.vue";
import Button from "@/components/base/BaseButton.vue";
</script>

