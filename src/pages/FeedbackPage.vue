<template>
  <BasePage
    title="Feedback"
    :breadcrumbs="[{ label: 'Home', path: '/' }, { label: 'Feedback' }]"
    main-class="flex flex-col items-center py-12 px-4">
    <div class="w-full max-w-3xl space-y-10">

      <!-- Header Section -->
      <div class="text-center space-y-3">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          Help us improve
        </h1>
        <p class="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
          Your feedback shapes the future of Prism. Let us know if you found a bug or have an idea for a new feature.
        </p>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://github.com/Whitestar14/mathlly/issues/new?template=bug_report.md"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div class="size-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Bug class="size-6" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2">Report a Bug</h3>
          <p class="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
            Found something broken? Help us fix it by providing a detailed bug report.
          </p>
          <div class="flex items-center text-xs font-medium text-primary mt-auto group-hover:translate-x-1 transition-transform">
            Open GitHub Issue <ArrowUpRight class="ml-1 size-3" />
          </div>
        </a>

        <a
          href="https://github.com/Whitestar14/mathlly-app/issues/new?template=feature_request.md"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div class="size-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Lightbulb class="size-6" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2">Request Feature</h3>
          <p class="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
            Have an idea for a new tool or improvement? We'd love to hear your suggestions.
          </p>
          <div class="flex items-center text-xs font-medium text-primary mt-auto group-hover:translate-x-1 transition-transform">
            Submit Request <ArrowUpRight class="ml-1 size-3" />
          </div>
        </a>
      </div>

      <!-- Guidelines -->
      <div class="bg-muted/30 border border-border/50 rounded-xl p-6">
        <h4 class="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <Info class="size-4 text-muted-foreground" />
          Submission Guidelines
        </h4>
        <div class="grid gap-3">
          <div v-for="(tip, i) in guidelines" :key="i" class="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 class="size-4 text-primary shrink-0 mt-0.5" />
            <span>{{ tip }}</span>
          </div>
        </div>
      </div>

    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { Bug, Lightbulb, ArrowUpRight, Info, CheckCircle2 } from 'lucide-vue-next'
import { BasePage } from '@components/ui'

const guidelines = [
  'Be specific: clearly describe the issue or the feature you envision.',
  'Reproducibility: if reporting a bug, include steps to reproduce it.',
  'Context: screenshots or code snippets are extremely helpful.',
  'Search first: check if a similar issue has already been reported.'
]
</script>
