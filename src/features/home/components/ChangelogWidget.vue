<template>
  <div class="h-full bg-card border border-border rounded-2xl flex flex-col relative overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm">
    
    <!-- Header -->
    <div class="px-5 py-4 border-b border-border/10 bg-card/50 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="p-1.5 bg-primary/10 rounded-md">
           <Sparkles class="size-3.5 text-primary" />
        </div>
        <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Updates</span>
      </div>
      
      <div class="flex items-center border border-border bg-background/50 rounded-lg overflow-hidden shadow-sm h-7">
         <BaseButton variant="ghost" size="icon" class="h-full w-8 rounded-none hover:bg-muted" v-tippy="'Check Update'" @click="handleCheckUpdate">
            <RefreshCw class="size-3.5" :class="{ 'animate-spin': isChecking }" />
         </BaseButton>
         <div class="w-px h-4 bg-border/60"></div>
         <BaseButton variant="ghost" size="icon" class="h-full w-8 rounded-none hover:bg-muted" v-tippy="'History'" @click="openHistoryModal">
            <History class="size-3.5" />
         </BaseButton>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar z-10 scroll-mask space-y-4">
      
      <div v-for="update in recentUpdates" :key="update.version" class="space-y-3">
        <!-- Version Card Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
               <span class="text-md font-bold text-foreground tracking-tight">v{{ update.version }}</span>
            </div>
            <span class="text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">{{ update.date }}</span>
        </div>
        
        <!-- The Inner Card: Feature List -->
        <div class="bg-muted/20 border border-border/30 rounded-xl p-4 space-y-3 hover:bg-muted/30 transition-colors">
            <div v-for="(feat, idx) in update.features.slice(0, 3)" :key="idx" class="flex items-start gap-3">
                <!-- Soft Bullet -->
                <div class="mt-1.5 size-1.5 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.5)] shrink-0"></div>
                <span class="text-xs text-muted-foreground leading-relaxed">
                  {{ feat }}
                </span>
            </div>
            
            <button 
               v-if="update.features.length > 3" 
               @click="openHistoryModal" 
               class="pt-1 text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
            >
               + {{ update.features.length - 3 }} more changes
            </button>
        </div>
      </div>
    </div>

    <!-- History Modal (Matching Style) -->
    <BaseModal id="changelog-history" v-model:open="showHistory" title="History" size="lg">
      <div class="space-y-4 pr-1">
        <div v-for="update in visibleHistory" :key="update.version" class="bg-muted/10 border border-border/40 rounded-xl p-4">
           <div class="flex justify-between items-center mb-3">
              <span class="font-bold text-sm text-foreground">v{{ update.version }}</span>
              <span class="text-xs text-muted-foreground font-mono opacity-70">{{ update.date }}</span>
           </div>
           <ul class="space-y-2">
              <li v-for="(feat, idx) in update.features" :key="idx" class="flex gap-2.5 items-start">
                 <span class="text-primary/40 text-[10px] mt-1.5">●</span>
                 <span class="text-xs text-muted-foreground leading-relaxed">{{ feat }}</span>
              </li>
           </ul>
        </div>
        
        <div v-if="hasMoreHistory" class="flex justify-center pt-2">
            <BaseButton variant="ghost" size="sm" @click="loadMoreHistory">Load Older Versions</BaseButton>
        </div>
      </div>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, RefreshCw, History } from 'lucide-vue-next'
import { BaseButton, BaseModal } from '@components/ui'
import { updates } from '@services/storage/changelog.json'
import { usePWA } from '@composables/core/usePWA'
import { useToast } from '@composables/ui/useToast'

const { checkForVersionUpdates, latestVersion: pwaVersion, updateApp } = usePWA()
const { toast } = useToast()

const recentUpdates = computed(() => updates.slice(0, 1))
const isChecking = ref(false)
const showHistory = ref(false)
const historyPageSize = 5
const visibleHistoryCount = ref(historyPageSize)

const visibleHistory = computed(() => updates.slice(0, visibleHistoryCount.value))
const hasMoreHistory = computed(() => visibleHistoryCount.value < updates.length)

const openHistoryModal = () => {
    visibleHistoryCount.value = historyPageSize
    showHistory.value = true
}

const loadMoreHistory = () => visibleHistoryCount.value += historyPageSize

const handleCheckUpdate = async () => {
  isChecking.value = true
  try {
     await checkForVersionUpdates()
     await new Promise(r => setTimeout(r, 800))
     
     if (pwaVersion.value && pwaVersion.value !== updates[0].version) {
        toast(`Version ${pwaVersion.value} is ready to install`, { 
            title: 'Update Available', 
            type: 'success',
            duration: 8000,
            action: {
                label: 'Update Now',
                onClick: () => updateApp()
            }
        })
     } else {
        toast('No new updates found', { title: 'Prism is up to date!', type: 'info' })
     }
  } catch (e) {
     toast(e as string, { title: 'Check failed', type: 'error' })
  } finally {
     isChecking.value = false
  }
}
</script>

<style scoped>
.scroll-mask {
  mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: oklch(var(--color-border)); border-radius: 4px; }
</style>