<template>
  <div class="h-full bg-card border border-border rounded-2xl flex flex-col relative overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm">
    
    <!-- Bold Header -->
    <div class="px-5 py-4 border-b border-border/40 bg-card/80 backdrop-blur-md z-20 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 bg-primary/10 rounded-md border border-primary/10">
             <LayoutGrid class="size-3.5 text-primary" />
          </div>
          <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Library</span>
        </div>
        <BaseBadge variant="outline" :text="`${totalFilteredTools}`" size="xs" />
      </div>
      
      <BaseInput
        v-model="searchQuery"
        placeholder="Search for tool..."
        class="h-9 text-xs bg-muted/30 focus:bg-background transition-colors"
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
         
         <div v-else class="space-y-6 pt-2">
            <div v-for="category in filteredCategories" :key="category.title">
               <div class="px-2 mb-3 flex items-center gap-3">
                 <span class="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">{{ category.title }}</span>
                 <div class="h-px bg-border/50 flex-1"></div>
               </div>
               
               <!-- Card Grid -->
               <div class="grid grid-cols-1 gap-2">
                  <component
                     :is="item.badge === 'soon' ? 'div' : 'RouterLink'"
                     v-for="item in category.items" 
                     :key="item.id"
                     :to="item.path"
                     class="group/item relative flex items-center gap-3 p-3 rounded-xl border border-transparent bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                     :class="{ 'opacity-50 grayscale cursor-not-allowed': item.badge === 'soon' }"
                  >
                     <div class="size-10 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/5 transition-colors border border-border/20">
                          <component :is="item.icon" class="size-4" />
                     </div>

                     <div class="flex-1 min-w-0">
                         <div class="flex items-center justify-between mb-0.5">
                            <span class="font-semibold text-sm text-foreground group-hover/item:text-primary transition-colors truncate">{{ item.name }}</span>
                            <BaseBadge v-if="item.badge" :variant="getBadgeVariant(item.badge)" :text="item.badge" size="xs" />
                         </div>
                         <p class="text-[12px] text-muted-foreground line-clamp-1">{{ item.description }}</p>
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
import { LayoutGrid, Search, X, SearchX } from 'lucide-vue-next'
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

const totalFilteredTools = computed(() => filteredCategories.value.reduce((acc, cat) => acc + cat.items.length, 0))

const getBadgeVariant = (badge: string) => {
  switch(badge) {
    case 'new': return 'default' 
    case 'beta': return 'warning'
    default: return 'outline'
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scroll-mask { mask-image: linear-gradient(to bottom, black 90%, transparent 100%); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: oklch(var(--color-border)); border-radius: 4px; }
</style>