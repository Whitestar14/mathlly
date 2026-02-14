
<template>
  <div class="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-card/50 px-3 py-1.5 rounded-full border border-border/50 backdrop-blur-sm">
    <div class="flex items-center gap-1.5">
      <div class="size-2 rounded-full bg-accent/70"></div>
      <span>v{{ version }}</span>
    </div>
    <div class="w-px h-3 bg-border"></div>
    <div class="tabular-nums">
      {{ timeDisplay }}
    </div>
    <div class="hidden sm:block w-px h-3 bg-border"></div>
    <div class="hidden sm:flex items-center gap-1.5">
      <Wifi v-if="isOnline" class="size-3" />
      <WifiOff v-else class="size-3 text-destructive" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Wifi, WifiOff } from 'lucide-vue-next'
import { useNetwork } from '@vueuse/core'
import { useVersionStore } from '@stores/version'

const { isOnline } = useNetwork()
const versionStore = useVersionStore()
const version = versionStore.versionInfo.full
const timeDisplay = ref('')
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
