<template>
  <div class="group relative bg-background rounded-lg border border-border p-6 hover:shadow-md transition-colors">
    <!-- Version Badge -->
    <div class="absolute -top-3 right-4">
      <BaseBadge
        variant="custom"
        :text="`v${version}`"
        :show-notch="true"
      />
    </div>
    
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-base font-mono font-medium tracking-tight flex items-center">
        <TagIcon class="h-4 w-4 mr-2 text-primary" />
        Release
      </h3>
      <span class="text-xs text-muted-foreground">{{ date }}</span>
    </div>
    
    <ul class="space-y-3">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-start group/item"
      >
        <CheckCircle2 class="h-4 w-4 text-green-500 mt-1 mr-3 shrink-0 opacity-75 group-hover/item:opacity-100 transition-opacity" />
        <span class="text-sm text-muted-foreground">{{ feature }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { TagIcon, CheckCircle2 } from 'lucide-vue-next';
import BaseBadge from '@/components/base/BaseBadge.vue'

interface Props {
  version: string;
  date: string;
  features: string[];
}

defineProps<Props>();
</script>
