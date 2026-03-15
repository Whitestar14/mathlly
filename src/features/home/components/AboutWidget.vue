<template>
  <div class="h-full prism-card flex flex-col relative group">
    <button
      class="h-full w-full bg-card border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group text-left hover:border-primary/50 transition-all duration-300 shadow-sm"
      @click="showModal = true">

      <!-- Decor -->
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>

      <div class="z-10 relative">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 size-12 shadow-sm flex items-center justify-center">
            <PrismLogo class="size-6 text-primary" />
          </div>
          <div>
            <h3 class="font-bold text-foreground">Prism</h3>
            <p class="text-xs text-muted-foreground">Clarity at Speed</p>
          </div>
        </div>

        <p class="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          Open source developer utility belt built for precision and performance.
        </p>
      </div>

      <div class="flex items-center gap-2 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
        <span>More Info</span>
        <ArrowRight class="size-3" />
      </div>

    </button>

    <Suspense>
      <AboutModal v-model="showModal" />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { PrismLogo } from '@components/ui'
import { ArrowRight } from 'lucide-vue-next'

const AboutModal = defineAsyncComponent(() => import('./AboutModal.vue'))
const showModal = ref(false)
</script>