<template>
  <BaseCard
    title="Palettes"
    class="h-[300px]">
    <template #head>
      <div class="flex gap-2">
        <div class="h-8 w-16 bg-muted rounded animate-pulse"></div>
        <div class="h-8 w-16 bg-muted rounded animate-pulse"></div>
      </div>
    </template>

    <template #header>
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 bg-muted rounded animate-pulse"></div>
        <div class="h-8 w-8 bg-muted rounded animate-pulse"></div>
        <div class="h-8 w-8 bg-muted rounded animate-pulse"></div>
      </div>
    </template>

    <div class="space-y-3 mt-2">
      <div class="flex items-center justify-between">
        <div class="h-4 w-24 bg-muted rounded animate-pulse"></div>
        <div class="h-3 w-16 bg-muted rounded animate-pulse"></div>
      </div>

      <div class="grid grid-cols-5 gap-2">
        <div class="w-full aspect-square bg-muted rounded animate-pulse"></div>
        <div class="w-full aspect-square bg-muted rounded animate-pulse"></div>
        <div class="w-full aspect-square bg-muted rounded animate-pulse"></div>
        <div class="w-full aspect-square bg-muted rounded animate-pulse"></div>
        <div class="w-full aspect-square bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard } from '@components/ui'
</script>
