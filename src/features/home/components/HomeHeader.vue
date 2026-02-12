
<template>
  <div class="relative overflow-hidden rounded-2xl bg-card border border-border p-8 mb-8 shadow-sm">
    <!-- Background Decor -->
    <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 -mb-16 -ml-16 w-40 h-40 bg-accent/10 rounded-full blur-2xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-wider">
          <Sparkles class="w-4 h-4" />
          <span>{{ greeting }}</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono">
          Ready to build?
        </h1>
        <p class="text-muted-foreground text-lg max-w-lg">
          Select a tool to get started or press <kbd class="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-sans border border-border">Ctrl + K</kbd> to search.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-1.5 rounded-xl border border-border/50 shadow-sm">
        <div class="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-muted-foreground">
          v{{ version }}
        </div>
        <div class="h-4 w-px bg-border"></div>
        <div class="flex items-center gap-2 px-2 text-xs font-medium text-foreground">
          <Clock class="w-3.5 h-3.5 text-primary" />
          {{ timeDisplay }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Sparkles, Clock } from 'lucide-vue-next'
import { useVersionStore } from '@stores/version'

const versionStore = useVersionStore()
const version = versionStore.versionInfo.full
const timeDisplay = ref('')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

let timer: number

onMounted(() => {
  const updateTime = () => {
    timeDisplay.value = new Date().toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }
  updateTime()
  timer = window.setInterval(updateTime, 1000 * 60)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
