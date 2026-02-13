<template>
  <div class="h-full bg-card border border-border rounded-2xl flex flex-col relative overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm">
    
    <!-- Clean Search Header -->
    <div class="p-3 border-b border-border/40 bg-card/80 backdrop-blur-md z-20 sticky top-0">
      <BaseInput
        v-model="searchQuery"
        placeholder="Search tools..."
        class="text-xs bg-muted/30 rounded-lg focus:bg-background border-transparent focus:border-primary/30 transition-all overflow-clip"
        :icon="Search"
      >
        <template #suffix v-if="searchQuery">
             <button @click="searchQuery = ''" class="text-muted-foreground hover:text-foreground p-1"><X class="size-3" /></button>
        </template>
      </BaseInput>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-3 relative bg-background/30 scroll-mask">
       <Transition name="fade" mode="out-in">
         <div v-if="filteredCategories.length === 0" class="h-full flex flex-col items-center justify-center text-muted-foreground/50 p-6">
            <SearchX class="size-10 mb-3 opacity-30" />
            <p class="text-sm font-medium">No results found</p>
         </div>
         
         <div v-else class="space-y-6">
            <div v-for="category in filteredCategories" :key="category.title">
               <div class="px-1 mb-2 flex items-center gap-2 opacity-60">
                 <span class="text-[10px] font-bold text-foreground uppercase tracking-widest">{{ category.title }}</span>
                 <div class="h-px bg-border flex-1"></div>
               </div>
               
               <!-- Responsive Grid -->
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <component
                     :is="item.badge === 'soon' ? 'div' : 'RouterLink'"
                     v-for="item in category.items" 
                     :key="item.id"
                     :to="item.path"
                     class="group/card relative flex flex-col gap-2 p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-accent/5 hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden"
                     :class="{ 'opacity-60 grayscale cursor-not-allowed': item.badge === 'soon' }"
                  >
                     <!-- Content -->
                     <div class="relative z-10 flex items-start justify-between">
                         <div class="size-8 rounded-lg bg-background border border-border/50 shadow-sm flex items-center justify-center text-muted-foreground group-hover/card:text-primary group-hover/card:scale-110 transition-all duration-300">
                              <component :is="item.icon" class="size-4" />
                         </div>
                         <BaseBadge v-if="item.badge" :variant="getBadgeVariant(item.badge)" :text="item.badge" size="xs" class="shadow-none backdrop-blur-sm" />
                     </div>

                     <div class="relative z-10 space-y-0.5">
                        <span class="font-semibold text-sm text-foreground group-hover/card:text-primary transition-colors block truncate">
                            {{ item.name }}
                        </span>
                        <p class="text-[11px] text-muted-foreground leading-tight line-clamp-2 min-h-[2.2em]">
                            {{ item.description }}
                        </p>
                     </div>
                  </component>
               </div>
            </div>
         </div>
       </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, X, SearchX } from 'lucide-vue-next'
import { useHomeNavigation } from '../composables/useHomeNavigation'
import { BaseBadge, BaseInput } from '@components/ui'
import { filterByQuery } from '@shared/utils/string/queryFilter'

const { categories } = useHomeNavigation()
const searchQuery = ref('')

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  return categories.value.map(cat => ({
    ...cat,
    items: filterByQuery(cat.items, searchQuery.value, ['name', 'description', 'keywords'])
  })).filter(cat => cat.items.length > 0)
})

const getBadgeVariant = (badge: string) => {
  switch(badge) {
    case 'new': return 'new' 
    case 'beta': return 'warning'
    case 'soon': return 'outline'
    default: return 'outline'
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scroll-mask { mask-image: linear-gradient(to bottom, black 95%, transparent 100%); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: oklch(var(--color-border)); border-radius: 4px; }
</style>