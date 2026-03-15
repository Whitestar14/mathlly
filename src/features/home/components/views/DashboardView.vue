
<template>
  <div class="flex flex-col min-h-screen md:h-[calc(100vh-theme(spacing.16))] bg-background p-4 md:p-6 gap-6 md:overflow-hidden relative group/dashboard layout-contained">

    <!-- Atmosphere - Isolated Layer for performance -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden select-none gpu-accelerated">
      <div class="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.07]"></div>
      <div class="absolute inset-0 opacity-[0.1] dark:opacity-[0.15] blur-[80px] dashboard-gradient"></div>
    </div>

    <!-- Header (Fade In) -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 relative z-10 animate-fade-in">
      <div class="flex flex-col gap-1 w-full md:w-auto">
        <!-- Mobile Back Link -->
        <button class="text-xs text-primary hover:underline font-medium flex md:hidden items-center gap-1 mb-1 pl-1" @click="$emit('switch-layout')">
          <ArrowLeft class="size-3" /> Classic View
        </button>

        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div class="size-10 md:size-12 p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm">
            <PrismLogo class="text-primary w-full h-full" />
          </div>
          <span class="tracking-tight">Dashboard</span>
        </h1>

        <div class="flex items-center gap-4 pl-1">
          <p class="text-sm text-muted-foreground hidden md:block">Developer utility belt. Precision at speed.</p>
          <!-- Desktop Back Link -->
          <button class="text-xs text-primary hover:underline font-medium hidden md:flex items-center gap-1" @click="$emit('switch-layout')">
            <ArrowLeft class="size-3" /> Classic View
          </button>
        </div>
      </div>
      <div class="hidden sm:block"><SystemStatus /></div>
    </div>

    <!-- Grid Layout (Staggered Entrance) -->
    <div class="flex-1 flex flex-col md:grid md:grid-cols-4 md:grid-rows-3 gap-4 min-h-0 relative z-10 pb-8 md:pb-0">

      <!-- 1. Smart Resume -->
      <div class="md:col-span-2 md:row-span-2 min-h-[340px] md:min-h-[auto] h-auto animate-slide-up flex flex-col" style="--delay: 0ms">
        <SmartResumeWidget />
      </div>

      <!-- 2. Changelog -->
      <div class="md:col-span-1 md:row-span-2 min-h-[280px] md:min-h-[auto] h-auto animate-slide-up" style="--delay: 100ms">
        <Suspense>
          <ChangelogWidget />
          <template #fallback>
            <div class="h-full w-full bg-card/50 border border-border rounded-lg p-5 flex flex-col gap-4 animate-pulse">
               <div class="flex justify-between items-center border-b border-border/50 pb-3">
                  <div class="h-4 w-20 bg-muted rounded"></div>
                  <div class="h-6 w-16 bg-muted rounded"></div>
               </div>
               <div class="space-y-3">
                  <div class="h-24 w-full bg-muted/30 rounded-lg"></div>
                  <div class="h-24 w-full bg-muted/30 rounded-lg"></div>
                  <div class="h-24 w-full bg-muted/30 rounded-lg"></div>
               </div>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- 3. Tools Library -->
      <div class="md:col-span-1 md:row-span-3 h-[500px] md:h-full animate-slide-up" style="--delay: 200ms">
        <Suspense>
          <ToolsWidget />
          <template #fallback>
             <div class="h-full w-full bg-card/50 border border-border rounded-lg p-3 flex flex-col gap-3 animate-pulse">
                <div class="h-9 w-full bg-muted/40 rounded-md"></div>
                <div class="space-y-4 pt-2">
                   <div class="grid grid-cols-2 gap-2">
                      <div class="h-20 bg-muted/20 rounded-lg"></div>
                      <div class="h-20 bg-muted/20 rounded-lg"></div>
                      <div class="h-20 bg-muted/20 rounded-lg"></div>
                      <div class="h-20 bg-muted/20 rounded-lg"></div>
                   </div>
                   <div class="h-4 w-24 bg-muted/30 rounded mb-2"></div>
                   <div class="grid grid-cols-2 gap-2">
                      <div class="h-20 bg-muted/20 rounded-lg"></div>
                      <div class="h-20 bg-muted/20 rounded-lg"></div>
                   </div>
                </div>
             </div>
          </template>
        </Suspense>
      </div>

      <!-- 4. GitHub -->
      <div class="md:col-span-2 md:row-span-1 min-h-[140px] md:min-h-[auto] h-auto animate-slide-up" style="--delay: 300ms">
        <Suspense>
          <GithubCtaWidget />
          <template #fallback>
             <div class="h-full w-full bg-card/50 border border-border rounded-lg p-6 flex flex-col justify-between animate-pulse">
                <div class="space-y-3">
                   <div class="h-5 w-24 bg-muted/50 rounded-full"></div>
                   <div class="h-6 w-48 bg-muted/40 rounded"></div>
                   <div class="h-3 w-32 bg-muted/30 rounded"></div>
                </div>
                <div class="h-px w-full bg-border/50"></div>
                <div class="flex gap-4">
                   <div class="h-4 w-12 bg-muted/30 rounded"></div>
                   <div class="h-4 w-12 bg-muted/30 rounded"></div>
                </div>
             </div>
          </template>
        </Suspense>
      </div>

      <!-- 5. About -->
      <div class="md:col-span-1 md:row-span-1 min-h-[140px] md:min-h-[auto] h-auto animate-slide-up" style="--delay: 400ms">
        <Suspense>
          <AboutWidget />
          <template #fallback>
             <div class="h-full w-full bg-card/50 border border-border rounded-lg p-5 flex flex-col justify-between animate-pulse">
                <div class="flex items-center gap-3">
                   <div class="size-12 rounded-lg bg-muted/40"></div>
                   <div class="space-y-2">
                      <div class="h-4 w-20 bg-muted/40 rounded"></div>
                      <div class="h-3 w-16 bg-muted/30 rounded"></div>
                   </div>
                </div>
                <div class="h-3 w-24 bg-muted/20 rounded self-end"></div>
             </div>
          </template>
        </Suspense>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { PrismLogo } from '@components/ui'
import { ArrowLeft } from 'lucide-vue-next'
import SmartResumeWidget from '../../components/SmartResumeWidget.vue'

defineEmits(['switch-layout'])

const ToolsWidget = defineAsyncComponent(() => import('../../components/ToolsWidget.vue'))
const SystemStatus = defineAsyncComponent(() => import('../../components/SystemStatus.vue'))
const GithubCtaWidget = defineAsyncComponent(() => import('../../components/GithubCtaWidget.vue'))
const ChangelogWidget = defineAsyncComponent(() => import('../../components/ChangelogWidget.vue'))
const AboutWidget = defineAsyncComponent(() => import('../../components/AboutWidget.vue'))
</script>
