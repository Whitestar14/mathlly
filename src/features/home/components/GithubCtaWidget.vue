<template>
  <a
    href="https://github.com/Whitestar14/mathlly"
    target="_blank"
    rel="noopener noreferrer"
    class="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
    <!-- Theme Glow -->
    <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>

    <div class="relative z-10 flex justify-between items-start">
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-2.5 py-1 backdrop-blur-sm">
          <GithubIcon class="h-3.5 w-3.5 text-foreground" />
          <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Open Source</span>
        </div>

        <div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">
            Star on GitHub
          </h3>
          <p class="mt-1 text-xs text-muted-foreground">
            Support development and check out roadmap.
          </p>
        </div>
      </div>

      <!-- Arrow Only Visible on Hover -->
      <div class="rounded-full border border-border bg-background p-2 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:border-primary/50 text-primary">
        <ArrowUpRightIcon class="h-5 w-5" />
      </div>
    </div>

    <!-- Stats Footer -->
    <div class="relative z-10 mt-4 pt-4 border-t border-border/40 flex items-center gap-4 text-xs font-medium text-muted-foreground">
      <div class="flex items-center gap-1.5 group/stat">
        <GitForkIcon class="h-3.5 w-3.5 group-hover/stat:text-foreground transition-colors" />
        <span>Fork</span>
      </div>
      <div class="flex items-center gap-1.5 group/stat">
        <StarIcon class="h-3.5 w-3.5 group-hover/stat:text-primary group-hover/stat:fill-primary/20 transition-colors" />
        <span>Star</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { GithubIcon, ArrowUpRightIcon, StarIcon, GitForkIcon } from 'lucide-vue-next'
</script>