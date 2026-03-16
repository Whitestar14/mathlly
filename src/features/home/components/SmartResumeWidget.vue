<template>
  <RouterLink
    :to="hasHistory ? (lastPath || '/calculator') : '/calculator'"
    class="flex flex-col flex-1 h-full w-full group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 p-5 md:p-8">
    <!-- Backgrounds -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100"></div>
    <div v-if="resumeContext.type === 'color' && resumeContext.colorData" class="absolute right-0 top-0 w-80 h-80 blur-[100px] opacity-20 rounded-full translate-x-1/3 -translate-y-1/3 transition-transform duration-700 group-hover:scale-125 pointer-events-none" :style="{ backgroundColor: `rgb(${resumeContext.colorData.r}, ${resumeContext.colorData.g}, ${resumeContext.colorData.b})` }"></div>

    <div class="relative h-full flex-1 flex flex-col justify-between z-10 gap-6">

      <!-- Top Section -->
      <div class="flex items-center gap-4">
        <div class="relative p-3 rounded-lg bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/30 text-primary shrink-0">
          <component :is="resumeContext.icon" class="size-6 md:size-7" />
        </div>

        <div class="flex flex-col">
          <!-- STATE: RESUME (History Exists) -->
          <div v-if="resumeContext.type !== 'new'">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Resume Session</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2 shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span class="text-xs font-medium text-foreground/70">{{ timeDisplay }}</span>
            </div>
          </div>

          <!-- STATE: NEW USER -->
          <div v-else>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">Welcome</span>
            </div>
            <span class="text-xs font-medium text-foreground/70">Ready to start?</span>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
        <div class="space-y-2 max-w-lg">
          <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {{ resumeContext.label }}
          </h3>
          <p class="text-sm font-mono text-muted-foreground border-l-2 border-primary/20 pl-3 py-1 line-clamp-2 sm:line-clamp-1">
            {{ resumeContext.detail }}
          </p>
        </div>

        <div class="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-full bg-background border border-border text-sm font-medium text-foreground group-hover:border-primary/50 group-hover:text-primary transition-all shadow-sm w-full sm:w-auto shrink-0">
          <span>{{ resumeContext.type !== 'new' ? 'Continue' : 'Get Started' }}</span>
          <ArrowRight class="size-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useTimeAgo } from '@vueuse/core'
import { useDashboardData } from '../composables/useDashboardData'
import { ArrowRight } from 'lucide-vue-next'

const { lastPath, resumeContext, lastActiveTime, hasHistory } = useDashboardData()

const relativeTime = useTimeAgo(computed(() => lastActiveTime.value ?? new Date()))

const timeDisplay = computed(() => {
  if (!lastActiveTime.value) return 'Moments ago'

  return relativeTime.value
})
</script>
