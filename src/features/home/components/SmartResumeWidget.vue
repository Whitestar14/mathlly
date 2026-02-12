
<template>
  <RouterLink
    :to="lastPath || '/calculator'"
    class="block h-full w-full group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
  >
    <!-- Dynamic Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100"></div>
    <div class="absolute inset-0 pattern-dots opacity-[0.4] transition-opacity group-hover:opacity-20"></div>
    
    <!-- Color Context Background Glow -->
    <div 
      v-if="resumeContext.type === 'color' && resumeContext.colorData"
      class="absolute right-0 top-0 w-48 h-48 blur-3xl opacity-10 rounded-full translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-150"
      :style="{ backgroundColor: `rgb(${resumeContext.colorData.r}, ${resumeContext.colorData.g}, ${resumeContext.colorData.b})` }"
    ></div>

    <div class="relative h-full p-6 flex flex-col justify-between z-10">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border shadow-sm group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/20">
            <component :is="iconComponent" class="size-6 text-primary" />
          </div>
          <div class="flex flex-col">
             <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Session</span>
             <span class="text-xs text-primary/80 font-medium" v-if="resumeContext.type !== 'generic'">{{ timeAgo }}</span>
          </div>
        </div>
        
        <div class="h-8 w-8 flex items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
            <History class="size-4" />
        </div>
      </div>

      <div class="space-y-1">
        <h3 class="text-3xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
          {{ resumeContext.label }}
        </h3>
        <p class="text-sm font-mono text-muted-foreground/80 truncate max-w-[90%]">
          {{ resumeContext.detail }}
        </p>
      </div>

      <div class="absolute bottom-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75">
        <ArrowRight class="size-6 text-primary" />
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardData } from '../composables/useDashboardData'
import { 
  Calculator, 
  ArrowRightLeft, 
  Palette, 
  Sparkles, 
  History,
  ArrowRight
} from 'lucide-vue-next'

const { lastPath, resumeContext } = useDashboardData()

// Mock time for now, can be real later
const timeAgo = 'Just now'

const iconComponent = computed(() => {
  const map: Record<string, any> = {
    Calculator,
    ArrowRightLeft,
    Palette,
    Sparkles
  }
  return map[resumeContext.value.icon] || Sparkles
})
</script>
