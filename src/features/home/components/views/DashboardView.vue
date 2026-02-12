
<template>
  <div class="flex flex-col min-h-[calc(100vh-theme(spacing.14))] md:h-screen bg-background overflow-y-auto overflow-x-hidden md:overflow-hidden p-4 md:p-6">
    <!-- Header Area -->
    <div class="flex justify-between items-end mb-4 relative z-10">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-xl border border-primary/20">
             <PrismLogo class="h-8 w-auto text-primary" />
          </div>
          <span class="font-mono tracking-tighter">Prism</span>
        </h1>
        <div class="flex items-center gap-4">
             <p class="text-sm text-muted-foreground hidden md:block">
                Developer utility belt. Precision at speed.
            </p>
            <button 
                @click="$emit('switch-layout')"
                class="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
                <ArrowLeft class="size-3" /> Classic View
            </button>
        </div>
      </div>
      <SystemStatus />
    </div>

    <!-- Beta Feedback Notice -->
    <div v-if="showBetaBanner" class="mb-4 relative z-10">
       <div class="bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
             <div class="p-1 bg-purple-500/10 rounded">
                <AlertTriangle class="size-3.5 text-purple-500" />
             </div>
             <p class="text-xs text-muted-foreground"><span class="font-medium text-purple-600 dark:text-purple-400">Beta Dashboard:</span> This layout is experimental. It may be removed or changed significantly.</p>
          </div>
          <div class="flex items-center gap-2">
            <RouterLink to="/feedback" class="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline whitespace-nowrap px-2">
               Provide Feedback
            </RouterLink>
             <button 
               class="text-muted-foreground hover:text-foreground transition-colors p-1"
               @click="showBetaBanner = false"
               aria-label="Dismiss banner"
             >
               <X class="size-3.5" />
             </button>
          </div>
       </div>
    </div>

    <!-- Bento Grid (4 Columns, 3 Rows) -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto_auto_1fr] md:grid-rows-3 gap-4 min-h-0 relative z-10">
      
      <!-- 1. Smart Resume (2x2) -->
      <!-- Top-Left Main Feature -->
      <div class="md:col-span-2 md:row-span-2 min-h-[220px]">
        <Suspense>
          <SmartResumeWidget />
          <template #fallback><div class="h-full w-full bg-muted/10 animate-pulse rounded-2xl border border-border"></div></template>
        </Suspense>
      </div>

      <!-- 2. Changelog (1x2) -->
      <!-- Middle Column - Replaces Quick Math/Color -->
      <div class="md:col-span-1 md:row-span-2 min-h-[220px]">
         <Suspense>
            <ChangelogWidget />
            <template #fallback><div class="h-full w-full bg-muted/10 animate-pulse rounded-2xl border border-border"></div></template>
         </Suspense>
      </div>

      <!-- 3. Tools Launcher (1x3) -->
      <!-- Far Right Vertical - Expanded -->
      <div class="md:col-span-1 md:row-span-3 row-span-1 min-h-[300px] md:min-h-0">
        <Suspense>
           <ToolsWidget />
           <template #fallback><div class="h-full w-full bg-muted/10 animate-pulse rounded-2xl border border-border"></div></template>
        </Suspense>
      </div>

      <!-- 4. GitHub CTA (2x1) -->
      <!-- Bottom-Left Wide -->
      <div class="md:col-span-2 md:row-span-1 min-h-[140px]">
         <Suspense>
            <GithubCtaWidget />
            <template #fallback><div class="h-full w-full bg-muted/10 animate-pulse rounded-2xl border border-border"></div></template>
         </Suspense>
      </div>

       <!-- 5. About (1x1) -->
      <!-- Bottom-Middle -->
      <div class="md:col-span-1 md:row-span-1 min-h-[140px]">
         <Suspense>
            <AboutWidget />
            <template #fallback><div class="h-full w-full bg-muted/10 animate-pulse rounded-2xl border border-border"></div></template>
         </Suspense>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { PrismLogo } from '@components/ui'
import { ArrowLeft, AlertTriangle, X } from 'lucide-vue-next'

defineEmits(['switch-layout'])

const showBetaBanner = ref(true)

// Widgets
const SmartResumeWidget = defineAsyncComponent(() => import('../../components/SmartResumeWidget.vue'))
const ToolsWidget = defineAsyncComponent(() => import('../../components/ToolsWidget.vue'))
const SystemStatus = defineAsyncComponent(() => import('../../components/SystemStatus.vue'))
const GithubCtaWidget = defineAsyncComponent(() => import('../../components/GithubCtaWidget.vue'))
const ChangelogWidget = defineAsyncComponent(() => import('../../components/ChangelogWidget.vue'))
const AboutWidget = defineAsyncComponent(() => import('../../components/AboutWidget.vue'))
</script>
