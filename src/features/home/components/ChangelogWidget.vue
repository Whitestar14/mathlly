
<template>
  <div class="h-full bg-card border border-border rounded-2xl p-5 flex flex-col relative overflow-hidden group">
    
    <div class="flex justify-between items-center mb-4 z-10">
      <div class="flex items-center gap-2">
        <Sparkles class="size-4 text-primary" />
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">What's New</span>
      </div>
      <BaseBadge variant="custom" :text="latestVersion" size="sm" />
    </div>

    <div class="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar z-10 space-y-4">
      <div v-for="update in recentUpdates" :key="update.version" class="space-y-2">
        <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-medium text-foreground">v{{ update.version }}</span>
            <span class="text-[10px] text-muted-foreground">{{ update.date }}</span>
        </div>
        <ul class="space-y-1.5">
            <li v-for="(feat, idx) in update.features.slice(0, 3)" :key="idx" class="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span class="text-primary mt-0.5">•</span>
                <span>{{ feat }}</span>
            </li>
            <li v-if="update.features.length > 3" class="text-[10px] text-muted-foreground italic pl-3">
                + {{ update.features.length - 3 }} more...
            </li>
        </ul>
        <div class="h-px w-full bg-border/50 my-2 last:hidden"></div>
      </div>
    </div>

    <!-- Gradient Fade -->
    <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none z-0"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { BaseBadge } from '@components/ui'
import { updates } from '@services/storage/changelog.json'

const recentUpdates = computed(() => updates.slice(0, 1))
const latestVersion = computed(() => updates[0]?.version || '0.0.0')
</script>
