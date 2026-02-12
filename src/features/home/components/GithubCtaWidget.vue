
<template>
  <a
    href="https://github.com/Whitestar14/mathlly"
    target="_blank"
    rel="noopener noreferrer"
    class="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
  >
    <!-- Background Decor -->
    <div class="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-foreground/5 blur-3xl transition-opacity group-hover:opacity-100"></div>
    
    <div class="relative z-10 flex items-start justify-between">
      <div>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <GithubIcon class="h-5 w-5" />
          </div>
          <span class="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Open Source
          </span>
        </div>
        <h3 class="text-xl font-bold tracking-tight text-foreground">
          Star on GitHub
        </h3>
        <p class="mt-1 max-w-[250px] text-sm text-muted-foreground">
          Support development and follow the roadmap.
        </p>
      </div>

      <div class="rounded-full border border-border bg-background p-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:border-primary/50">
        <ArrowUpRightIcon class="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      </div>
    </div>

    <!-- Faux Stats / Footer -->
    <div class="relative z-10 mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
      <div class="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
        <GitForkIcon class="h-3.5 w-3.5" />
        <span>Fork</span>
      </div>
      <div class="flex items-center gap-1.5 transition-colors group-hover:text-yellow-500">
        <StarIcon class="h-3.5 w-3.5" />
        <span>Star</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { GithubIcon, ArrowUpRightIcon, StarIcon, GitForkIcon } from 'lucide-vue-next'
</script>
