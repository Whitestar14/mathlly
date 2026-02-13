
<template>
  <div class="h-full bg-card border border-border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
    
    <!-- Decor -->
    <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>

    <div class="z-10">
      <div class="flex items-center gap-3 mb-3">
        <div class="p-2 size-12 bg-background border border-border rounded-lg shadow-sm">
             <PrismLogo class="size-6 text-primary" />
        </div>
        <div>
            <h3 class="font-bold text-foreground">Prism</h3>
            <p class="text-xs text-muted-foreground">Clarity at Speed</p>
        </div>
      </div>
      
      <p class="text-xs text-muted-foreground leading-relaxed">
          Open source developer utility belt built for precision and performance.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 z-10 mt-4">
        <a href="https://github.com/Whitestar14/mathlly" target="_blank" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
            <Github class="size-3.5" />
            <span>GitHub</span>
        </a>
        <a href="https://github.com/Whitestar14/mathlly/blob/main/LICENSE" target="_blank" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
            <Scale class="size-3.5" />
            <span>License</span>
        </a>
    </div>

  </div>
</template>

<script setup lang="ts">
import { PrismLogo } from '@components/ui'
import { Github, Scale } from 'lucide-vue-next'
</script>
