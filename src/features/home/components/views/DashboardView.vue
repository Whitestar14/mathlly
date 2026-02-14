<template>
  <div class="flex flex-col min-h-screen md:h-[calc(100vh-theme(spacing.16))] bg-background p-4 md:p-6 gap-6 md:overflow-hidden relative group/dashboard">

    <!-- Atmosphere -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div class="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.07]"></div>
      <div class="absolute inset-0 opacity-[0.1] dark:opacity-[0.15] blur-[80px]" style="background: conic-gradient(from 0deg at 50% 30%, oklch(var(--color-primary)/0), oklch(var(--color-primary)/0.1) 40%, oklch(var(--color-accent)/0.1) 60%, oklch(var(--color-primary)/0));"></div>
    </div>

    <!-- Header (Fade In) -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 relative z-10 animate-fade-in">
      <div class="flex flex-col gap-1 w-full md:w-auto">
        <!-- Mobile Back Link -->
        <button class="text-xs text-primary hover:underline font-medium flex md:hidden items-center gap-1 mb-1 pl-1" @click="$emit('switch-layout')">
          <ArrowLeft class="size-3" /> Classic View
        </button>

        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div class="size-10 md:size-12 p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm">
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
      <div class="md:col-span-2 md:row-span-2 min-h-[340px] md:min-h-[auto] h-auto slide-enter flex flex-col" style="--delay: 0ms">
        <SmartResumeWidget />
      </div>

      <!-- 2. Changelog -->
      <div class="md:col-span-1 md:row-span-2 min-h-[280px] md:min-h-[auto] h-auto slide-enter" style="--delay: 100ms">
        <Suspense>
          <ChangelogWidget />
          <template #fallback><WidgetSkeleton /></template>
        </Suspense>
      </div>

      <!-- 3. Tools Library -->
      <div class="md:col-span-1 md:row-span-3 h-[500px] md:h-full slide-enter" style="--delay: 200ms">
        <Suspense>
          <ToolsWidget />
          <template #fallback><WidgetSkeleton /></template>
        </Suspense>
      </div>

      <!-- 4. GitHub -->
      <div class="md:col-span-2 md:row-span-1 min-h-[140px] md:min-h-[auto] h-auto slide-enter" style="--delay: 300ms">
        <Suspense>
          <GithubCtaWidget />
          <template #fallback><WidgetSkeleton /></template>
        </Suspense>
      </div>

      <!-- 5. About -->
      <div class="md:col-span-1 md:row-span-1 min-h-[140px] md:min-h-[auto] h-auto slide-enter" style="--delay: 400ms">
        <Suspense>
          <AboutWidget />
          <template #fallback><WidgetSkeleton /></template>
        </Suspense>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, h } from 'vue'
import { PrismLogo } from '@components/ui'
import { ArrowLeft } from 'lucide-vue-next'
import SmartResumeWidget from '../../components/SmartResumeWidget.vue'

defineEmits(['switch-layout'])

const ToolsWidget = defineAsyncComponent(() => import('../../components/ToolsWidget.vue'))
const SystemStatus = defineAsyncComponent(() => import('../../components/SystemStatus.vue'))
const GithubCtaWidget = defineAsyncComponent(() => import('../../components/GithubCtaWidget.vue'))
const ChangelogWidget = defineAsyncComponent(() => import('../../components/ChangelogWidget.vue'))
const AboutWidget = defineAsyncComponent(() => import('../../components/AboutWidget.vue'))

const WidgetSkeleton = {
  render: () => h('div', { class: 'h-full w-full bg-muted/5 animate-pulse rounded-2xl border border-border/50' })
}
</script>

<style scoped>
/*
  Entrance Animations
  Once the component mounts (after Suspense in parent resolves),
  these keyframes play immediately.
*/

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.slide-enter {
  opacity: 0;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
